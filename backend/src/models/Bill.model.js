const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount:      { type: Number, required: true, default: 0 },
  hsnCode:     { type: String, default: '' },  // HSN/SAC code for GST
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNo:        { type: String, unique: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic:        { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic',  required: true },
  branch:        { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic',  default: null }, // branch ref
  items:         [billItemSchema],
  subtotal:      { type: Number, default: 0 },
  // Discount
  discountType:  { type: String, enum: ['percent', 'flat'], default: 'flat' },
  discountValue: { type: Number, default: 0 },
  discountAmt:   { type: Number, default: 0 },
  // GST (Indian tax)
  gstEnabled:    { type: Boolean, default: false },
  gstType:       { type: String, enum: ['CGST_SGST', 'IGST', 'none'], default: 'none' },
  cgstPercent:   { type: Number, default: 0 },   // e.g. 9 for 9% CGST
  sgstPercent:   { type: Number, default: 0 },   // e.g. 9 for 9% SGST
  igstPercent:   { type: Number, default: 0 },   // e.g. 18 for 18% IGST
  cgstAmt:       { type: Number, default: 0 },
  sgstAmt:       { type: Number, default: 0 },
  igstAmt:       { type: Number, default: 0 },
  taxAmt:        { type: Number, default: 0 },   // total tax
  // Totals
  total:         { type: Number, default: 0 },
  isPaid:        { type: Boolean, default: false },
  paymentMode:   { type: String, enum: ['cash','upi','card','cheque','pending'], default: 'cash' },
  notes:         { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// PERFORMANCE INDEXES
billSchema.index({ clinic: 1, createdAt: -1 });
billSchema.index({ clinic: 1, isPaid: 1 });
billSchema.index({ branch: 1, createdAt: -1 });
billSchema.index({ patient: 1 });

billSchema.pre('save', async function(next) {
  if (!this.billNo) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billNo = `BILL-${String(count + 1).padStart(5, '0')}`;
  }
  // Subtotal
  this.subtotal = this.items.reduce((s, i) => s + i.amount, 0);
  // Discount
  this.discountAmt = this.discountType === 'percent'
    ? Math.round(this.subtotal * this.discountValue / 100)
    : Math.min(this.discountValue, this.subtotal);
  const afterDiscount = Math.max(0, this.subtotal - this.discountAmt);
  // GST
  if (this.gstEnabled && this.gstType !== 'none') {
    if (this.gstType === 'CGST_SGST') {
      this.cgstAmt = Math.round(afterDiscount * this.cgstPercent / 100);
      this.sgstAmt = Math.round(afterDiscount * this.sgstPercent / 100);
      this.igstAmt = 0;
      this.taxAmt  = this.cgstAmt + this.sgstAmt;
    } else {
      this.igstAmt = Math.round(afterDiscount * this.igstPercent / 100);
      this.cgstAmt = 0; this.sgstAmt = 0;
      this.taxAmt  = this.igstAmt;
    }
  } else {
    this.cgstAmt = 0; this.sgstAmt = 0; this.igstAmt = 0; this.taxAmt = 0;
  }
  this.total = Math.max(0, afterDiscount + this.taxAmt);
  next();
});

module.exports = mongoose.model('Bill', billSchema);
