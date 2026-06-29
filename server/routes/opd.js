const router = require('express').Router();
const OPDVisit = require('../models/OPDVisit');
const { protect, scopeForUser, enforceOwnDepartment } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { date, page = 1, limit = 20 } = req.query;
    let q = {};
    const { departmentId } = scopeForUser(req);
    if (departmentId) q.department = departmentId;
    if (date) { const d=new Date(date); q.visitDate={ $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) }; }
    const [visits, total] = await Promise.all([
      OPDVisit.find(q).sort('-visitDate').skip((page-1)*limit).limit(+limit).populate('patient','firstName lastName uhid phone'),
      OPDVisit.countDocuments(q)
    ]);
    res.json({ visits, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { departmentId, departmentName } = scopeForUser(req);
    if (departmentId) {
      // Department users may only register visits into their own department.
      const violation = enforceOwnDepartment(req, req.body.department);
      if (violation) return res.status(violation.status).json(violation.body);
      req.body.department = departmentId;
      req.body.departmentName = departmentName;
    }
    if (!req.body.department) return res.status(400).json({ message: 'Department is required' });
    const today = new Date(); today.setHours(0,0,0,0);
    const count = await OPDVisit.countDocuments({ department: req.body.department, visitDate: { $gte: today } });
    const visit = await OPDVisit.create({ ...req.body, tokenNumber: count+1, registeredBy: req.user._id });
    res.status(201).json({ message: 'OPD registered', visit });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await OPDVisit.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats/today', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const q = { visitDate: { $gte: today } };
    const { departmentId } = scopeForUser(req);
    if (departmentId) q.department = departmentId;
    const [total, waiting, inConsultation, done] = await Promise.all([
      OPDVisit.countDocuments(q),
      OPDVisit.countDocuments({...q, status:'Waiting'}),
      OPDVisit.countDocuments({...q, status:'In-Consultation'}),
      OPDVisit.countDocuments({...q, status:'Done'}),
    ]);
    res.json({ total, waiting, inConsultation, done });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;