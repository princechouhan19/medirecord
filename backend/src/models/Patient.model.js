const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  aadhaar: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true, trim: true },
  testType: { type: String, enum: ['Sonography', 'Blood Test', 'X-Ray', 'CT Scan', 'MRI', 'Other'], required: true },
  address: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileImageFileId: { type: String, default: '' },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Aadhaar unique per clinic
patientSchema.index({ aadhaar: 1, clinic: 1 }, { unique: true });
patientSchema.index({ name: 'text', phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);
