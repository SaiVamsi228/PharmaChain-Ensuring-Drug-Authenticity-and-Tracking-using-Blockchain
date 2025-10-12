const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    equipmentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    model: String,
    lastServiceDate: Date,
    nextServiceDate: Date,
    status: { 
        type: String, 
        enum: ['Operational', 'Needs Maintenance', 'Needs Immediate Service'], 
        default: 'Operational' 
    },
    uptimePercentage: Number,
    productionVolume: Number,
    efficiencyScore: Number,
    lastCalibrationDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', equipmentSchema); 