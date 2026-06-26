const router = require('express').Router();
const { protect, isAdmin } = require('../middleware/auth');
const Patient = require('../models/Patient');
const OPDVisit = require('../models/OPDVisit');
const IPDAdmission = require('../models/IPDAdmission');
const Staff = require('../models/Staff');
const PurchaseOrder = require('../models/PurchaseOrder');
const License = require('../models/License');
const Update = require('../models/Update');
const Department = require('../models/Department');

router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const [
      totalPatients, todayOPD, currentIPD, totalStaff,
      pendingPOs, expiredLicenses, recentUpdates, depts
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      OPDVisit.countDocuments({ visitDate: { $gte: today } }),
      IPDAdmission.countDocuments({ status: 'Admitted' }),
      Staff.countDocuments({ status: 'Active' }),
      PurchaseOrder.countDocuments({ status: 'Pending' }),
      License.countDocuments({ status: 'Expired' }),
      Update.find({ isActive: true }).sort('-createdAt').limit(5),
      Department.countDocuments({ isActive: true })
    ]);
    res.json({ totalPatients, todayOPD, currentIPD, totalStaff, pendingPOs, expiredLicenses, recentUpdates, totalDepartments: depts });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
