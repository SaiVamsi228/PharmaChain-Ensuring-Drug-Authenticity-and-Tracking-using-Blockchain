const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    drugName: { type: String, required: true },
    drugDetails: {
        ingredients: String,
        strength: String
    },
    manufacturingDate: Date,
    expiryDate: { type: Date, required: true },
    batchSize: { type: Number, required: true },
    status: { type: String, enum: ['New', 'Active', 'In Transit', 'Recalled'], default: 'New' },
    currentOwner: String, // Wallet address
    qrCodeHash: { type: String, required: true }, // IPFS hash
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', batchSchema); 