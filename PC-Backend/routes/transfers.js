const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Transfer = require('../models/Transfer');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require(process.env.CONTRACT_ABI_PATH);
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

// Create Transfer
router.post('/', async (req, res) => {
    const { transferId, source, destination, products, initiationDate, expectedCompletion, transferMethod } = req.body;
    try {
        const accounts = await web3.eth.getAccounts();
        const txs = [];
        for (const product of products) {
            const tx = await contract.methods.transferBatch(
                product.batchId,
                destination,
                product.quantity
            ).send({ from: accounts[0], gas: 200000 });
            txs.push(tx);
        }

        // Ensure blockchain transaction is successful before creating transfer
        if (txs.length === products.length) {
            const transfer = await Transfer.create({
                transferId,
                source,
                destination,
                products,
                initiationDate,
                status: 'In Progress',
                transferMethod,
                expectedCompletion
            });

            res.json({ success: true, transfer, txs });
        } else {
            throw new Error('Blockchain transaction failed for some products');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;