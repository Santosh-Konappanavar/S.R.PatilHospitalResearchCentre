const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  username:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['chairman','admin','department','accountant'], required: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  departmentName: { type: String, default: '' },
  email:          { type: String, default: '' },
  phone:          { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  permissions: {
    canViewOPD:        { type: Boolean, default: false },
    canViewIPD:        { type: Boolean, default: false },
    canViewStaff:      { type: Boolean, default: false },
    canViewReports:    { type: Boolean, default: false },
    canViewPurchase:   { type: Boolean, default: false },
    canPostUpdates:    { type: Boolean, default: true },
    canCreatePurchase: { type: Boolean, default: false },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
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