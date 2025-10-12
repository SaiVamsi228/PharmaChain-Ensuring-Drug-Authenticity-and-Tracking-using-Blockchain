const express = require("express");
const router = express.Router();
const { Web3 } = require("web3");
const Batch = require("../models/Batch");
const { uploadToIPFS } = require("../utils/ipfs");

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(
  contractABI,
  process.env.CONTRACT_ADDRESS
);

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.defaultAccount = account.address;

// Create Batch
router.post("/", async (req, res) => {
  const {
    batchId,
    drugName,
    ingredients,
    strength,
    manufacturingDate,
    expiryDate,
    equipmentIds,
    quantity,
  } = req.body;
  try {
    const metadata = { drugName, ingredients, strength };
    const qrCodeHash = await uploadToIPFS(metadata);
    const tx = await contract.methods
      .createBatch(
        batchId,
        Math.floor(new Date(expiryDate).getTime() / 1000),
        equipmentIds,
        quantity,
        qrCodeHash
      )
      .send({ from: account.address, gas: 300000 });
    const batch = await Batch.create({
      batchId,
      drugName,
      drugDetails: { ingredients, strength },
      manufacturingDate,
      expiryDate,
      batchSize: quantity,
      status: "New",
      currentOwner: account.address,
      qrCodeHash,
    });
    res.json({ success: true, batch, tx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Batches
router.get("/", async (req, res) => {
  try {
    const batches = await Batch.find();
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Batch
router.post("/:batchId/transfer", async (req, res) => {
  const { batchId } = req.params;
  const { to, quantity } = req.body;
  try {
    const tx = await contract.methods
      .transferBatch(batchId, to, quantity)
      .send({ from: account.address, gas: 200000 });
    await Batch.findOneAndUpdate(
      { batchId },
      { currentOwner: to, status: "In Transit" }
    );
    res.json({ success: true, tx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Batch
router.post("/register", async (req, res) => {
  console.log("Incoming request data:", req.body);
  const {
    batchId,
    drugName,
    ingredients,
    strength,
    manufacturingDate,
    expiryDate,
    equipmentIds,
    quantity,
  } = req.body;
  if (!batchId || !drugName || !expiryDate || !quantity) {
    console.error("Validation failed: Missing required fields");
    return res.status(400).json({
      error:
        "Missing required fields: batchId, drugName, expiryDate, or quantity",
    });
  }
  try {
    console.log("Uploading metadata to IPFS...");
    const metadata = { drugName, ingredients, strength };
    const qrCodeHash = await uploadToIPFS(metadata);
    console.log("Metadata uploaded to IPFS with hash:", qrCodeHash);
    console.log("Calling smart contract to create batch...");
    const tx = await contract.methods
      .createBatch(
        batchId,
        Math.floor(new Date(expiryDate).getTime() / 1000),
        equipmentIds,
        quantity,
        qrCodeHash
      )
      .send({ from: account.address, gas: 500000 });
    console.log("Smart contract transaction successful:", tx);
    console.log("Saving batch to MongoDB...");
    const batch = await Batch.create({
      batchId,
      drugName,
      drugDetails: { ingredients, strength },
      manufacturingDate,
      expiryDate,
      batchSize: quantity,
      status: "New",
      currentOwner: account.address,
      qrCodeHash,
    });
    console.log("Batch saved to MongoDB:", batch);
    res.json({ success: true, batch, tx });
  } catch (error) {
    console.error("Error registering batch:", error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Active Batches
router.get("/active", async (req, res) => {
  try {
    console.log("Fetching active batches from the database...");
    const activeBatches = await Batch.find({
      status: { $in: ["New", "Active"] },
    });
    console.log("Active batches fetched successfully:", activeBatches);
    res.json({ success: true, activeBatches });
  } catch (error) {
    console.error("Error fetching active batches:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update Batch Status
router.put("/:batchId/status", async (req, res) => {
  const { batchId } = req.params;
  const { status } = req.body;

  try {
    const updatedBatch = await Batch.findOneAndUpdate(
      { batchId },
      { status },
      { new: true }
    );

    if (!updatedBatch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.json({ success: true, updatedBatch });
  } catch (error) {
    console.error("Error updating batch status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update batch status",
      error: error.message,
    });
  }
});

// Batch Verification using Smart Contract
router.post("/verify", async (req, res) => {
  const { ipfsHash } = req.body; // Accept IPFS hash from the frontend
  console.log("Received ipfsHash:", ipfsHash); // Log the received ipfsHash

  try {
    // Find the batch in the database using the qrCodeHash field
    const batch = await Batch.findOne({ qrCodeHash: ipfsHash });
    console.log("Database query result:", batch); // Log the database query result

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Interact with the smart contract to verify the batch
    const isVerified = await contract.methods.verifyBatch(batch.batchId).call();

    res.json({
      batchId: batch.batchId,
      drug: batch.drugName,
      units: batch.batchSize,
      verified: isVerified,
    });
  } catch (error) {
    console.error("Error in /verify endpoint:", error); // Log the error
    res.status(500).json({ message: "Error verifying batch", error });
  }
});

module.exports = router;
