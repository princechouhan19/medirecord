const Patient = require('../models/Patient.model');
const ActivityLog = require('../models/ActivityLog.model');

const logActivity = async (req, action, entity, entityId, details = {}) => {
  try {
    await ActivityLog.create({
      clinic: req.user.clinic?._id || req.user.clinic,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action, entity, entityId, details,
    });
  } catch (e) { /* non-fatal */ }
};

// Get today's start/end
const todayRange = () => {
  const start = new Date(); start.setHours(0,0,0,0);
  const end   = new Date(); end.setHours(23,59,59,999);
  return { start, end };
};

// Next token number for today in this clinic
const nextToken = async (clinicId) => {
  const { start, end } = todayRange();
  const last = await Patient.findOne({
    clinic: clinicId,
    visitDate: { $gte: start, $lte: end },
  }).sort({ tokenNo: -1 });
  return (last?.tokenNo || 0) + 1;
};

// ── GET all (with search + date filter) ──────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { search, date, status } = req.query;
    const clinicId = req.user.clinic?._id || req.user.clinic;
    let query = {};

    if (req.user.role !== 'superadmin' && clinicId) query.clinic = clinicId;

    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const e = new Date(date); e.setHours(23,59,59,999);
      query.visitDate = { $gte: d, $lte: e };
    }
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { referredBy: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(query)
      .populate('registeredBy', 'name role')
      .populate('assignedTo', 'name role')
      .sort({ tokenNo: 1, createdAt: 1 });

    res.json({ patients });
  } catch (err) { next(err); }
};

// ── GET today's queue ─────────────────────────────────────────────────
exports.getTodayQueue = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { start, end } = todayRange();
    const patients = await Patient.find({
      clinic: clinicId,
      visitDate: { $gte: start, $lte: end },
    })
      .populate('registeredBy', 'name role')
      .populate('assignedTo', 'name')
      .sort({ tokenNo: 1 });

    const stats = {
      total:      patients.length,
      waiting:    patients.filter(p => p.status === 'waiting').length,
      in_progress:patients.filter(p => p.status === 'in_progress').length,
      completed:  patients.filter(p => p.status === 'completed').length,
    };
    res.json({ patients, stats });
  } catch (err) { next(err); }
};

// ── GET one ───────────────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredBy', 'name')
      .populate('assignedTo', 'name');
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) { next(err); }
};

// ── CREATE (receptionist registers) ───────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const token = await nextToken(clinicId);
    // Generate receipt no
    const receiptNo = `RC-${Date.now().toString().slice(-6)}`;

    const patient = await Patient.create({
      ...req.body,
      clinic: clinicId,
      registeredBy: req.user._id,
      tokenNo: token,
      receiptNo,
      visitDate: new Date(),
    });

    await logActivity(req, 'patient_registered', 'Patient', patient._id, {
      patientName: patient.name, testName: patient.testName, fee: patient.fee,
    });

    res.status(201).json({ patient });
  } catch (err) { next(err); }
};

// ── UPDATE STATUS (lab_handler) ────────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const update = { status };
    if (notes !== undefined) update.notes = notes;
    if (status === 'in_progress') update.assignedTo = req.user._id;
    if (status === 'completed')   { update.completedAt = new Date(); update.reportReady = true; }

    const patient = await Patient.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('registeredBy', 'name')
      .populate('assignedTo', 'name');

    if (!patient) return res.status(404).json({ error: 'Not found' });

    await logActivity(req, `patient_${status}`, 'Patient', patient._id, {
      patientName: patient.name, status,
    });

    res.json({ patient });
  } catch (err) { next(err); }
};

// ── UPDATE ────────────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json({ patient });
  } catch (err) { next(err); }
};

// ── DELETE ────────────────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── STATS ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { start, end } = todayRange();
    const [total, thisWeek, today] = await Promise.all([
      Patient.countDocuments({ clinic: clinicId }),
      Patient.countDocuments({ clinic: clinicId, createdAt: { $gte: new Date(Date.now() - 7*864e5) } }),
      Patient.countDocuments({ clinic: clinicId, visitDate: { $gte: start, $lte: end } }),
    ]);
    res.json({ total, thisWeek, today });
  } catch (err) { next(err); }
};

// ── 12-COLUMN PNDT REGISTER (like the physical form) ─────────────────
exports.getPndtRegister = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year)  || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0, 23, 59, 59);

    const patients = await Patient.find({
      clinic: clinicId,
      visitDate: { $gte: start, $lte: end },
      // PNDT includes all patients with LMP or sonography/imaging tests
      $or: [{ lmp: { $exists: true, $ne: null } }, { testCategory: { $regex: /sonography|usg|imaging|ultrasound|x-ray|ct|mri/i } }],
    }).populate('registeredBy', 'name').sort({ tokenNo: 1 });

    res.json({ patients, month: m, year: y });
  } catch (err) { next(err); }
};

// ── ACTIVITY LOG for admin ────────────────────────────────────────────
exports.getActivityLog = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { userId, date, limit = 50 } = req.query;
    const query = { clinic: clinicId };
    if (userId) query.user = userId;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const e = new Date(date); e.setHours(23,59,59,999);
      query.createdAt = { $gte: d, $lte: e };
    }
    const logs = await ActivityLog.find(query)
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ logs });
  } catch (err) { next(err); }
};

// ── GET patient with clinic info (for A4 record sheet) ─────────────────
exports.getWithClinic = async (req, res, next) => {
  try {
    const patient = await require('../models/Patient.model').findById(req.params.id)
      .populate('registeredBy', 'name role')
      .populate('assignedTo',   'name role')
      .populate('clinic', 'name address phone pndtRegNo logoUrl logo gstSettings');
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch(err){ next(err); }
};

// ── Doctor referral stats for admin/clinic owner ──────────────────────
exports.getDoctorReferralStats = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const query = {};
    if (req.user.role !== 'superadmin' && clinicId) query.clinic = clinicId;

    // Aggregate referrals by doctor name
    const stats = await require('../models/Patient.model').aggregate([
      { $match: { ...query, 'referredDoctor.name': { $exists: true, $ne: '' } } },
      { $group: {
        _id: '$referredDoctor.name',
        doctorName:     { $first: '$referredDoctor.name' },
        doctorType:     { $first: '$referredDoctor.type' },
        qualification:  { $first: '$referredDoctor.qualification' },
        address:        { $first: '$referredDoctor.address' },
        city:           { $first: '$referredDoctor.city' },
        phone:          { $first: '$referredDoctor.phone' },
        totalReferrals: { $sum: 1 },
        totalRevenue:   { $sum: '$fee' },
        paidRevenue:    { $sum: { $cond: ['$isPaid', '$fee', 0] } },
        lastReferral:   { $max: '$createdAt' },
      }},
      { $sort: { totalReferrals: -1 } },
      { $limit: 50 },
    ]);
    res.json({ stats });
  } catch(err){ next(err); }
};
