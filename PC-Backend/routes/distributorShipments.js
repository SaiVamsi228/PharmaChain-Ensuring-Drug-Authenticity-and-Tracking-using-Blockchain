const express = require("express");
const router = express.Router();
const { Web3 } = require("web3");
const Shipment = require("../models/DistributorShipment");

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

// Verify Batch
router.post("/verify", async (req, res) => {
  const { batchId } = req.body;
  try {
    const result = await contract.methods.verifyBatch(batchId).call();
    res.json({
      isGenuine: result[0],
      isRecalled: result[1],
      isDispensed: result[2],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    await Shipment.findOneAndUpdate(
      { batchId },
      { status: accepted ? "Delivered" : "Issue" },
      { upsert: true }
    );

    res.json({ success: true, tx });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const shipment = await Shipment.create({
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

    res.json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch All Shipments
router.get("/all", async (req, res) => {
  try {
    const shipments = await Shipment.find({});
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
    const totalShipments = await Shipment.countDocuments({});
    const verifiedShipments = await Shipment.countDocuments({
      status: "Received",
    });
    const pendingShipments = await Shipment.countDocuments({
      status: "Pending",
    });
    const issuesDetected = await Shipment.countDocuments({ status: "Issue" });

    res.json({
      success: true,
      totalShipments,
      verifiedShipments,
      pendingShipments,
      issuesDetected,
    });
  } catch (error) {
    console.error("Error fetching shipment stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipment statistics",
      error: error.message,
    });
  }
});

// Fetch Shipments for Distributor (kept for compatibility)
router.get("/distributor/:distributorId", async (req, res) => {
  const { distributorId } = req.params;

  try {
    const shipments = await Shipment.find({ destination: distributorId });
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

// Update Shipment Status
router.put("/:shipmentId/status", async (req, res) => {
  const { shipmentId } = req.params;
  const { accepted } = req.body;

  try {
    const updatedShipment = await Shipment.findOneAndUpdate(
      { shipmentId },
      { status: accepted ? "Received" : "Issue" },
      { new: true }
    );

    if (!updatedShipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }

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
    const shipment = await Shipment.findOne({ "products.batchId": batchId });
    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }
    res.json({ success: true, shipment });
  } catch (error) {
    console.error("Error fetching shipment by batch ID:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch shipment",
        error: error.message,
      });
  }
});

module.exports = router;
