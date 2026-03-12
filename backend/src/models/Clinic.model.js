const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  specialization: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  logo: { type: String, default: '' },
  logoFileId: { type: String, default: '' },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
  settings: {
    allowStaffRegistration: { type: Boolean, default: true },
    maxPatients: { type: Number, default: 1000 },
    maxStaff: { type: Number, default: 10 },
  }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
