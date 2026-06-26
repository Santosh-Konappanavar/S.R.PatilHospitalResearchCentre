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

module.exports = { protect, isAdmin, isChairman };