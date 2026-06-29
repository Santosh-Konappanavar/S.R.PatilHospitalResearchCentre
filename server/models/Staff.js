const mongoose = require('mongoose');
const staffSchema = new mongoose.Schema({
  employeeId:     { type: String, unique: true },
  name:           { type: String, required: true },
  role:           { type: String, enum: ['Doctor','Nurse','Technician','Admin','Pharmacist','D-Group','Security','Housekeeping','Other'], required: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentName: { type: String, default: '' },
  qualification:  { type: String, default: '' },
  specialization: { type: String, default: '' },
  phone:          { type: String, default: '' },
  email:          { type: String, default: '' },
  address:        { type: String, default: '' },
  joinDate:       { type: Date },
  salaryGrade:    { type: String, enum: ['A1','A2','B1','B2','C1','C2','D1','D2'], default: 'C1' },
  shift:          { type: String, enum: ['Morning','Evening','Night','General'], default: 'General' },
  status:         { type: String, enum: ['Active','Inactive','On Leave'], default: 'Active' },
  aadhaar:        { type: String, default: '' },
  addedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
staffSchema.pre('save', async function() {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    const pre = ['D-Group','Security','Housekeeping'].includes(this.role) ? 'DG' : 'EMP';
    this.employeeId = `${pre}-${String(1001 + count).padStart(4,'0')}`;
  }
});
module.exports = mongoose.model('Staff', staffSchema);