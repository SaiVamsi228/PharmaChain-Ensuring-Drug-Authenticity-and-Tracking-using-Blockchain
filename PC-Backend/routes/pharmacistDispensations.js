const express = require("express");
const router = express.Router();
const { Web3 } = require("web3");
const PharmacistShipment = require("../models/PharmacistShipment");
const PharmacistInventory = require("../models/PharmacistInventory");
const DispensingHistory = require("../models/PharmacistDispensation");
const { v4: uuidv4 } = require("uuid"); // Add this at the top of the file to import the uuid library

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(
  contractABI,
  process.env.CONTRACT_ADDRESS
);

// Create an account from private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Inventory
router.get("/inventory", async (req, res) => {
  try {
    console.log("Fetching inventory");
    const inventory = await PharmacistInventory.find({});
    res.json({ inventory });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify Batch (Fallback)
router.post("/verify", async (req, res) => {
  const { batchId } = req.body;
  try {
    console.log("Verifying batch:", batchId);
    const inventoryItem = await PharmacistInventory.findOne({ batchId });
    if (!inventoryItem) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }
    const result = await contract.methods.verifyBatch(batchId).call();
    res.json({
      success: true,
      batchId,
      drugName: inventoryItem.drugName,
      quantity: inventoryItem.batchSize,
      isGenuine: result[0],
      isRecalled: result[1],
      isDispensed: result[2],
    });
  } catch (error) {
    console.error("Error verifying batch:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dispense Medication
router.post("/dispense", async (req, res) => {
  const { batchId, patientId, quantity, pharmacistId, transactionHash } = req.body;
  try {
    console.log("Dispensing:", { batchId, patientId, quantity, transactionHash });

    // Validate inventory
    const inventoryItem = await PharmacistInventory.findOne({ batchId });
    if (!inventoryItem) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found in inventory" });
    }
    if (inventoryItem.isRecalled) {
      return res
        .status(400)
        .json({ success: false, message: "Batch is recalled" });
    }
    if (inventoryItem.isDispensed) {
      return res
        .status(400)
        .json({ success: false, message: "Batch already dispensed" });
    }
    if (inventoryItem.batchSize < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient quantity" });
    }

    // Update inventory
    let newBatch = null;
    if (inventoryItem.batchSize > quantity) {
      // Create new batch for remaining quantity
      const newBatchId = `${batchId}-SPLIT-${Date.now()}`;
      newBatch = await PharmacistInventory.create({
        batchId: newBatchId,
        drugName: inventoryItem.drugName,
        batchSize: inventoryItem.batchSize - quantity,
        expiryDate: inventoryItem.expiryDate,
        distributorId: inventoryItem.distributorId,
        manufacturer: inventoryItem.manufacturer,
        status: inventoryItem.status,
        ipfsHash: inventoryItem.ipfsHash,
        pharmacistId,
      });
      console.log("New batch created:", newBatch);

      // Update original batch
      inventoryItem.batchSize = quantity;
      inventoryItem.isDispensed = true;
      await inventoryItem.save();
    } else {
      // Mark as fully dispensed
      inventoryItem.isDispensed = true;
      await inventoryItem.save();
    }

    // Log dispensing history
    const dispensingRecord = await DispensingHistory.create({
      patientId,
      batchId,
      drugName: inventoryItem.drugName,
      quantity,
      pharmacistId,
      transactionHash,
      status: inventoryItem.isRecalled ? "Recalled" : "Completed",
    });
    console.log("Dispensing record:", dispensingRecord);

    res.json({
      success: true,
      dispensingRecord,
      newBatch,
      transactionHash,
    });
  } catch (error) {
    console.error("Error dispensing:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Dispensing History
router.get("/dispensing-history", async (req, res) => {
  const { pharmacistId } = req.query;
  try {
    console.log("Fetching dispensing history for pharmacist:", pharmacistId);
    const history = await DispensingHistory.find({ pharmacistId });
    res.json({ success: true, history });
  } catch (error) {
    console.error("Error fetching dispensing history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Log Shipment Status
router.post("/:batchId/status", async (req, res) => {
  const { batchId } = req.params;
  const { accepted, reason } = req.body;
  try {
    const tx = await contract.methods
      .logShipmentStatus(batchId, accepted, reason)
      .send({ from: account.address, gas: 200000 });

    await PharmacistShipment.findOneAndUpdate(
      { batchId },
      { status: accepted ? "Verified" : "Issue" },
      { upsert: true }
    );

    res.json({ success: true, tx });
  } catch (error) {
    console.error("Error logging shipment status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Shipment
router.post("/", async (req, res) => {
  let {
    shipmentId,
    batchId,
    origin,
    destination,
    products,
    departureDate,
    eta,
    temperature,
    carrier,
    trackingDetails,
  } = req.body;

  try {
    if (!shipmentId) {
      shipmentId = `SHIP-${uuidv4().slice(0, 8)}`; // Generate a unique shipmentId
    }

    console.log("Creating shipment:", { shipmentId, batchId });
    const shipment = await PharmacistShipment.create({
      shipmentId,
      batchId,
      origin,
      destination,
      products,
      departureDate,
      eta,
      status: "In Transit",
      temperature,
      carrier,
      trackingDetails,
    });
    console.log("Shipment created:", shipment);
    res.json({ success: true, shipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch All Shipments
router.get("/all", async (req, res) => {
  try {
    console.log("Fetching all shipments");
    const shipments = await PharmacistShipment.find({});
    console.log("Found shipments:", shipments);
    res.json({ success: true, shipments });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipments",
      error: error.message,
    });
  }
});

// Fetch Shipment Statistics
router.get("/stats", async (req, res) => {
  try {
    console.log("Fetching shipment stats");
    const totalShipments = await PharmacistShipment.countDocuments({});
    const verifiedShipments = await PharmacistShipment.countDocuments({
      status: "Verified",
    });
    const pendingShipments = await PharmacistShipment.countDocuments({
      status: "In Transit",
    });
    const issuesDetected = await PharmacistShipment.countDocuments({
      status: "Issue",
    });

    const stats = {
      success: true,
      totalShipments,
      verifiedShipments,
      pendingShipments,
      issuesDetected,
    };
    console.log("Stats:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching shipment stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipment statistics",
      error: error.message,
    });
  }
});

// Update Shipment Status
router.put("/:shipmentId/status", async (req, res) => {
  const { shipmentId } = req.params;
  const { accepted } = req.body;
  try {
    console.log("Updating shipment status:", shipmentId, "Accepted:", accepted);
    const updatedShipment = await PharmacistShipment.findOneAndUpdate(
      { shipmentId },
      { status: accepted ? "Verified" : "Issue" },
      { new: true }
    );

    if (!updatedShipment) {
      console.log("Shipment not found:", shipmentId);
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }

    console.log("Updated shipment:", updatedShipment);
    res.json({ success: true, updatedShipment });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipment status",
      error: error.message,
    });
  }
});

// Fetch Shipment by Batch ID
router.get("/batch/:batchId", async (req, res) => {
  const { batchId } = req.params;
  try {
    console.log("Fetching shipment for batchId:", batchId);
    const shipment = await PharmacistShipment.findOne({
      "products.batchId": batchId,
    });
    if (!shipment) {
      console.log("Shipment not found for batchId:", batchId);
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }
    console.log("Found shipment:", shipment);
    res.json({ success: true, shipment });
  } catch (error) {
    console.error("Error fetching shipment by batch ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipment",
      error: error.message,
    });
  }
});

// Add to Pharmacist Inventory
router.post("/inventory", async (req, res) => {
  const {
    batchId,
    drugName,
    batchSize,
    ipfsHash,
    distributorId,
    pharmacistId,
    status,
  } = req.body;
  try {
    console.log("Adding to inventory:", { batchId, drugName });
    const existingInventory = await PharmacistInventory.findOne({ batchId });
    if (existingInventory) {
      console.log("Batch already in inventory:", batchId);
      return res.status(400).json({
        success: false,
        message: "Batch already exists in inventory",
      });
    }

    const inventory = await PharmacistInventory.create({
      batchId,
      drugName,
      batchSize,
      ipfsHash,
      distributorId,
      pharmacistId,
      status,
    });
    console.log("Inventory added:", inventory);
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

module.exports = router;
