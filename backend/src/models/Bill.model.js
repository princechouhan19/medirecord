const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount:      { type: Number, required: true, default: 0 },
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNo:       { type: String, unique: true },
  patient:      { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic',  required: true },
  items:        [billItemSchema],
  subtotal:     { type: Number, default: 0 },
  discountType: { type: String, enum: ['percent', 'flat'], default: 'flat' },
  discountValue:{ type: Number, default: 0 },
  discountAmt:  { type: Number, default: 0 },
  total:        { type: Number, default: 0 },
  isPaid:       { type: Boolean, default: false },
  paymentMode:  { type: String, enum: ['cash','upi','card','pending'], default: 'cash' },
  notes:        { type: String, default: '' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

billSchema.pre('save', async function(next) {
  if (!this.billNo) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billNo = `BILL-${String(count + 1).padStart(5, '0')}`;
  }
  // Recalculate
  this.subtotal = this.items.reduce((s, i) => s + i.amount, 0);
  this.discountAmt = this.discountType === 'percent'
    ? Math.round(this.subtotal * this.discountValue / 100)
    : Math.min(this.discountValue, this.subtotal);
  this.total = Math.max(0, this.subtotal - this.discountAmt);
  next();
});

module.exports = mongoose.model('Bill', billSchema);
