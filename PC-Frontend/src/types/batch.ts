// src/types/batch.ts
export interface Batch {
    batchId: string;
    drugName: string;
    drugDetails: {
        ingredients: string;
        strength: string;
    };
    manufacturingDate: string;
    expiryDate: string;
    batchSize: number;
    status: 'New' | 'Active' | 'In Transit' | 'Recalled';
    currentOwner: string;
    qualityScore?: number;
    qrCodeHash: string;
    createdAt: string;
}

export interface BatchFormData {
    batchId: string;
    drugName: string;
    ingredients: string;
    strength: string;
    manufacturingDate: string;
    expiryDate: string;
    equipmentIds: string[];
    quantity: number;
}
