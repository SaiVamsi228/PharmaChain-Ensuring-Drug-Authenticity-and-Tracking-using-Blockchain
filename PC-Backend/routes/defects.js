const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Defect = require('../models/Defect');
const { uploadToIPFS } = require('../utils/ipfs');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

// Create an account from private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Report Defect
router.post('/', async (req, res) => {
    const { defectId, equipmentId, severity, description, impact, photo } = req.body;
    try {
        const photoHash = photo ? await uploadToIPFS({ photo }) : '';

        const tx = await contract.methods.reportDefect(
            defectId,
            equipmentId,
            severity,
            'Open'
        ).send({ from: account.address, gas: 200000 });

        const defect = await Defect.create({
            defectId,
            equipmentId,
            severity,
            status: 'Open',
            description,
            impact,
            photoHash
        });

        res.json({ success: true, defect, tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Defects
router.get('/', async (req, res) => {
    try {
        const defects = await Defect.find();
        res.json(defects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 