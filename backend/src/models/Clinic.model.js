const mongoose = require('mongoose');

// Sub-test schema (e.g. USG > Obstetric, TVS, ABD)
const subTestSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, default: 0 },
  code:  { type: String, default: '' },
}, { _id: true });

// Main test category (e.g. Sonography, X-Ray, Blood Test)
const testCategorySchema = new mongoose.Schema({
  name:     { type: String, required: true },
  basePrice: { type: Number, default: 0 },
  subTests: [subTestSchema],
  isActive: { type: Boolean, default: true },
}, { _id: true });

const clinicSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  clinicId:        { type: String, unique: true, sparse: true }, // superadmin-assigned ID e.g. MEDI-001
  owner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address:         { type: String, default: '' },
  city:            { type: String, default: '' },
  state:           { type: String, default: '' },
  phone:           { type: String, default: '' },
  email:           { type: String, default: '' },
  licenseNumber:   { type: String, default: '' },
  specialization:  { type: String, default: '' },
  pndtRegNo:       { type: String, default: '' },  // PNDT registration
  isActive:        { type: Boolean, default: true },
  logo:            { type: String, default: '' },
  logoFileId:      { type: String, default: '' },
  testCategories:  [testCategorySchema],           // clinic's test & fee structure
  subscription: {
    plan:           { type: String, enum: ['free', 'pro'], default: 'free' },
    status:         { type: String, enum: ['active', 'expired', 'trial'], default: 'active' },
    startDate:      { type: Date, default: Date.now },
    endDate:        { type: Date },
    durationMonths: { type: Number, enum: [1, 6, 12], default: 1 },
  },
  settings: {
    maxPatients: { type: Number, default: 1000 },
    maxStaff:    { type: Number, default: 10 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
