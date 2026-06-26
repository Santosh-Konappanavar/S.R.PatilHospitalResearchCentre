const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  username:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['chairman','admin','department'], required: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  departmentName: { type: String, default: '' },
  email:          { type: String, default: '' },
  phone:          { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  permissions: {
    canViewOPD:       { type: Boolean, default: false },
    canViewIPD:       { type: Boolean, default: false },
    canViewStaff:     { type: Boolean, default: false },
    canViewReports:   { type: Boolean, default: false },
    canViewPurchase:  { type: Boolean, default: false },
    canPostUpdates:   { type: Boolean, default: true },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);