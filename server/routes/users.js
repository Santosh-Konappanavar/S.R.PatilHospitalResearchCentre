const router = require('express').Router();
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, isAdmin, async (req, res) => {
  try { res.json(await User.find({ role: 'department' }).populate('department').sort('-createdAt')); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin / Chairman can create a department user.
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, username, password, department, email = '', phone = '', permissions = {} } = req.body;
    if (!name || !username || !password || !department)
      return res.status(400).json({ message: 'Name, username, password and department are required' });

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'Username already taken' });

    const Department = require('../models/Department');
    const dept = await Department.findById(department);
    if (!dept) return res.status(400).json({ message: 'Invalid department' });

    const user = await User.create({
      name, username, password,
      role: 'department',
      department: dept._id,
      departmentName: dept.name,
      email, phone,
      permissions: {
        canViewOPD:      !!permissions.canViewOPD,
        canViewIPD:      !!permissions.canViewIPD,
        canViewStaff:    !!permissions.canViewStaff,
        canViewReports:  !!permissions.canViewReports,
        canViewPurchase: !!permissions.canViewPurchase,
        canPostUpdates:  permissions.canPostUpdates !== false,
      },
      createdBy: req.user._id,
    });
    res.status(201).json({ message: 'Department user created', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
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