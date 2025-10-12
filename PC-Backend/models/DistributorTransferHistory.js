const mongoose = require("mongoose");

console.log("Defining DistributorTransferHistory schema...");
const distributorTransferHistorySchema = new mongoose.Schema({
  distributorId: {
    type: String,
    required: true,
  },
  batchId: {
    type: String,
    required: true,
  },
  pharmacistId: {
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

console.log("Compiling DistributorTransferHistory model...");
const DistributorTransferHistory = mongoose.model("DistributorTransferHistory", distributorTransferHistorySchema);
console.log("DistributorTransferHistory model compiled");

module.exports = DistributorTransferHistory;