// src/types/distributorInventory.ts
export interface DistributorInventory {
  batchId: string;
  drugName: string;
  batchSize: number;
  isRecalled: boolean;
  isDispensed: boolean;
  status?: string;
  ipfsHash?: string;
  manufacturerId?: string;
  distributorId?: string;
}