const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  bp: { type: String, default: '' },
  pulse: { type: String, default: '' },
  temp: { type: String, default: '' },
  weight: { type: String, default: '' },
  height: { type: String, default: '' },
  spo2: { type: String, default: '' },
}, { _id: false });

const fformSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  formNumber: { type: String, default: '' },
  chiefComplaint: { type: String, required: true },
  historyOfPresentIllness: { type: String, default: '' },
  pastMedicalHistory: { type: String, default: '' },
  familyHistory: { type: String, default: '' },
  allergies: { type: String, default: '' },
  currentMedications: { type: String, default: '' },
  physicalExamination: { type: String, default: '' },
  vitals: { type: vitalSchema, default: () => ({}) },
  investigations: { type: String, default: '' },
  provisionalDiagnosis: { type: String, default: '' },
  differentialDiagnosis: { type: String, default: '' },
  treatmentPlan: { type: String, default: '' },
  prescriptions: { type: String, default: '' },
  followUpDate: { type: Date, default: null },
  icdCode: { type: String, default: '' },
  doctorNotes: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'final'], default: 'final' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate form number
fformSchema.pre('save', async function(next) {
  if (!this.formNumber) {
    const count = await mongoose.model('FForm').countDocuments();
    this.formNumber = `FF-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('FForm', fformSchema);
