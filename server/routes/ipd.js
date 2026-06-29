const router = require('express').Router();
const IPDAdmission = require('../models/IPDAdmission');
const { protect, isAdmin, scopeForUser, enforceOwnDepartment } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    let q = {};
    if (status) q.status = status;
    const { departmentId } = scopeForUser(req);
    if (departmentId) q.department = departmentId;
    const [admissions, total] = await Promise.all([
      IPDAdmission.find(q).sort('-admissionDate').skip((page-1)*limit).limit(+limit).populate('patient','firstName lastName uhid phone gender bloodGroup'),
      IPDAdmission.countDocuments(q)
    ]);
    res.json({ admissions, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { departmentId, departmentName } = scopeForUser(req);
    if (departmentId) {
      const violation = enforceOwnDepartment(req, req.body.department);
      if (violation) return res.status(violation.status).json(violation.body);
      req.body.department = departmentId;
      req.body.departmentName = departmentName;
    }
    if (!req.body.department) return res.status(400).json({ message: 'Department is required' });
    const admission = await IPDAdmission.create({ ...req.body, registeredBy: req.user._id });
    res.status(201).json(admission);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const a = await IPDAdmission.findById(req.params.id).populate('patient');
    if (!a) return res.status(404).json({ message: 'Not found' });
    // Dept users may only view their own department's admissions.
    const { departmentId } = scopeForUser(req);
    if (departmentId && String(a.department) !== String(departmentId))
      return res.status(403).json({ message: 'Not your department' });
    res.json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { departmentId } = scopeForUser(req);
    if (departmentId) {
      const a = await IPDAdmission.findById(req.params.id);
      if (!a) return res.status(404).json({ message: 'Not found' });
      if (String(a.department) !== String(departmentId))
        return res.status(403).json({ message: 'Not your department' });
    }
    res.json(await IPDAdmission.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/note', protect, async (req, res) => {
  try {
    const a = await IPDAdmission.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    const { departmentId } = scopeForUser(req);
    if (departmentId && String(a.department) !== String(departmentId))
      return res.status(403).json({ message: 'Not your department' });
    a.nursingNotes.push({ note: req.body.note, addedBy: req.user.name });
    await a.save();
    res.json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;