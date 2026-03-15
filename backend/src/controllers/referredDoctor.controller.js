const ReferredDoctor = require('../models/ReferredDoctor.model');

exports.getAll = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { q } = req.query;
    const query = { clinic: clinicId };
    if (q) query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { address: { $regex: q, $options: 'i' } },
    ];
    const doctors = await ReferredDoctor.find(query).sort({ name: 1 }).limit(50);
    res.json({ doctors });
  } catch(err){ next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { name, type, qualification, address, city, phone, regNo, specialization } = req.body;
    // Check for duplicate
    const existing = await ReferredDoctor.findOne({ clinic: clinicId, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ error: 'Doctor with this name already saved' });
    const doc = await ReferredDoctor.create({ clinic: clinicId, name, type, qualification, address, city, phone, regNo, specialization });
    res.status(201).json({ doctor: doc });
  } catch(err){ next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const doc = await ReferredDoctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ doctor: doc });
  } catch(err){ next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await ReferredDoctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch(err){ next(err); }
};

// Admin: get all referred doctors across all clinics with patient count
exports.getAllAdmin = async (req, res, next) => {
  try {
    const Patient = require('../models/Patient.model');
    // Aggregate from Patient model - referredDoctor.name
    const results = await Patient.aggregate([
      { $match: { 'referredDoctor.name': { $exists: true, $ne: '' } } },
      { $group: {
          _id: '$referredDoctor.name',
          name:          { $first: '$referredDoctor.name' },
          type:          { $first: '$referredDoctor.type' },
          qualification: { $first: '$referredDoctor.qualification' },
          phone:         { $first: '$referredDoctor.phone' },
          city:          { $first: '$referredDoctor.city' },
          address:       { $first: '$referredDoctor.address' },
          patientCount:  { $sum: 1 },
          lastReferral:  { $max: '$createdAt' },
        }
      },
      { $sort: { patientCount: -1 } },
      { $limit: 50 },
    ]);
    res.json({ doctors: results });
  } catch(err){ next(err); }
};
