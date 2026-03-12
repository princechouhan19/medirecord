const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  notes: { type: String, default: '' },
}, { _id: false });

const trackingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  purpose: { type: String, required: true },
  nextVisit: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Overdue', 'Completed'], default: 'Active' },
  visitHistory: [visitSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Tracking', trackingSchema);
