const mongoose = require('mongoose');

const serviceHistorySchema = new mongoose.Schema({
    equipmentId: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    serviceType: { type: String, required: true },
    technician: String,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServiceHistory', serviceHistorySchema); 