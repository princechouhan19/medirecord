const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['superadmin', 'clinic_owner', 'receptionist', 'lab_handler', 'doctor'],
    default: 'receptionist'
  },
  clinic:   { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  isActive: { type: Boolean, default: true },
  profileImage:     { type: String, default: '' },
  profileImageFileId: { type: String, default: '' },
  phone:    { type: String, default: '' },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(p) { return bcrypt.compare(p, this.password); };
userSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };

module.exports = mongoose.model('User', userSchema);
