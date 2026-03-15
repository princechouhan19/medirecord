const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  bp:     { type: String, default: '' },
  pulse:  { type: String, default: '' },
  temp:   { type: String, default: '' },
  weight: { type: String, default: '' },
  height: { type: String, default: '' },
  spo2:   { type: String, default: '' },
}, { _id: false });

const fformSchema = new mongoose.Schema({
  // Core refs
  patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic:   { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  formNumber: { type: String, default: '' },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:     { type: String, enum: ['draft','final'], default: 'final' },

  // ── Section A (pre-filled from Patient record) ─────────────────────
  // Stored here for historical record in case patient is updated later
  sectionA: {
    doctorName:    { type: String, default: '' },   // name of performing doctor/radiologist
    procedureDate: { type: Date,   default: null },  // date procedure was carried out
    declarationDate:{ type: Date,  default: null },  // date patient declaration obtained
    patientRegDate: { type: Date,  default: null },
  },

  // ── Section B: Non-Invasive (Ultrasound) ───────────────────────────
  sectionB: {
    performedBy:   { type: String, default: '' },
    // USG Indications (23 checkboxes from Form F)
    indications: {
      i_viability:           { type: Boolean, default: false },
      ii_dating:             { type: Boolean, default: false },
      iii_fetuses:           { type: Boolean, default: false },
      iv_iucd_mtp:           { type: Boolean, default: false },
      v_bleeding:            { type: Boolean, default: false },
      vi_abortion:           { type: Boolean, default: false },
      vii_cervical:          { type: Boolean, default: false },
      viii_discrepancy:      { type: Boolean, default: false },
      ix_adnexal:            { type: Boolean, default: false },
      x_chromosomal:         { type: Boolean, default: false },
      xi_presentation:       { type: Boolean, default: false },
      xii_liquor:            { type: Boolean, default: false },
      xiii_preterm:          { type: Boolean, default: false },
      xiv_placenta:          { type: Boolean, default: false },
      xv_umbilical:          { type: Boolean, default: false },
      xvi_caesarean:         { type: Boolean, default: false },
      xvii_growth:           { type: Boolean, default: false },
      xviii_doppler:         { type: Boolean, default: false },
      xix_guided:            { type: Boolean, default: false },
      xx_invasive:           { type: Boolean, default: false },
      xxi_intrapartum:       { type: Boolean, default: false },
      xxii_medical_surgical: { type: Boolean, default: false },
      xxiii_research:        { type: Boolean, default: false },
      other:                 { type: String, default: '' },
    },
    procedureType: { type: String, default: 'Ultrasound' }, // Ultrasound / Other
    procedureOther:{ type: String, default: '' },
    resultBrief:   { type: String, default: '' },  // Result in brief
    conveyedTo:    { type: String, default: '' },
    conveyedDate:  { type: Date,   default: null },
    mtpIndication: { type: String, default: '' },
  },

  // ── Section C: Invasive ────────────────────────────────────────────
  sectionC: {
    enabled:       { type: Boolean, default: false },
    performedBy:   { type: String, default: '' },
    familyHistory: { type: String, default: '' },
    diagnosisBasis:{
      clinical:     { type: Boolean, default: false },
      biochemical:  { type: Boolean, default: false },
      cytogenetic:  { type: Boolean, default: false },
      other:        { type: String,  default: '' },
    },
    indications: {
      chromosomal:  { type: Boolean, default: false },
      metabolic:    { type: Boolean, default: false },
      congenital:   { type: Boolean, default: false },
      mentalDisability:{ type: Boolean, default: false },
      haemoglobin:  { type: Boolean, default: false },
      sexLinked:    { type: Boolean, default: false },
      singleGene:   { type: Boolean, default: false },
      advancedAge:  { type: Boolean, default: false },
      genetic:      { type: String,  default: '' },
      other:        { type: String,  default: '' },
    },
    consentDate:   { type: Date,   default: null },
    procedure: {
      amniocentesis: { type: Boolean, default: false },
      cvs:          { type: Boolean, default: false },
      fetalBiopsy:  { type: Boolean, default: false },
      cordocentesis:{ type: Boolean, default: false },
      other:        { type: String, default: '' },
    },
    complications: { type: String, default: '' },
    additionalTests: {
      chromosomal:  { type: Boolean, default: false },
      biochemical:  { type: Boolean, default: false },
      molecular:    { type: Boolean, default: false },
      preimplantation:{ type: Boolean, default: false },
      other:        { type: String, default: '' },
    },
    resultBrief:   { type: String, default: '' },
    procedureDate: { type: Date,   default: null },
    conveyedTo:    { type: String, default: '' },
    conveyedDate:  { type: Date,   default: null },
    mtpIndication: { type: String, default: '' },
  },

  // ── Section D: Patient Declaration ───────────────────────────────
  sectionD: {
    thumbImpression: { type: Boolean, default: false },
    witnessName:     { type: String, default: '' },
    witnessAge:      { type: String, default: '' },
    witnessSex:      { type: String, default: '' },
    witnessRelation: { type: String, default: '' },
    witnessContact:  { type: String, default: '' },
    signatureUrl:    { type: String, default: '' }, // optional upload
  },

  // ── Clinical fields (internal use beyond govt form) ───────────────
  vitals:                  { type: vitalSchema, default: () => ({}) },
  chiefComplaint:          { type: String, default: '' },
  historyOfPresentIllness: { type: String, default: '' },
  pastMedicalHistory:      { type: String, default: '' },
  familyHistory:           { type: String, default: '' },
  allergies:               { type: String, default: '' },
  currentMedications:      { type: String, default: '' },
  physicalExamination:     { type: String, default: '' },
  investigations:          { type: String, default: '' },
  provisionalDiagnosis:    { type: String, default: '' },
  differentialDiagnosis:   { type: String, default: '' },
  treatmentPlan:           { type: String, default: '' },
  prescriptions:           { type: String, default: '' },
  followUpDate:            { type: Date, default: null },
  icdCode:                 { type: String, default: '' },
  doctorNotes:             { type: String, default: '' },
}, { timestamps: true });

fformSchema.pre('save', async function(next) {
  if (!this.formNumber) {
    const count = await mongoose.model('FForm').countDocuments();
    this.formNumber = `FF-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

fformSchema.index({ clinic: 1, createdAt: -1 });
fformSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('FForm', fformSchema);
