// src/types/dispensation.ts
export interface Dispensation {
    batchId: string;
    patientId: string;
    prescriptionHash: string;
    date: string;
    quantity: number;
    status: string;
    createdAt: string;
}

export interface DispensationFormData {
    batchId: string;
    patientId: string;
    prescription: any; // Adjust based on your prescription format
    quantity: number;
}