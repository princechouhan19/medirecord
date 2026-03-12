const FForm = require('../models/FForm.model');

exports.getAll = async (req, res, next) => {
  try {
    // Scope to clinic if not superadmin
    const query = req.user.role !== 'superadmin' && req.user.clinic 
      ? { clinic: req.user.clinic } 
      : {};
    const forms = await FForm.find(query)
      .populate('patient', 'name age gender phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ forms });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const form = await FForm.findById(req.params.id)
      .populate('patient', 'name age gender phone aadhaar address')
      .populate('createdBy', 'name')
      .populate('clinic', 'name address phone');
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json({ form });
  } catch (err) { next(err); }
};

exports.getByPatient = async (req, res, next) => {
  try {
    const forms = await FForm.find({ patient: req.params.patientId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ forms });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const clinic = req.user.clinic || null;
    const form = await FForm.create({ ...req.body, createdBy: req.user._id, clinic });
    await form.populate('patient', 'name age gender phone');
    await form.populate('createdBy', 'name');
    res.status(201).json({ form });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const form = await FForm.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name age gender phone')
      .populate('createdBy', 'name');
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json({ form });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await FForm.findByIdAndDelete(req.params.id);
    res.json({ message: 'Form deleted' });
  } catch (err) { next(err); }
};
