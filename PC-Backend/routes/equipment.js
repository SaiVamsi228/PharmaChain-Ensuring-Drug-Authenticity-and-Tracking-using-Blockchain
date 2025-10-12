const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Equipment = require('../models/Equipment');
const ServiceHistory = require('../models/ServiceHistory');
const { uploadToIPFS } = require('../utils/ipfs');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

// Create an account from private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Temporary in-memory storage for equipment
let equipment = [];

// Register Equipment
router.post('/', async (req, res) => {
    const { equipmentId, name, model, lastCalibrationDate } = req.body;
    try {
        const certification = { name, model };
        const certificationHash = await uploadToIPFS(certification);

        const tx = await contract.methods.registerEquipment(
            equipmentId,
            Math.floor(new Date(lastCalibrationDate).getTime() / 1000),
            certificationHash
        ).send({ from: account.address, gas: 200000 });

        const equipment = await Equipment.create({
            equipmentId,
            name,
            model,
            lastCalibrationDate,
            status: 'Operational'
        });

        res.json({ success: true, equipment, tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all equipment
router.get('/', (req, res) => {
  res.json(equipment);
});

// Update equipment status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const item = equipment.find(e => e.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Equipment not found' });
  }
  
  item.status = status;
  item.updatedAt = new Date().toISOString();
  
  res.json(item);
});

// Record maintenance
router.post('/:id/maintenance', (req, res) => {
  const { id } = req.params;
  const { maintenanceType, description, date } = req.body;
  
  const item = equipment.find(e => e.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Equipment not found' });
  }
  
  item.lastMaintenanceDate = date;
  item.nextMaintenanceDate = new Date(new Date(date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  item.updatedAt = new Date().toISOString();
  
  res.json(item);
});

module.exports = router; 