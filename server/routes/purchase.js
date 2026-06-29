const router = require('express').Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const { protect, isAdmin, canCreatePurchase } = require('../middleware/auth');
const { renderPOPDF } = require('../utils/pdf');

// Helpers — scope a query based on the user's role.
const scopeFilter = (req) => {
  if (req.user.role === 'department') return { department: req.user.department?._id };
  return {};
};

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'department' && !req.user.permissions?.canViewPurchase)
      return res.status(403).json({ message: 'No access' });
    const { status, page = 1, limit = 20 } = req.query;
    const q = { ...scopeFilter(req) };
    if (status) q.status = status;
    const [pos, total] = await Promise.all([
      PurchaseOrder.find(q).sort('-createdAt').skip((page - 1) * limit).limit(+limit),
      PurchaseOrder.countDocuments(q),
    ]);
    res.json({ pos, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// JSON dump (full filtered list, no pagination). Same scoping as GET /.
router.get('/export.json', protect, async (req, res) => {
  try {
    if (req.user.role === 'department' && !req.user.permissions?.canViewPurchase)
      return res.status(403).json({ message: 'No access' });
    const { status } = req.query;
    const q = { ...scopeFilter(req) };
    if (status) q.status = status;
    const pos = await PurchaseOrder.find(q).sort('-createdAt');
    res.setHeader('Content-Disposition', `attachment; filename="purchase-orders-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json({ exportedAt: new Date().toISOString(), count: pos.length, purchaseOrders: pos });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create — admin, chairman, or accountant.
router.post('/', protect, canCreatePurchase, async (req, res) => {
  try {
    const po = await PurchaseOrder.create({
      ...req.body,
      requestedBy: req.user._id,
      requestedByName: req.user.name,
    });
    res.status(201).json(po);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Approve / reject — admin or chairman only.
router.put('/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, {
      status: 'Approved',
      approvedBy: req.user._id,
      approvedByName: req.user.name,
      approvedAt: new Date(),
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

// Download PDF — auth-protected, scope-checked.
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    if (req.user.role === 'department' && !req.user.permissions?.canViewPurchase)
      return res.status(403).json({ message: 'No access' });
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'department' &&
        String(po.department) !== String(req.user.department?._id))
      return res.status(403).json({ message: 'No access to this PO' });
    renderPOPDF(po, res);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;