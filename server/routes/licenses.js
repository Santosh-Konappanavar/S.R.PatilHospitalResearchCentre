const router = require('express').Router();
const License = require('../models/License');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { res.json(await License.find().sort('expiryDate')); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, isAdmin, async (req, res) => {
  try { res.status(201).json(await License.create({ ...req.body, addedBy: req.user._id })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  try { res.json(await License.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
  try { await License.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
