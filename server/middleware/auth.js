const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, login required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('department').select('-password');
    if (!req.user || !req.user.isActive) return res.status(401).json({ message: 'Not authorized' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const isAdmin = (req, res, next) => {
  if (['admin','chairman'].includes(req.user.role)) return next();
  res.status(403).json({ message: 'Admin access required' });
};

const isChairman = (req, res, next) => {
  if (req.user.role === 'chairman') return next();
  res.status(403).json({ message: 'Chairman access required' });
};

// True for accountant-role users only.
const isAccountant = (req, res, next) => {
  if (req.user.role === 'accountant') return next();
  res.status(403).json({ message: 'Accountant access required' });
};

// True for any role that can create POs: admin, chairman, accountant.
// (Chairman may create per spec — same as admin.)
const canCreatePurchase = (req, res, next) => {
  if (['admin', 'chairman', 'accountant'].includes(req.user.role)) return next();
  res.status(403).json({ message: 'Not allowed to create purchase orders' });
};

// Returns the department scope for the current user.
// Department-role users are locked to their assigned department.
// Admin/chairman get an empty scope (no scoping).
const scopeForUser = (req) => {
  if (req.user.role === 'department') {
    return {
      departmentId: req.user.department?._id || req.user.department,
      departmentName: req.user.departmentName || '',
    };
  }
  return {};
};

// Enforce that a write operation stays inside the user's own department.
// Returns null if allowed, or a 403 response object if not.
const enforceOwnDepartment = (req, bodyDepartment) => {
  if (req.user.role !== 'department') return null;
  const ownId = String(req.user.department?._id || req.user.department);
  if (!bodyDepartment || String(bodyDepartment) === ownId) return null;
  return { status: 403, body: { message: 'You can only write into your own department' } };
};

module.exports = { protect, isAdmin, isChairman, isAccountant, canCreatePurchase, scopeForUser, enforceOwnDepartment };