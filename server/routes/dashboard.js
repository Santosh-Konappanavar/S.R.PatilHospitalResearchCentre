const router = require('express').Router();
const { protect, isAdmin, scopeForUser } = require('../middleware/auth');
const Patient = require('../models/Patient');
const OPDVisit = require('../models/OPDVisit');
const IPDAdmission = require('../models/IPDAdmission');
const Staff = require('../models/Staff');
const PurchaseOrder = require('../models/PurchaseOrder');
const License = require('../models/License');
const Update = require('../models/Update');
const Department = require('../models/Department');

// Chairman / Admin: hospital-wide dashboard with per-department snapshot.
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
      Update.find({ isActive: true }).sort('-createdAt').limit(10),
      Department.find({ isActive: true }).sort('name'),
    ]);

    // Per-department snapshot — one round-trip per department, run in parallel.
    const departmentStats = await Promise.all(depts.map(async (d) => {
      const [opdToday, ipdAdmitted, patients, lastUpdate] = await Promise.all([
        OPDVisit.countDocuments({ department: d._id, visitDate: { $gte: today } }),
        IPDAdmission.countDocuments({ department: d._id, status: 'Admitted' }),
        Patient.countDocuments({ isActive: true }),
        Update.findOne({ isActive: true, departmentName: d.name }).sort('-createdAt'),
      ]);
      return {
        id: d._id, name: d.name, code: d.code, color: d.color,
        opdToday, ipdAdmitted,
        lastUpdate: lastUpdate ? { title: lastUpdate.title, postedByName: lastUpdate.postedByName, createdAt: lastUpdate.createdAt } : null,
      };
    }));

    res.json({
      totalPatients, todayOPD, currentIPD, totalStaff,
      pendingPOs, expiredLicenses, recentUpdates,
      totalDepartments: depts.length,
      departmentStats,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Any authenticated user — returns the user's own scope.
router.get('/me', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const { departmentId, departmentName } = scopeForUser(req);

    if (!departmentId) {
      // Admin / Chairman: mirror the main dashboard's headline stats.
      const [totalPatients, todayOPD, currentIPD] = await Promise.all([
        Patient.countDocuments({ isActive: true }),
        OPDVisit.countDocuments({ visitDate: { $gte: today } }),
        IPDAdmission.countDocuments({ status: 'Admitted' }),
      ]);
      return res.json({
        scope: 'hospital',
        departmentName: '',
        totalPatients, todayOPD, currentIPD,
      });
    }

    const [opdToday, ipdAdmitted, updatesToday, myStaffCount] = await Promise.all([
      OPDVisit.countDocuments({ department: departmentId, visitDate: { $gte: today } }),
      IPDAdmission.countDocuments({ department: departmentId, status: 'Admitted' }),
      Update.countDocuments({ departmentName, createdAt: { $gte: today } }),
      Staff.countDocuments({ department: departmentId, status: 'Active' }),
    ]);

    res.json({
      scope: 'department',
      departmentId,
      departmentName,
      opdToday, ipdAdmitted, updatesToday, myStaffCount,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;