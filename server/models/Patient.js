const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  uhid:         { type: String, unique: true },
  // ABHA (optional - no OTP needed)
  abhaNumber:   { type: String, default: '', trim: true },
  abhaAddress:  { type: String, default: '', trim: true },
  // Basic
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, default: '', trim: true },
  dob:          { type: Date },
  age:          { type: Number },
  gender:       { type: String, enum: ['Male','Female','Other'], required: true },
  bloodGroup:   { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown'], default: 'Unknown' },
  // Contact
  phone:        { type: String, required: true },
  alternatePhone:{ type: String, default: '' },
  email:        { type: String, default: '' },
  address:      { type: String, default: '' },
  city:         { type: String, default: '' },
  pincode:      { type: String, default: '' },
  // Identity
  aadhaarNumber:{ type: String, default: '' },
  // Medical history
  allergies:          { type: String, default: '' },
  chronicConditions:  { type: String, default: '' },
  // Emergency contact
  emergencyName:      { type: String, default: '' },
  emergencyPhone:     { type: String, default: '' },
  emergencyRelation:  { type: String, default: '' },
  // Insurance
  isAyushmanBharat:   { type: Boolean, default: false },
  insurancePolicyNo:  { type: String, default: '' },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

patientSchema.pre('save', async function(next) {
  if (!this.uhid) {
    const count = await mongoose.model('Patient').countDocuments();
    this.uhid = 'UH-' + String(10001 + count).padStart(5, '0');
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);