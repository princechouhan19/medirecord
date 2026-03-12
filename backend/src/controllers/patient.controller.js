const Patient = require('../models/Patient.model');

exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { aadhaar: { $regex: search, $options: 'i' } },
        ]
      };
    }
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json({ patients });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const existing = await Patient.findOne({ aadhaar: req.body.aadhaar });
    if (existing) return res.status(400).json({ error: 'Aadhaar already registered' });
    const patient = await Patient.create({ ...req.body, registeredBy: req.user._id });
    res.status(201).json({ patient });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const total = await Patient.countDocuments();
    const thisWeek = await Patient.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    res.json({ total, thisWeek });
  } catch (err) { next(err); }
};
