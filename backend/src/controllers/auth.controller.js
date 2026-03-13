const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Clinic = require('../models/Clinic.model');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, profileImage, profileImageFileId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const user = await User.create({ 
      name, email, password, phone: phone || '', role: 'staff',
      profileImage: profileImage || '',
      profileImageFileId: profileImageFileId || ''
    });
    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('clinic', 'name isActive subscription');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact your administrator.' });
    }
    if (user.clinic && !user.clinic.isActive) {
      return res.status(403).json({ error: 'Your clinic account is suspended. Contact support.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('clinic', 'name logo isActive subscription');
  res.json({ user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage, profileImageFileId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete old image from ImageKit if it's being replaced
    if (profileImageFileId && user.profileImageFileId && profileImageFileId !== user.profileImageFileId) {
      try {
        const imagekit = require('../config/imagekit');
        await imagekit.deleteFile(user.profileImageFileId);
      } catch (err) {
        console.error('Failed to delete old imagekit file', err);
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (profileImageFileId !== undefined) updates.profileImageFileId = profileImageFileId;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { $set: updates }, 
      { new: true, runValidators: false }
    );
    
    res.json({ user: updatedUser });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

// Superadmin: create first superadmin (one-time setup)
exports.createSuperAdmin = async (req, res, next) => {
  try {
    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) return res.status(400).json({ error: 'Superadmin already exists' });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'superadmin' });
    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};
