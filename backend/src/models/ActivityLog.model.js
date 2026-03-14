const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  clinic:    { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  branch:    { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:  { type: String },
  userRole:  { type: String },
  action:    { type: String, required: true },
  entity:    { type: String },
  entityId:  { type: mongoose.Schema.Types.ObjectId },
  details:   { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// PERFORMANCE INDEXES (critical for 100k+ records)
activitySchema.index({ clinic: 1, createdAt: -1 });
activitySchema.index({ user: 1,   createdAt: -1 });  // staffId index (was missing)
activitySchema.index({ clinic: 1, user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activitySchema);
