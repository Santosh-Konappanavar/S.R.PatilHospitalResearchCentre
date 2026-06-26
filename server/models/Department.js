const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  headDoctor:  { type: String, default: '' },
  location:    { type: String, default: '' },
  phone:       { type: String, default: '' },
  totalBeds:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  color:       { type: String, default: '#1a3a5c' },
  icon:        { type: String, default: 'hospital' },
  stats: {
    currentPatients: { type: Number, default: 0 },
    monthlyPatients: { type: Number, default: 0 },
    availableBeds:   { type: Number, default: 0 },
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);