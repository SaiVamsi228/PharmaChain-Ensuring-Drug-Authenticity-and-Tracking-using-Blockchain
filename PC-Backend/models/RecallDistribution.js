const mongoose = require('mongoose');

const recallDistributionSchema = new mongoose.Schema({
    recallId: { type: String, required: true },
    name: { type: String, required: true },
    walletAddress: { type: String, required: true },
    units: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecallDistribution', recallDistributionSchema); 