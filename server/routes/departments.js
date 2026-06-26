const router = require('express').Router();
const Department = require('../models/Department');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { res.json(await Department.find({ isActive: true }).sort('name')); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const d = await Department.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json(d);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, isAdmin, async (req, res) => {
  try { res.status(201).json(await Department.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  try { res.json(await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
  try { await Department.findByIdAndUpdate(req.params.id, { isActive: false }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;