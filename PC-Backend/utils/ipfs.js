const pinataSDK = require('@pinata/sdk');
const dotenv = require('dotenv');

dotenv.config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

async function uploadToIPFS(data) {
    try {
        const result = await pinata.pinJSONToIPFS(data);
        return result.IpfsHash; // e.g., "Qm..."
    } catch (error) {
        throw new Error(`IPFS upload failed: ${error.message}`);
    }
}

module.exports = { uploadToIPFS }; 