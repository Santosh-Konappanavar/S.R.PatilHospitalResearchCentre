const router = require('express').Router();
const Staff = require('../models/Staff');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role==='department' && !req.user.permissions.canViewStaff)
      return res.status(403).json({ message: 'No access to staff list' });
    const { search='', role, page=1, limit=20 } = req.query;
    let q = {};
    if (search) q.$or = [{ name: new RegExp(search,'i') }, { employeeId: new RegExp(search,'i') }];
    if (role) q.role = role;
    if (req.user.role==='department') q.department = req.user.department?._id;
    const [staff, total] = await Promise.all([
      Staff.find(q).sort('-createdAt').skip((page-1)*limit).limit(+limit),
      Staff.countDocuments(q)
    ]);
    res.json({ staff, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, isAdmin, async (req, res) => {
  try { res.status(201).json(await Staff.create({ ...req.body, addedBy: req.user._id })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  try { res.json(await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
  try { await Staff.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

