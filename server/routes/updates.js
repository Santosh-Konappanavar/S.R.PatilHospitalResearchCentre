const router = require('express').Router();
const Update = require('../models/Update');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { res.json(await Update.find({ isActive: true }).sort('-createdAt').limit(50)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const update = await Update.create({
      title: req.body.title, content: req.body.content, type: req.body.type || 'general',
      departmentName: req.user.departmentName || req.user.name,
      postedBy: req.user._id, postedByName: req.user.name
    });
    res.status(201).json(update);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
  try { await Update.findByIdAndUpdate(req.params.id, { isActive: false }); res.json({ message: 'Removed' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
