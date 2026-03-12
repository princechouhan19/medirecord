const Report = require('../models/Report.model');

exports.getAll = async (req, res, next) => {
  try {
    const reports = await Report.find().populate('patient', 'name age gender').sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('patient');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const report = await Report.create({ ...req.body, createdBy: req.user._id });
    await report.populate('patient', 'name age gender');
    res.status(201).json({ report });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (err) { next(err); }
};

exports.getCount = async (req, res, next) => {
  try {
    const count = await Report.countDocuments();
    res.json({ count });
  } catch (err) { next(err); }
};
