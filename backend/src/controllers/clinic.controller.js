const Clinic = require('../models/Clinic.model');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');

exports.getAll = async (req, res, next) => {
  try {
    const clinics = await Clinic.find().populate('owner', 'name email').sort({ createdAt: -1 });
    // Attach patient/staff counts
    const withStats = await Promise.all(clinics.map(async (c) => {
      const [patients, staff] = await Promise.all([
        Patient.countDocuments({ clinic: c._id }),
        User.countDocuments({ clinic: c._id }),
      ]);
      return { ...c.toObject(), _patientCount: patients, _staffCount: staff };
    }));
    res.json({ clinics: withStats });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate('owner', 'name email phone');
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    const [patients, staff] = await Promise.all([
      Patient.countDocuments({ clinic: clinic._id }),
      User.countDocuments({ clinic: clinic._id }),
    ]);
    res.json({ clinic: { ...clinic.toObject(), _patientCount: patients, _staffCount: staff } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { ownerEmail, ownerName, ownerPassword, ownerPhone, ...clinicData } = req.body;

    // Create owner user
    const existingUser = await User.findOne({ email: ownerEmail });
    if (existingUser) return res.status(400).json({ error: 'Owner email already exists' });

    const owner = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      phone: ownerPhone || '',
      role: 'clinic_owner',
    });

    const clinic = await Clinic.create({ ...clinicData, owner: owner._id });

    // Link owner to clinic
    owner.clinic = clinic._id;
    await owner.save();

    await clinic.populate('owner', 'name email');
    res.status(201).json({ clinic });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner', 'name email');
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ clinic });
  } catch (err) { next(err); }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    clinic.isActive = !clinic.isActive;
    await clinic.save();
    // Also deactivate all staff
    await User.updateMany({ clinic: clinic._id }, { isActive: clinic.isActive });
    res.json({ clinic });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const [totalClinics, activeClinics, totalPatients, totalUsers] = await Promise.all([
      Clinic.countDocuments(),
      Clinic.countDocuments({ isActive: true }),
      Patient.countDocuments(),
      User.countDocuments({ role: { $ne: 'superadmin' } }),
    ]);
    res.json({ totalClinics, activeClinics, totalPatients, totalUsers });
  } catch (err) { next(err); }
};

exports.getMyClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.user.clinic).populate('owner', 'name email phone');
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    const [patients, staff] = await Promise.all([
      Patient.countDocuments({ clinic: clinic._id }),
      User.countDocuments({ clinic: clinic._id }),
    ]);
    res.json({ clinic: { ...clinic.toObject(), _patientCount: patients, _staffCount: staff } });
  } catch (err) { next(err); }
};

exports.getMyStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ clinic: req.user.clinic, role: { $ne: 'superadmin' } })
      .select('-password').sort({ createdAt: -1 });
    res.json({ staff });
  } catch (err) { next(err); }
};

exports.addStaff = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const staff = await User.create({
      name, email, password, phone: phone || '',
      role: role || 'staff',
      clinic: req.user.clinic,
    });
    res.status(201).json({ staff });
  } catch (err) { next(err); }
};

exports.removeStaff = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, clinic: req.user.clinic });
    if (!user) return res.status(404).json({ error: 'Staff not found' });
    if (user.role === 'clinic_owner') return res.status(403).json({ error: 'Cannot remove clinic owner' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (err) { next(err); }
};
