const express = require("express");
const router = express.Router();
const ManufacturerTransferHistory = require("../models/ManufacturerTransferHistory");
const Batch = require("../models/Batch");

console.log("Loading manufacturerTransfers routes...");

// Test endpoint to verify route is accessible
router.get("/test", (req, res) => {
  console.log("ManufacturerTransfers /test endpoint hit");
  res.json({ message: "ManufacturerTransfers route is working" });
});

// Record Manufacturer Transfer
router.post("/record-transfer", async (req, res) => {
  const {
    manufacturerId,
    batchId,
    distributorId,
    quantity,
    status,
    transferDate,
  } = req.body;

  // Validate required fields
  if (!manufacturerId || !batchId || !distributorId || !quantity) {
    console.log("Validation failed: Missing required fields");
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: manufacturerId, batchId, distributorId, or quantity",
    });
  }

  try {
    const transferRecord = new ManufacturerTransferHistory({
      manufacturerId,
      batchId,
      distributorId,
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
    const transfers = await ManufacturerTransferHistory.find().sort({
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
    const updatedTransfer = await ManufacturerTransferHistory.findByIdAndUpdate(
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

    // Find the transfer by batchId
    const updatedTransfer = await ManufacturerTransferHistory.findOneAndUpdate(
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

    // Update the batch status to Active
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

console.log("manufacturerTransfers routes loaded");
module.exports = router;
