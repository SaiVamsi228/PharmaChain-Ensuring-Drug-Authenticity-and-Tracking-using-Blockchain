// src/types/recall.ts
export interface Recall {
    recallId: string;
    batchId: string;
    reason: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    notificationType: 'Silent' | 'Standard' | 'Public';
    initiatedDate: string;
    status: 'Active' | 'Completed' | 'Cancelled';
    recovery: {
        percentage: number;
        recoveredUnits: number;
        pendingUnits: number;
        lastUpdate: string;
    };
    createdAt: string;
}

export interface RecallFormData {
    recallId: string;
    batchId: string;
    reason: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    notificationType: 'Silent' | 'Standard' | 'Public';
    initiatedDate: string;
    batchSize: number;
    distribution?: { name: string; walletAddress: string; units: number }[];
}