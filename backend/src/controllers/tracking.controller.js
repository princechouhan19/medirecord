const Tracking = require('../models/Tracking.model');

const updateOverdueStatuses = async () => {
  await Tracking.updateMany(
    { nextVisit: { $lt: new Date() }, status: 'Active' },
    { status: 'Overdue' }
  );
};

exports.getAll = async (req, res, next) => {
  try {
    await updateOverdueStatuses();
    const trackings = await Tracking.find({ status: { $ne: 'Completed' } })
      .populate('patient', 'name age gender')
      .sort({ nextVisit: 1 });
    res.json({ trackings });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const tracking = await Tracking.create({ ...req.body, createdBy: req.user._id });
    await tracking.populate('patient', 'name age gender');
    res.status(201).json({ tracking });
  } catch (err) { next(err); }
};

exports.addVisit = async (req, res, next) => {
  try {
    const tracking = await Tracking.findById(req.params.id);
    if (!tracking) return res.status(404).json({ error: 'Tracking not found' });
    tracking.visitHistory.push(req.body);
    if (req.body.nextVisit) { tracking.nextVisit = req.body.nextVisit; tracking.status = 'Active'; }
    await tracking.save();
    res.json({ tracking });
  } catch (err) { next(err); }
};

exports.complete = async (req, res, next) => {
  try {
    const tracking = await Tracking.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    res.json({ tracking });
  } catch (err) { next(err); }
};

exports.getScheduleStats = async (req, res, next) => {
  try {
    await updateOverdueStatuses();
    const upcoming = await Tracking.countDocuments({ nextVisit: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, status: 'Active' });
    const overdue = await Tracking.countDocuments({ status: 'Overdue' });
    res.json({ upcoming, overdue });
  } catch (err) { next(err); }
};
