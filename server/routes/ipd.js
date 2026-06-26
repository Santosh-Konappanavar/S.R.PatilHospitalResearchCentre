const router = require('express').Router();
const IPDAdmission = require('../models/IPDAdmission');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    let q = {};
    if (status) q.status = status;
    if (req.user.role==='department' && !req.user.permissions.canViewIPD) q.department = req.user.department?._id;
    const [admissions, total] = await Promise.all([
      IPDAdmission.find(q).sort('-admissionDate').skip((page-1)*limit).limit(+limit).populate('patient','firstName lastName uhid phone gender bloodGroup'),
      IPDAdmission.countDocuments(q)
    ]);
    res.json({ admissions, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try { res.status(201).json(await IPDAdmission.create({ ...req.body, registeredBy: req.user._id })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const a = await IPDAdmission.findById(req.params.id).populate('patient');
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await IPDAdmission.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/note', protect, async (req, res) => {
  try {
    const a = await IPDAdmission.findById(req.params.id);
    a.nursingNotes.push({ note: req.body.note, addedBy: req.user.name });
    await a.save();
    res.json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
