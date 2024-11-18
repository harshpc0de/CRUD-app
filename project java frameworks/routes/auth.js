const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ googleId: profile.id }, (err, existingUser) => {
    if (existingUser) return done(err, existingUser);
    const newUser = new User({ username: profile.displayName, googleId: profile.id });
    newUser.save(err => done(err, newUser));
  });
}));

// Local authentication routes
router.post('/register', (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) return res.status(500).send(err);
    passport.authenticate('local')(req, res, () => res.redirect('/items'));
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/items',
  failureRedirect: '/'
}));

router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send(err);
    res.redirect('/');
  });
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/items')
);

module.exports = router;
