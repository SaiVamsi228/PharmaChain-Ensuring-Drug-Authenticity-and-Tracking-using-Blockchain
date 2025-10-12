const mongoose = require("mongoose");

console.log("Defining ManufacturerTransferHistory schema...");
const manufacturerTransferHistorySchema = new mongoose.Schema({
  manufacturerId: {
    type: String,
    required: true,
  },
  batchId: {
    type: String,
    required: true,
  },
  distributorId: {
    type: String,
    required: true,
  },
  quantity: {
    type: String, // Kept as String to match frontend
    required: true,
  },
  transferDate: {
    type: String, // Kept as String to match frontend
    default: () => new Date().toISOString(),
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
});

console.log("Compiling ManufacturerTransferHistory model...");
const ManufacturerTransferHistory = mongoose.model("ManufacturerTransferHistory", manufacturerTransferHistorySchema);
console.log("ManufacturerTransferHistory model compiled");

module.exports = ManufacturerTransferHistory;