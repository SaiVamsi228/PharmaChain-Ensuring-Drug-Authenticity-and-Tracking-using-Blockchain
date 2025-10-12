const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Patient = require('../models/Patient');
const AdherenceReport = require('../models/AdherenceReport');
const { encrypt, decrypt } = require('../utils/encryption');
const { uploadToIPFS } = require('../utils/ipfs');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

// Create/Update Patient Profile
router.post('/', async (req, res) => {
    const { patientId, name, age, gender, contact, medicalDetails } = req.body;
    try {
        const encryptedName = encrypt(name);
        const encryptedContact = {
            phone: encrypt(contact.phone),
            email: encrypt(contact.email),
            address: encrypt(contact.address)
        };

        const patient = await Patient.findOneAndUpdate(
            { patientId },
            {
                patientId,
                name: encryptedName,
                age,
                gender,
                contact: encryptedContact,
                medicalDetails
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, patient });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Patient Profile
router.get('/:patientId', async (req, res) => {
    const { patientId } = req.params;
    try {
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({
            patientId,
            name: decrypt(patient.name),
            age: patient.age,
            gender: patient.gender,
            contact: {
                phone: decrypt(patient.contact.phone),
                email: decrypt(patient.contact.email),
                address: decrypt(patient.contact.address)
            },
            medicalDetails: patient.medicalDetails
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify Batch and Log Scan
router.post('/verify/:batchId', async (req, res) => {
    const { batchId } = req.params;
    const { userId } = req.body;
    try {
        const userHash = web3.utils.sha3(userId);
        const result = await contract.methods.verifyBatch(batchId).call();
        await contract.methods.logScan(batchId, userHash)
            .send({ from: (await web3.eth.getAccounts())[0], gas: 100000 });

        res.json({
            isGenuine: result[0],
            isRecalled: result[1],
            isDispensed: result[2],
            scanCount: await contract.methods.scanCounts(batchId).call()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report Side Effect
router.post('/side-effects', async (req, res) => {
    const { batchId, sideEffect } = req.body;
    try {
        const sideEffectHash = await uploadToIPFS({ sideEffect });
        const accounts = await web3.eth.getAccounts();
        const tx = await contract.methods.reportSideEffect(batchId, sideEffectHash)
            .send({ from: accounts[0], gas: 200000 });

        res.json({ success: true, tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Adherence Report
router.post('/adherence', async (req, res) => {
    const { patientId, date, adherenceRate, sideEffects, recommendations } = req.body;
    try {
        const report = await AdherenceReport.create({
            patientId,
            date,
            adherenceRate,
            sideEffects,
            recommendations
        });

        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 