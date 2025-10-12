const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    walletAddress: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    role: { 
        type: String, 
        enum: ['Manufacturer', 'Technician', 'Distributor', 'Pharmacist', 'Patient'], 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login timestamp
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = Date.now();
    await this.save();
};

// Create index for faster queries
userSchema.index({ walletAddress: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema); 