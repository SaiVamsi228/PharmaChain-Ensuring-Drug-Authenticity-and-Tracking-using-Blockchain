const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    shipmentId: { type: String, required: true, unique: true },
    batchId: { type: String, required: true },
    origin: String, // Distributor's address
    destination: String, // Pharmacist's address
    products: [{
        batchId: String,
        quantity: Number
    }],
    departureDate: Date,
    eta: Date,
    status: { type: String, enum: ['In Transit', 'Pending', 'Issue', 'Verified'] },
    temperature: Number,
    carrier: String,
    trackingDetails: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PharmacistShipment', shipmentSchema);
