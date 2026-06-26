const mongoose = require('mongoose');
const opdSchema = new mongoose.Schema({
  visitId:       { type: String, unique: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName:   { type: String },
  uhid:          { type: String },
  department:    { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentName:{ type: String },
  doctor:        { type: String, required: true },
  visitDate:     { type: Date, default: Date.now },
  tokenNumber:   { type: Number },
  visitType:     { type: String, enum: ['New','Follow-up','Emergency'], default: 'New' },
  chiefComplaint:{ type: String, default: '' },
  diagnosis:     { type: String, default: '' },
  prescription:  { type: String, default: '' },
  bp:            { type: String, default: '' },
  pulse:         { type: String, default: '' },
  temperature:   { type: String, default: '' },
  weight:        { type: String, default: '' },
  fees:          { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid','Pending','Waived'], default: 'Pending' },
  status:        { type: String, enum: ['Waiting','In-Consultation','Done','Cancelled'], default: 'Waiting' },
  registeredBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
opdSchema.pre('save', async function(next) {
  if (!this.visitId) {
    const count = await mongoose.model('OPDVisit').countDocuments();
    const d = new Date();
    this.visitId = `OPD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(count+1).padStart(4,'0')}`;
  }
  next();
});
module.exports = mongoose.model('OPDVisit', opdSchema);