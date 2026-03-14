const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('clinic', 'name isActive subscription pndtRegNo testCategories');
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Any clinic staff (not superadmin)
const requireClinicAccess = (req, res, next) => {
  if (req.user.role === 'superadmin') return next();
  if (!req.user.clinic) return res.status(403).json({ error: 'No clinic assigned' });
  next();
};

module.exports = { authenticate, requireRole, requireClinicAccess };
