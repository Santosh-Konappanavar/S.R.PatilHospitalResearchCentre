const router = require('express').Router();
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, isAdmin, async (req, res) => {
  try { res.json(await User.find({ role: 'department' }).populate('department').sort('-createdAt')); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/permissions', protect, isAdmin, async (req, res) => {
  try { res.json(await User.findByIdAndUpdate(req.params.id, { permissions: req.body }, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/toggle', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: 'User deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

