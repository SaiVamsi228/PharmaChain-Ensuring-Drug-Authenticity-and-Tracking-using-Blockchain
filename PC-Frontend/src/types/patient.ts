// src/types/patient.ts
export interface Patient {
    patientId: string;
    name: string;
    age: number;
    gender: string;
    contact: {
        phone: string;
        email: string;
        address: string;
    };
    medicalDetails: {
        bloodGroup: string;
        allergies: string[];
        conditions: string[];
    };
    medications: { batchId: string; adherence: number }[];
    createdAt: string;
}

export interface PatientFormData {
    patientId: string;
    name: string;
    age: number;
    gender: string;
    contact: {
        phone: string;
        email: string;
        address: string;
    };
    medicalDetails: {
        bloodGroup: string;
        allergies: string[];
        conditions: string[];
    };
}

export interface AdherenceReport {
    patientId: string;
    date: string;
    adherenceRate: number;
    sideEffects: string[];
    recommendations: string;
    createdAt: string;
}

export interface AdherenceFormData {
    patientId: string;
    date: string;
    adherenceRate: number;
    sideEffects: string[];
    recommendations: string;
}