const mongoose = require('mongoose');
const poSchema = new mongoose.Schema({
  poNumber:       { type: String, unique: true },
  vendor:         { type: String, required: true },
  vendorContact:  { type: String, default: '' },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentName: { type: String, default: '' },
  items:          { type: String, required: true },
  totalAmount:    { type: Number, required: true },
  priority:       { type: String, enum: ['Normal','Urgent','Critical'], default: 'Normal' },
  status:         { type: String, enum: ['Pending','Approved','Rejected','Delivered','Cancelled'], default: 'Pending' },
  requestedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedByName:{ type: String },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedByName: { type: String, default: '' },
  approvedAt:     { type: Date },
  remarks:        { type: String, default: '' },
  expectedDelivery:{ type: Date },
}, { timestamps: true });
poSchema.pre('save', async function() {
  if (!this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNumber = `PO-${String(1001 + count).padStart(4,'0')}`;
  }
});
module.exports = mongoose.model('PurchaseOrder', poSchema);