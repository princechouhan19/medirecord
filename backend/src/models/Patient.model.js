const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Identity
  name:         { type: String, required: true, trim: true },
  aadhaar:      { type: String, trim: true, default: '' },
  age:          { type: Number, required: true },
  ageUnit:      { type: String, enum: ['years', 'months', 'days'], default: 'years' },
  gender:       { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone:        { type: String, required: true, trim: true },
  address:      { type: String, default: '' },
  husbandName:  { type: String, default: '' }, // for gynae/OBS
  lmp:          { type: Date, default: null },  // last menstrual period
  // Test / billing
  testCategory:  { type: String, required: true }, // e.g. Sonography
  testName:      { type: String, required: true },  // e.g. Obstetric USG
  testCategoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
  testId:        { type: mongoose.Schema.Types.ObjectId, default: null },
  fee:           { type: Number, default: 0 },
  isPaid:        { type: Boolean, default: false },
  paymentMode:   { type: String, enum: ['cash', 'upi', 'card', 'pending'], default: 'pending' },
  receiptNo:     { type: String, default: '' },
  // Referral doctor
  referredBy:    { type: String, default: '' },
  // Daily queue workflow
  tokenNo:       { type: Number, default: 0 },   // auto daily token
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // lab_handler
  completedAt:   { type: Date, default: null },
  notes:         { type: String, default: '' },
  reportReady:   { type: Boolean, default: false },
  // Meta
  clinic:        { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  registeredBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visitDate:     { type: Date, default: () => new Date() }, // date of this visit
}, { timestamps: true });

// Index for daily queue queries
patientSchema.index({ clinic: 1, visitDate: 1, tokenNo: 1 });
patientSchema.index({ clinic: 1, status: 1 });
patientSchema.index({ name: 'text', phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);
