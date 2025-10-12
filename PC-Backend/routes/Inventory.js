const express = require("express");
const router = express.Router();
const DistributorInventory = require("../models/DistributorInventory");
const Batch = require("../models/Batch"); // Assuming Batch model exists

router.post("/", async (req, res) => {
  const {
    batchId,
    drugName,
    batchSize,
    ipfsHash,
    manufacturerId,
    distributorId,
    status,
  } = req.body;

  try {
    const inventory = await DistributorInventory.create({
      batchId,
      drugName,
      batchSize,
      ipfsHash,
      manufacturerId,
      distributorId,
      status,
      isRecalled: false,
      isDispensed: false,
    });

    res.json({ success: true, inventory });
  } catch (error) {
    console.error("Error adding to inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to inventory",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const inventory = await DistributorInventory.find({}).lean();

    // Enrich inventory items with manufacturerName and expiry
    const enrichedInventory = await Promise.all(
      inventory.map(async (item) => {
        // Resolve manufacturerName
        let manufacturerName = "PharmaChain Manufacturer";

        let expiry = item.expiry; // Assuming expiry might be in DistributorInventory

        if (!expiry) {
          const batch = await Batch.findOne({ batchId: item.batchId }).select("expiryDate").lean();
          expiry = batch?.expiryDate || null; // Use null if not found
        }

        return {
          batchId: item.batchId,
          drugName: item.drugName,
          manufacturerName,
          batchSize: item.batchSize,
          expiry, // ISO date string or null
          status: item.status,
        };
      })
    );

    res.json({ success: true, inventory: enrichedInventory });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
});

module.exports = router;