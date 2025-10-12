import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import contractABI from '../abis/PharmaChain.json';
import { Role } from '../types/role';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x33df8bbed389337798a1a9a0c4c6d6e602e548ee';

export const getWeb3 = async (): Promise<Web3> => {
    const provider: any = await detectEthereumProvider();
    if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        return new Web3(provider);
    }
    throw new Error('MetaMask not detected');
};

export const getContract = async () => {
    const web3 = await getWeb3();
    return new web3.eth.Contract(contractABI as any, CONTRACT_ADDRESS);
};

export const getCurrentAccount = async (): Promise<string> => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
};

export const createBatch = async (
    batchId: string,
    expiryDate: string,
    equipmentIds: string[],
    quantity: number,
    qrCodeHash: string
) => {
    const contract = await getContract();
    const from = await getCurrentAccount();
    return contract.methods.createBatch(
        batchId,
        Math.floor(new Date(expiryDate).getTime() / 1000),
        equipmentIds,
        quantity,
        qrCodeHash
    ).send({ from, gas: 300000 });
};

export const assignRole = async (account: string, role: Role) => {
    const contract = await getContract();
    const from = await getCurrentAccount();
    return contract.methods.assignRole(account, role).send({ from, gas: 200000 });
};

export const getRole = async (account: string): Promise<Role> => {
    const contract = await getContract();
    const role = await contract.methods.roles(account).call();
    return parseInt(role) as Role;
};

export const registerEquipment = async (
    equipmentId: string,
    lastCalibrationDate: string,
    certificationHash: string
) => {
    const contract = await getContract();
    const from = await getCurrentAccount();
    return contract.methods.registerEquipment(
        equipmentId,
        Math.floor(new Date(lastCalibrationDate).getTime() / 1000),
        certificationHash
    ).send({ from, gas: 200000 });
};

export const updateEquipmentStatus = async (equipmentId: string, status: string) => {
    const contract = await getContract();
    const from = await getCurrentAccount();
    return contract.methods.updateEquipmentStatus(equipmentId, status).send({ from, gas: 200000 });
};

export const recordMaintenance = async (
    equipmentId: string,
    serviceDate: string,
    technician: string
) => {
    const contract = await getContract();
    const from = await getCurrentAccount();
    return contract.methods.recordMaintenance(
        equipmentId,
        Math.floor(new Date(serviceDate).getTime() / 1000),
        technician
    ).send({ from, gas: 200000 });
};
