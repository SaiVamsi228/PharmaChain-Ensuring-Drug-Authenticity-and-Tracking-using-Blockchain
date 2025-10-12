const express = require("express");
const router = express.Router();
const DistributorTransferHistory = require("../models/DistributorTransferHistory");
const Batch = require("../models/Batch");

console.log("Loading distributorTransfers routes...");

// Test endpoint
router.get("/test", (req, res) => {
  console.log("DistributorTransfers /test endpoint hit");
  res.json({ message: "DistributorTransfers route is working" });
});

// Record Distributor Transfer
router.post("/record-transfer", async (req, res) => {
  const {
    distributorId,
    batchId,
    pharmacistId,
    quantity,
    status,
    transferDate,
  } = req.body;

  if (!distributorId || !batchId || !pharmacistId || !quantity) {
    console.log("Validation failed: Missing required fields");
    return res.status(400).json({
      success: false,
      message: "Missing required fields: distributorId, batchId, pharmacistId, or quantity",
    });
  }

  try {
    const transferRecord = new DistributorTransferHistory({
      distributorId,
      batchId,
      pharmacistId,
      quantity,
      status: status || "Pending",
      transferDate: transferDate || new Date().toISOString(),
    });

    await transferRecord.save();

    res.status(201).json({
      success: true,
      message: "Transfer recorded successfully",
      transferRecord,
    });
  } catch (error) {
    console.error("Error saving transfer record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record transfer",
      error: error.message,
    });
  }
});

// Get All Transfer Records
router.get("/", async (req, res) => {
  try {
    const transfers = await DistributorTransferHistory.find().sort({
      transferDate: -1,
    });
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching transfer records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer records",
      error: error.message,
    });
  }
});

// Update Transfer Status
router.put("/:transferId/status", async (req, res) => {
  const { transferId } = req.params;
  const { accepted } = req.body;

  try {
    const updatedTransfer = await DistributorTransferHistory.findByIdAndUpdate(
      transferId,
      { status: accepted ? "Completed" : "Failed" },
      { new: true }
    );

    if (!updatedTransfer) {
      return res
        .status(404)
        .json({ success: false, message: "Transfer not found" });
    }

    res.json({ success: true, updatedTransfer });
  } catch (error) {
    console.error("Error updating transfer status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update transfer status",
      error: error.message,
    });
  }
});

// Update Transfer Status and Batch Status by batchId
router.put("/:batchId/accept", async (req, res) => {
  const { batchId } = req.params;

  try {
    console.log(`Attempting to update transfer for batchId: ${batchId}`);

    const updatedTransfer = await DistributorTransferHistory.findOneAndUpdate(
      { batchId },
      { status: "Completed" },
      { new: true }
    );

    if (!updatedTransfer) {
      console.log(`No transfer found for batchId: ${batchId}`);
      return res
        .status(404)
        .json({ success: false, message: "Transfer not found for this batch" });
    }

    console.log(`Transfer updated:`, updatedTransfer);

    const updatedBatch = await Batch.findOneAndUpdate(
      { batchId },
      { status: "Active" },
      { new: true }
    );

    if (!updatedBatch) {
      console.log(`No batch found for batchId: ${batchId}`);
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    console.log(`Batch updated:`, updatedBatch);

    res.json({ success: true, updatedTransfer, updatedBatch });
  } catch (error) {
    console.error("Error updating transfer status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update transfer status",
      error: error.message,
    });
  }
});

// Fetch Transfer Statistics
router.get("/stats", async (req, res) => {
  try {
    const totalTransfers = await DistributorTransferHistory.countDocuments({});
    const completedTransfers = await DistributorTransferHistory.countDocuments({
      status: "Completed",
    });
    const pendingTransfers = await DistributorTransferHistory.countDocuments({
      status: "Pending",
    });
    const issuesDetected = await DistributorTransferHistory.countDocuments({
      status: "Failed",
    });

    res.json({
      success: true,
      totalTransfers,
      completedTransfers,
      pendingTransfers,
      issuesDetected,
    });
  } catch (error) {
    console.error("Error fetching transfer stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer statistics",
      error: error.message,
    });
  }
});

console.log("distributorTransfers routes loaded");
module.exports = router;