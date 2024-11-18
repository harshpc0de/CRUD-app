const express = require('express');
const Item = require('../models/Item');
const router = express.Router();

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

// CRUD routes
router.get('/', isAuthenticated, async (req, res) => {
  const items = await Item.find({ owner: req.user._id });
  res.render('items', { items });
});

router.post('/create', isAuthenticated, async (req, res) => {
  const item = new Item({ title: req.body.title, description: req.body.description, owner: req.user._id });
  await item.save();
  res.redirect('/items');
});

router.put('/:id', isAuthenticated, async (req, res) => {
  await Item.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body);
  res.redirect('/items');
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  await Item.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  res.redirect('/items');
});

module.exports = router;
