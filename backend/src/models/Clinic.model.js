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
  subscription: {
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'trial'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    durationMonths: { type: Number, enum: [1, 6, 12], default: 1 }
  },
  settings: {
    allowStaffRegistration: { type: Boolean, default: true },
    maxPatients: { type: Number, default: 1000 },
    maxStaff: { type: Number, default: 10 },
  }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
