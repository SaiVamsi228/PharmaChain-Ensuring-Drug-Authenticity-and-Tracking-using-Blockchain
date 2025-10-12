const express = require("express");
const router = express.Router();
const { Web3 } = require("web3");
const PharmacistShipment = require("../models/PharmacistShipment");
const PharmacistInventory = require("../models/PharmacistInventory");

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

router.get("/inventory", async (req, res) => {
  try {
    const inventory = await PharmacistInventory.find({});
    res.json({ inventory });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error" });
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
  const {
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
      // Update existing inventory
      existingInventory.batchSize += batchSize;
      existingInventory.updatedAt = new Date();
      await existingInventory.save();
      console.log("Inventory updated:", existingInventory);
      return res.json({ success: true, inventory: existingInventory });
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
