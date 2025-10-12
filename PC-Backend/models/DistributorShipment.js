const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    shipmentId: { type: String, required: true, unique: true },
    batchId: { type: String, required: true },
    origin: String,
    destination: String,
    products: [{
        batchId: String,
        quantity: Number
    }],
    departureDate: Date,
    eta: Date,
    status: { type: String, enum: ['In Transit', 'Verified', 'Pending', 'Issue'] },
    temperature: Number,
    carrier: String,
    trackingDetails: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shipment', shipmentSchema);