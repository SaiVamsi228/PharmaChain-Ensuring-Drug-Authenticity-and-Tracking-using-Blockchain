const mongoose = require("mongoose");

console.log("Defining DistributorInventory schema...");

const distributorInventorySchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  drugName: {
    type: String,
    required: true,
    trim: true,
  },
  batchSize: {
    type: Number,
    required: true,
    min: 0,
  },
  isRecalled: {
    type: Boolean,
    default: false,
  },
  isDispensed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Active", "Recalled", "Dispensed"],
    default: "Pending",
  },
  ipfsHash: {
    type: String,
    required: true,
    trim: true,
  },
  manufacturerId: {
    type: String,
    required: true,
    trim: true,
  },
  distributorId: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` timestamp on save
distributorInventorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure unique index on batchId
distributorInventorySchema.index({ batchId: 1 }, { unique: true });

console.log("Compiling DistributorInventory model...");
const DistributorInventory = mongoose.model("DistributorInventory", distributorInventorySchema);
console.log("DistributorInventory model compiled");

module.exports = DistributorInventory;