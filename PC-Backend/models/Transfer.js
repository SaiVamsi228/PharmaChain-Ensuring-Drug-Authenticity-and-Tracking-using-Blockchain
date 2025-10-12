const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    transferId: { type: String, required: true, unique: true },
    source: String,
    destination: String,
    products: [{
        batchId: String,
        quantity: Number
    }],
    initiationDate: { type: Date, required: true },
    status: { type: String, enum: ['In Progress', 'Completed', 'Pending', 'Issue'] },
    verificationStatus: String,
    transferMethod: String,
    expectedCompletion: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', transferSchema); 