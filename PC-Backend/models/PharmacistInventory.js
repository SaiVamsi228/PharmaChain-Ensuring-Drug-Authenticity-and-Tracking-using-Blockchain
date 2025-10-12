const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  drugName: { type: String, required: true },
  batchSize: { type: Number, required: true },
  ipfsHash: { type: String, required: true },
  distributorId: { type: String, required: true },
  pharmacistId: { type: String, required: true },
  status: { type: String, enum: ["Active", "Dispensed", "Recalled"], required: true },
  isRecalled: { type: Boolean, default: false },
  isDispensed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PharmacistInventory", inventorySchema);