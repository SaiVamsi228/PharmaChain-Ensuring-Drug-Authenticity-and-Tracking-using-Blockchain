const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Recall = require('../models/Recall');
const RecallDistribution = require('../models/RecallDistribution');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

// Create an account from private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Temporary in-memory storage for recalls
let recalls = [];

// Get all recalls
router.get('/', (req, res) => {
  res.json(recalls);
});

// Create a new recall
router.post('/', (req, res) => {
  const newRecall = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  recalls.push(newRecall);
  res.status(201).json(newRecall);
});

// Update recall recovery
router.put('/:id/recovery', (req, res) => {
  const { id } = req.params;
  const { recoveredQuantity } = req.body;
  
  const recall = recalls.find(r => r.id === id);
  if (!recall) {
    return res.status(404).json({ error: 'Recall not found' });
  }
  
  recall.recoveryRate = (recoveredQuantity / recall.quantity) * 100;
  recall.updatedAt = new Date().toISOString();
  
  res.json(recall);
});

// Complete a recall
router.put('/:id/complete', (req, res) => {
  const { id } = req.params;
  
  const recall = recalls.find(r => r.id === id);
  if (!recall) {
    return res.status(404).json({ error: 'Recall not found' });
  }
  
  recall.status = 'completed';
  recall.updatedAt = new Date().toISOString();
  
  res.json(recall);
});

// Initiate Recall
router.post('/', async (req, res) => {
    const { recallId, batchId, reason, riskLevel, notificationType, initiatedDate, distribution } = req.body;
    try {
        const tx = await contract.methods.initiateRecall(
            recallId,
            batchId,
            reason,
            riskLevel,
            notificationType,
            Math.floor(new Date(initiatedDate).getTime() / 1000)
        ).send({ from: account.address, gas: 300000 });

        const recall = await Recall.create({
            recallId,
            batchId,
            reason,
            riskLevel,
            notificationType,
            initiatedDate,
            status: 'Active',
            recovery: { percentage: 0, recoveredUnits: 0, pendingUnits: req.body.batchSize, lastUpdate: new Date() }
        });

        if (distribution) {
            await RecallDistribution.insertMany(distribution.map(d => ({
                recallId,
                name: d.name,
                walletAddress: d.walletAddress,
                units: d.units
            })));
        }

        res.json({ success: true, recall, tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Recovery
router.put('/:recallId/recovery', async (req, res) => {
    const { recallId } = req.params;
    const { recoveredUnits } = req.body;
    try {
        const tx = await contract.methods.updateRecovery(recallId, recoveredUnits)
            .send({ from: account.address, gas: 200000 });

        const recall = await Recall.findOneAndUpdate(
            { recallId },
            { 
                'recovery.recoveredUnits': recoveredUnits,
                'recovery.percentage': (recoveredUnits / recall.recovery.pendingUnits) * 100,
                'recovery.lastUpdate': new Date()
            },
            { new: true }
        );

        res.json({ success: true, recall, tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Complete Recall
router.put('/:recallId/complete', async (req, res) => {
    const { recallId } = req.params;
    try {
        const tx = await contract.methods.completeRecall(recallId)
            .send({ from: account.address, gas: 200000 });

        const recall = await Recall.findOneAndUpdate(
            { recallId },
            { status: 'Completed' },
            { new: true }
        );

        res.json({ success: true, recall, tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 