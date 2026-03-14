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
    const { ownerEmail, ownerName, ownerPassword, ownerPhone, plan, durationMonths, ...clinicData } = req.body;

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

    // Calculate subscription end date
    const start = new Date();
    const end = new Date();
    const months = parseInt(durationMonths) || 1;
    end.setMonth(start.getMonth() + months);

    const clinic = await Clinic.create({ 
      ...clinicData, 
      owner: owner._id,
      subscription: {
        plan: plan || 'free',
        durationMonths: months,
        startDate: start,
        endDate: end,
        status: 'active'
      }
    });

    // Link owner to clinic
    owner.clinic = clinic._id;
    await owner.save();

    await clinic.populate('owner', 'name email');
    res.status(201).json({ clinic });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { subscription, ...otherUpdates } = req.body;
    const updateData = { ...otherUpdates };

    // If subscription info is being updated, handle date recalculation if duration changed
    if (subscription) {
      const clinic = await Clinic.findById(req.params.id);
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
      
      const newSub = { ...clinic.subscription.toObject(), ...subscription };
      
      // If duration changed, recalculate end date from now
      if (subscription.durationMonths && subscription.durationMonths !== clinic.subscription.durationMonths) {
        const end = new Date();
        end.setMonth(end.getMonth() + parseInt(subscription.durationMonths));
        newSub.endDate = end;
      }
      updateData.subscription = newSub;
    }

    const clinic = await Clinic.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('owner', 'name email');
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

exports.updateMyClinic = async (req, res, next) => {
  try {
    const { name, address, city, state, phone, email, licenseNumber, specialization, pndtRegNo, logo, logoFileId } = req.body;
    const clinic = await Clinic.findById(req.user.clinic);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    if (logoFileId && clinic.logoFileId && logoFileId !== clinic.logoFileId) {
      try {
        const { getImagekit } = require('../config/imagekit');
        const imagekit = getImagekit();
        if (imagekit) await imagekit.deleteFile(clinic.logoFileId);
      } catch (err) {
        console.error('Failed to delete old clinic logo', err);
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber;
    if (specialization !== undefined) updates.specialization = specialization;
    if (pndtRegNo !== undefined) updates.pndtRegNo = pndtRegNo;
    if (logo !== undefined) updates.logo = logo;
    if (logoFileId !== undefined) updates.logoFileId = logoFileId;

    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.user.clinic,
      { $set: updates },
      { new: true, runValidators: false }
    ).populate('owner', 'name email');

    res.json({ clinic: updatedClinic });
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
      role: role || 'receptionist',
      clinic: req.user.clinic,
      profileImage: req.body.profileImage || '',
      profileImageFileId: req.body.profileImageFileId || ''
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

// ── TEST CATEGORIES (clinic owner manages fees) ───────────────────────
exports.getTestCategories = async (req, res, next) => {
  try {
    const clinic = await require('../models/Clinic.model').findById(req.user.clinic);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ testCategories: clinic.testCategories || [] });
  } catch (err) { next(err); }
};

exports.upsertTestCategory = async (req, res, next) => {
  try {
    const { name, basePrice, subTests, isActive } = req.body;
    const clinic = await require('../models/Clinic.model').findById(req.user.clinic);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    const existing = clinic.testCategories.find(t => t.name === name);
    if (existing) {
      if (basePrice !== undefined) existing.basePrice = basePrice;
      if (subTests !== undefined)  existing.subTests  = subTests;
      if (isActive !== undefined)  existing.isActive  = isActive;
    } else {
      clinic.testCategories.push({ name, basePrice: basePrice || 0, subTests: subTests || [], isActive: true });
    }
    await clinic.save();
    res.json({ testCategories: clinic.testCategories });
  } catch (err) { next(err); }
};

exports.removeTestCategory = async (req, res, next) => {
  try {
    const clinic = await require('../models/Clinic.model').findById(req.user.clinic);
    clinic.testCategories = clinic.testCategories.filter(t => t._id.toString() !== req.params.catId);
    await clinic.save();
    res.json({ testCategories: clinic.testCategories });
  } catch (err) { next(err); }
};
