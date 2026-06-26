const router = require('express').Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role==='department' && !req.user.permissions.canViewPurchase)
      return res.status(403).json({ message: 'No access' });
    const { status, page=1, limit=20 } = req.query;
    let q = {};
    if (status) q.status = status;
    if (req.user.role==='department') q.department = req.user.department?._id;
    const [pos, total] = await Promise.all([
      PurchaseOrder.find(q).sort('-createdAt').skip((page-1)*limit).limit(+limit),
      PurchaseOrder.countDocuments(q)
    ]);
    res.json({ pos, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const po = await PurchaseOrder.create({ ...req.body, requestedBy: req.user._id, requestedByName: req.user.name });
    res.status(201).json(po);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, {
      status: 'Approved', approvedBy: req.user._id, approvedByName: req.user.name, approvedAt: new Date()
    }, { new: true });
    res.json(po);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/reject', protect, isAdmin, async (req, res) => {
  try { res.json(await PurchaseOrder.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  try { res.json(await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

