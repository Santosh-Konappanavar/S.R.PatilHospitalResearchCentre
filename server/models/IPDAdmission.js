const mongoose = require('mongoose');
const ipdSchema = new mongoose.Schema({
  admissionId:    { type: String, unique: true },
  patient:        { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName:    { type: String },
  uhid:           { type: String },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentName: { type: String },
  ward:           { type: String, default: '' },
  bedNumber:      { type: String, default: '' },
  admissionDate:  { type: Date, default: Date.now },
  dischargeDate:  { type: Date },
  admittingDoctor:{ type: String, required: true },
  admissionType:  { type: String, enum: ['Emergency','Planned','Transfer'], default: 'Planned' },
  diagnosis:      { type: String, default: '' },
  nursingNotes:   [{ note: String, addedBy: String, addedAt: { type: Date, default: Date.now } }],
  totalAmount:    { type: Number, default: 0 },
  paidAmount:     { type: Number, default: 0 },
  paymentStatus:  { type: String, enum: ['Pending','Partial','Paid','Waived'], default: 'Pending' },
  status:         { type: String, enum: ['Admitted','Discharged','LAMA','Transferred','Expired'], default: 'Admitted' },
  dischargeSummary: { type: String, default: '' },
  registeredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
ipdSchema.pre('save', async function() {
  if (!this.admissionId) {
    const count = await mongoose.model('IPDAdmission').countDocuments();
    const d = new Date();
    this.admissionId = `IPD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(4,'0')}`;
  }
});
module.exports = mongoose.model('IPDAdmission', ipdSchema);