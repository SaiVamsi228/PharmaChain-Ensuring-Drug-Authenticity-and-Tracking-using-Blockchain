// src/types/transfer.ts
export interface Transfer {
    transferId: string;
    source: string;
    destination: string;
    products: { batchId: string; quantity: number }[];
    initiationDate: string;
    status: 'In Progress' | 'Completed' | 'Pending' | 'Issue';
    verificationStatus?: string;
    transferMethod: string;
    expectedCompletion: string;
    createdAt: string;
}

export interface TransferFormData {
    transferId: string;
    source: string;
    destination: string;
    products: { batchId: string; quantity: number }[];
    initiationDate: string;
    transferMethod: string;
    expectedCompletion: string;
}
