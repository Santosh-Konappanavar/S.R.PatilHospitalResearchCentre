const router = require('express').Router();
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const q = search ? { isActive: true, $or: [
      { firstName: new RegExp(search,'i') }, { lastName: new RegExp(search,'i') },
      { uhid: new RegExp(search,'i') }, { phone: new RegExp(search,'i') },
      { abhaNumber: new RegExp(search,'i') }
    ]} : { isActive: true };
    const [patients, total] = await Promise.all([
      Patient.find(q).sort('-createdAt').skip((page-1)*limit).limit(+limit),
      Patient.countDocuments(q)
    ]);
    res.json({ patients, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const p = await Patient.findOne({ $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { uhid: req.params.id }] });
    if (!p) return res.status(404).json({ message: 'Patient not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    if (!req.body.firstName || !req.body.gender || !req.body.phone)
      return res.status(400).json({ message: 'First name, gender and phone required' });
    if (req.body.abhaNumber) {
      const ex = await Patient.findOne({ abhaNumber: req.body.abhaNumber });
      if (ex) return res.status(400).json({ message: `ABHA already registered: ${ex.firstName} ${ex.lastName} (${ex.uhid})` });
    }
    const patient = await Patient.create({ ...req.body, registeredBy: req.user._id });
    res.status(201).json({ message: 'Patient registered', patient });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
