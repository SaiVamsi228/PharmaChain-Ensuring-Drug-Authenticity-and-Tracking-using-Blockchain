const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true }, // Hashed
    name: String, // Encrypted
    age: Number,
    gender: String,
    contact: {
        phone: String, // Encrypted
        email: String, // Encrypted
        address: String // Encrypted
    },
    medicalDetails: {
        bloodGroup: String,
        allergies: [String],
        conditions: [String]
    },
    medications: [{
        batchId: String,
        adherence: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema); 