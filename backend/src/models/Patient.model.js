const mongoose = require('mongoose');

// Referred doctor details (saved & reusable)
const referredDoctorSchema = new mongoose.Schema({
  name:    { type: String, default: '' },
  type:    { type: String, enum: ['Doctor','Genetic Counselling Centre','Self Referral','Other'], default: 'Doctor' },
  qualification: { type: String, default: '' },
  address: { type: String, default: '' },
  phone:   { type: String, default: '' },
  regNo:   { type: String, default: '' }, // medical reg number
}, { _id: false });

const patientSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────────────────────────
  name:         { type: String, required: true, trim: true },
  dob:          { type: Date,   default: null },   // date of birth
  age:          { type: Number, required: true },
  ageUnit:      { type: String, enum: ['years','months','days'], default: 'years' },
  gender:       { type: String, enum: ['Male','Female','Other'], required: true },
  phone:        { type: String, required: true, trim: true },
  email:        { type: String, default: '' },

  // ── Residential ─────────────────────────────────────────────────────
  address:      { type: String, default: '' },
  district:     { type: String, default: '' },
  state:        { type: String, default: '' },
  areaType:     { type: String, enum: ['Rural','Urban'], default: 'Urban' },

  // ── Family relation (multi-option as per govt form) ─────────────────
  // Most relevant relative name (radio: husband/wife/father/mother/guardian)
  relationType: { type: String, enum: ['Husband','Wife','Father','Mother','Guardian','Self'], default: 'Husband' },
  relativeName: { type: String, default: '' },

  // ── Number of living children ────────────────────────────────────────
  livingChildrenMale:   { type: Number, default: 0 },
  livingChildrenFemale: { type: Number, default: 0 },
  livingChildrenMaleAge:   { type: String, default: '' }, // e.g. "5,7,9"
  livingChildrenFemaleAge: { type: String, default: '' },

  // ── ID Proof ─────────────────────────────────────────────────────────
  idProofType:    { type: String, default: '' },   // Aadhaar, PAN, Voter ID...
  idProofNo:      { type: String, default: '' },
  idProofFront:   { type: String, default: '' },   // ImageKit URL
  idProofFrontId: { type: String, default: '' },
  idProofBack:    { type: String, default: '' },
  idProofBackId:  { type: String, default: '' },

  // ── Referral ─────────────────────────────────────────────────────────
  referredBy:      { type: String, default: '' },      // legacy text field
  referredDoctor:  { type: referredDoctorSchema, default: () => ({}) },
  referralSlip:    { type: String, default: '' },      // ImageKit URL of referral slip scan
  referralSlipId:  { type: String, default: '' },

  // ── Pregnancy specific ───────────────────────────────────────────────
  lmp:             { type: Date,   default: null },     // last menstrual period
  weeksOfPregnancy:{ type: Number, default: null },
  daysOfPregnancy: { type: Number, default: null },
  edd:             { type: Date,   default: null },     // estimated due date
  patientRegDate:  { type: Date,   default: null },     // PNDT patient registration date
  pctsId:          { type: String, default: '' },       // PCTS ID (govt system)

  // ── Test / billing ───────────────────────────────────────────────────
  testCategory:    { type: String, required: true },
  testName:        { type: String, required: true },
  testCategoryId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  testId:          { type: mongoose.Schema.Types.ObjectId, default: null },
  fformRequired:   { type: Boolean, default: false },  // ← receptionist can tick this
  fee:             { type: Number, default: 0 },
  isPaid:          { type: Boolean, default: false },
  paymentMode:     { type: String, enum: ['cash','upi','card','cheque','pending'], default: 'pending' },
  receiptNo:       { type: String, default: '' },

  // ── Queue workflow ───────────────────────────────────────────────────
  tokenNo:    { type: Number, default: 0 },
  status:     { type: String, enum: ['waiting','in_progress','completed','cancelled'], default: 'waiting' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  completedAt:{ type: Date, default: null },
  notes:      { type: String, default: '' },
  reportReady:{ type: Boolean, default: false },
  reportUrl:  { type: String, default: '' },   // final report scan/PDF
  reportFileId:{ type: String, default: '' },

  // ── Meta ─────────────────────────────────────────────────────────────
  clinic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visitDate:    { type: Date, default: () => new Date() },
}, { timestamps: true });

// INDEXES
patientSchema.index({ clinic: 1, visitDate: 1, tokenNo: 1 });
patientSchema.index({ clinic: 1, status: 1 });
patientSchema.index({ name: 'text', phone: 1 });
patientSchema.index({ lmp: 1, clinic: 1 });  // pregnancy tracking

module.exports = mongoose.model('Patient', patientSchema);
