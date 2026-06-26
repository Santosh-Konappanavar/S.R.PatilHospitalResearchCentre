const mongoose = require('mongoose');
const licenseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  authority:   { type: String, required: true },
  licenseNo:   { type: String, required: true },
  issueDate:   { type: Date, required: true },
  expiryDate:  { type: Date, required: true },
  responsible: { type: String, default: '' },
  notes:       { type: String, default: '' },
  status:      { type: String, enum: ['Active','Pending','Expired'], default: 'Active' },
  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
licenseSchema.pre('save', function(next) {
  const now = new Date();
  const days90 = 90 * 24 * 60 * 60 * 1000;
  if (this.expiryDate < now) this.status = 'Expired';
  else if ((this.expiryDate - now) < days90) this.status = 'Pending';
  else this.status = 'Active';
  next();
});
module.exports = mongoose.model('License', licenseSchema);