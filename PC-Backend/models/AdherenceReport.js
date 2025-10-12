const mongoose = require('mongoose');

const adherenceReportSchema = new mongoose.Schema({
    patientId: { type: String, required: true }, // Hashed
    date: { type: Date, required: true },
    adherenceRate: { type: Number, required: true },
    sideEffects: [String],
    recommendations: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdherenceReport', adherenceReportSchema);