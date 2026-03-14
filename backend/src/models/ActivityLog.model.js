const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  clinic:    { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:  { type: String },
  userRole:  { type: String },
  action:    { type: String, required: true }, // 'patient_registered', 'patient_completed', etc.
  entity:    { type: String },                 // 'Patient', 'FForm', etc.
  entityId:  { type: mongoose.Schema.Types.ObjectId },
  details:   { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

activitySchema.index({ clinic: 1, createdAt: -1 });
module.exports = mongoose.model('ActivityLog', activitySchema);
