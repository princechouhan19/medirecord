const mongoose = require('mongoose');

const referredDoctorSchema = new mongoose.Schema({
  clinic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name:         { type: String, required: true, trim: true },
  type:         { type: String, enum: ['Doctor','Genetic Counselling Centre','Self Referral','Other'], default: 'Doctor' },
  qualification:{ type: String, default: '' },
  address:      { type: String, default: '' },
  city:         { type: String, default: '' },
  phone:        { type: String, default: '' },
  regNo:        { type: String, default: '' },
  specialization:{ type: String, default: '' },
}, { timestamps: true });

referredDoctorSchema.index({ clinic: 1, name: 1 });
referredDoctorSchema.index({ clinic: 1, name: 'text' });

module.exports = mongoose.model('ReferredDoctor', referredDoctorSchema);
