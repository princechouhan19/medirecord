const Bill    = require('../models/Bill.model');
const Patient = require('../models/Patient.model');
const Clinic  = require('../models/Clinic.model');

exports.getAll = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { date, patientId } = req.query;
    const query = { clinic: clinicId };
    if (patientId) query.patient = patientId;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const e = new Date(date); e.setHours(23,59,59,999);
      query.createdAt = { $gte: d, $lte: e };
    }
    const bills = await Bill.find(query)
      .populate('patient','name age gender phone')
      .populate('createdBy','name role')
      .sort({ createdAt: -1 });
    res.json({ bills });
  } catch(err){ next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient','name age gender phone address husbandName')
      .populate('clinic','name address phone logo logoUrl gstSettings pndtRegNo')
      .populate('createdBy','name');
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ bill });
  } catch(err){ next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const { patient, items, discountType, discountValue, isPaid, paymentMode, notes } = req.body;

    // Check if user is allowed to give discount
    const clinic = await Clinic.findById(clinicId);
    const canDiscount = req.user.role === 'clinic_owner' ||
      (clinic?.settings?.discountRoles || []).includes(req.user.role);
    const dVal = canDiscount ? (discountValue || 0) : 0;

    const bill = await Bill.create({
      patient, clinic: clinicId,
      items: items || [],
      discountType: discountType || 'flat',
      discountValue: dVal,
      isPaid: isPaid || false,
      paymentMode: paymentMode || 'cash',
      notes: notes || '',
      createdBy: req.user._id,
    });
    await bill.populate('patient','name age gender phone');
    res.status(201).json({ bill });
  } catch(err){ next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false })
      .populate('patient','name age gender phone');
    if (!bill) return res.status(404).json({ error: 'Not found' });
    // Recalculate manually
    bill.subtotal = bill.items.reduce((s,i) => s + i.amount, 0);
    bill.discountAmt = bill.discountType === 'percent'
      ? Math.round(bill.subtotal * bill.discountValue / 100)
      : Math.min(bill.discountValue, bill.subtotal);
    bill.total = Math.max(0, bill.subtotal - bill.discountAmt);
    await bill.save();
    res.json({ bill });
  } catch(err){ next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch(err){ next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic?._id || req.user.clinic;
    const today = new Date(); today.setHours(0,0,0,0);
    const [todayBills, totalRevenue] = await Promise.all([
      Bill.find({ clinic: clinicId, createdAt: { $gte: today }, isPaid: true }),
      Bill.aggregate([{ $match:{ clinic: clinicId, isPaid:true } }, { $group:{ _id:null, total:{ $sum:'$total' } } }]),
    ]);
    res.json({
      todayCount:   todayBills.length,
      todayRevenue: todayBills.reduce((s,b) => s + b.total, 0),
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch(err){ next(err); }
};
