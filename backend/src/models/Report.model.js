const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  reportType: { type: String, enum: ['Sonography', 'Blood Test', 'X-Ray', 'CT Scan', 'MRI', 'Other'], required: true },
  diagnosis: { type: String, required: true },
  findings: { type: String, default: '' },
  reportFileUrl: { type: String, default: '' },
  reportFileId: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
