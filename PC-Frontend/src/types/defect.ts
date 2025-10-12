// src/types/defect.ts
export interface Defect {
    defectId: string;
    equipmentId: string;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'Resolved';
    description: string;
    impact: string;
    photoHash?: string;
    createdAt: string;
}

export interface DefectFormData {
    defectId: string;
    equipmentId: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    impact: string;
    photo?: string;
}
