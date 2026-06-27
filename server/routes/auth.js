const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const user = await User.findOne({ username: username.toLowerCase().trim() }).populate('department');
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;