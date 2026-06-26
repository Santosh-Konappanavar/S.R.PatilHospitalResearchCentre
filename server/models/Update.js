const mongoose = require('mongoose');
const updateSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  content:        { type: String, required: true },
  type:           { type: String, enum: ['general','urgent','info','warning','success'], default: 'general' },
  departmentName: { type: String, default: 'General' },
  postedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postedByName:   { type: String },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Update', updateSchema);
