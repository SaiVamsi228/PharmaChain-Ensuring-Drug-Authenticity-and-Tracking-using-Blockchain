const mongoose = require('mongoose');

const defectSchema = new mongoose.Schema({
    defectId: { type: String, required: true, unique: true },
    equipmentId: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    description: String,
    impact: String,
    photoHash: String, // IPFS hash for photos
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Defect', defectSchema); 