const mongoose = require('mongoose');

const dispensingHistorySchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  batchId: { type: String, required: true },
  drugName: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Completed', 'Recalled'], default: 'Completed' },
  pharmacistId: { type: String, required: true },
  transactionHash: { type: String },
});

module.exports = mongoose.model('DispensingHistory', dispensingHistorySchema);