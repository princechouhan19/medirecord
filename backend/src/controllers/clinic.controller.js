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

// ── Logo + Discount Settings ─────────────────────────────────────────
exports.updateLogoAndSettings = async (req, res, next) => {
  try {
    const {
      logoUrl, logoFileId, ownerProfileImage, ownerProfileFileId, discountRoles,
      gstEnabled, gstin, gstType, cgstPercent, sgstPercent, igstPercent,
    } = req.body;
    const clinic = await require('../models/Clinic.model').findById(req.user.clinic);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    if (logoUrl !== undefined)            clinic.logoUrl = logoUrl;
    if (logoFileId !== undefined)         clinic.logoFileId = logoFileId;
    if (ownerProfileImage !== undefined)  clinic.ownerProfileImage = ownerProfileImage;
    if (ownerProfileFileId !== undefined) clinic.ownerProfileFileId = ownerProfileFileId;
    if (discountRoles !== undefined)      clinic.settings.discountRoles = discountRoles;
    // GST settings
    if (!clinic.gstSettings) clinic.gstSettings = {};
    if (gstEnabled !== undefined)    clinic.gstSettings.enabled     = gstEnabled;
    if (gstin !== undefined)         clinic.gstSettings.gstin        = gstin;
    if (gstType !== undefined)       clinic.gstSettings.gstType      = gstType;
    if (cgstPercent !== undefined)   clinic.gstSettings.cgstPercent  = cgstPercent;
    if (sgstPercent !== undefined)   clinic.gstSettings.sgstPercent  = sgstPercent;
    if (igstPercent !== undefined)   clinic.gstSettings.igstPercent  = igstPercent;
    await clinic.save();
    res.json({ clinic });
  } catch(err){ next(err); }
};

// ── Branch Management ─────────────────────────────────────────────────
exports.addBranch = async (req, res, next) => {
  try {
    const Clinic = require('../models/Clinic.model');
    const User   = require('../models/User.model');
    const parentId = req.user.clinic?._id || req.user.clinic;
    const parent   = await Clinic.findById(parentId);
    if (!parent) return res.status(404).json({ error: 'Parent clinic not found' });

    const { name, branchName, address, city, state, phone, email,
            ownerName, ownerEmail, ownerPassword, ownerPhone } = req.body;

    // Create branch owner account
    const existing = await User.findOne({ email: ownerEmail });
    if (existing) return res.status(400).json({ error: 'Owner email already in use' });

    const branchOwner = await User.create({
      name: ownerName, email: ownerEmail, password: ownerPassword,
      phone: ownerPhone||'', role: 'clinic_owner',
    });

    // Create branch clinic (inherits test categories + subscription from parent)
    const branch = await Clinic.create({
      name: name || parent.name,
      branchName: branchName || '',
      owner: branchOwner._id,
      parentClinic: parentId,
      isBranch: true,
      address, city, state, phone, email,
      testCategories: parent.testCategories,           // inherit parent's test fees
      subscription: { ...parent.subscription.toObject() }, // inherit subscription
      isActive: true,
    });

    branchOwner.clinic = branch._id;
    await branchOwner.save();

    res.status(201).json({ branch });
  } catch(err){ next(err); }
};

exports.getBranches = async (req, res, next) => {
  try {
    const Clinic  = require('../models/Clinic.model');
    const Patient = require('../models/Patient.model');
    const Bill    = require('../models/Bill.model');
    const parentId = req.user.clinic?._id || req.user.clinic;

    const branches = await Clinic.find({ parentClinic: parentId })
      .populate('owner', 'name email');

    // Attach stats per branch
    const withStats = await Promise.all(branches.map(async b => {
      const [patients, revenue] = await Promise.all([
        Patient.countDocuments({ clinic: b._id }),
        Bill.aggregate([
          { $match: { clinic: b._id, isPaid: true } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
      ]);
      return {
        ...b.toObject(),
        _patientCount: patients,
        _revenue: revenue[0]?.total || 0,
      };
    }));

    // Also get parent's own stats
    const [parentPatients, parentRevenue] = await Promise.all([
      Patient.countDocuments({ clinic: parentId }),
      Bill.aggregate([
        { $match: { clinic: parentId, isPaid: true } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
    ]);

    res.json({
      branches: withStats,
      parentStats: {
        patients: parentPatients,
        revenue:  parentRevenue[0]?.total || 0,
      },
      totalRevenue: withStats.reduce((s,b) => s + b._revenue, 0) + (parentRevenue[0]?.total || 0),
      totalPatients: withStats.reduce((s,b) => s + b._patientCount, 0) + parentPatients,
    });
  } catch(err){ next(err); }
};

// Superadmin: view all branches of a clinic
exports.getClinicBranches = async (req, res, next) => {
  try {
    const Clinic = require('../models/Clinic.model');
    const branches = await Clinic.find({ parentClinic: req.params.id }).populate('owner','name email');
    res.json({ branches });
  } catch(err){ next(err); }
};
