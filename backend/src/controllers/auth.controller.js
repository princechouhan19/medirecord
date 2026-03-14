const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const user = await User.create({ name, email, password, phone: phone || '', role: 'receptionist' });
    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('clinic', 'name isActive testCategories pndtRegNo');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.isActive)
      return res.status(403).json({ error: 'Your account has been deactivated. Contact your administrator.' });
    if (user.clinic && !user.clinic.isActive)
      return res.status(403).json({ error: 'Your clinic account is suspended. Contact support.' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('clinic', 'name logo plan isActive testCategories pndtRegNo clinicId');
  res.json({ user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage, profileImageFileId } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (profileImageFileId !== undefined) updates.profileImageFileId = profileImageFileId;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

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
