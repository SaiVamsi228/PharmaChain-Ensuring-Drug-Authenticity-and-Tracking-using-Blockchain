const mongoose = require('mongoose');

const recallSchema = new mongoose.Schema({
    recallId: { type: String, required: true, unique: true },
    batchId: { type: String, required: true },
    reason: { type: String, required: true },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    notificationType: { type: String, enum: ['Silent', 'Standard', 'Public'], required: true },
    initiatedDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' },
    recovery: {
        percentage: Number,
        recoveredUnits: Number,
        pendingUnits: Number,
        lastUpdate: Date
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recall', recallSchema); 