// src/pages/patient/Info.tsx
import React, { useState, useEffect } from 'react';
import { createPatient, getPatient, verifyBatchAndScan, reportSideEffect } from '../../services/api';
import { Patient, PatientFormData } from '../../types/patient';

const Info: React.FC = () => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<PatientFormData>({
        patientId: '',
        name: '',
        age: 0,
        gender: '',
        contact: { phone: '', email: '', address: '' },
        medicalDetails: { bloodGroup: '', allergies: [], conditions: [] }
    });
    const [verifyBatchId, setVerifyBatchId] = useState('');
    const [sideEffectData, setSideEffectData] = useState({ batchId: '', sideEffect: '' });

    useEffect(() => {
        // Fetch patient data if patientId is known
    }, []);

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPatient(formData);
            setPatient(await getPatient(formData.patientId).then(res => res.data));
        } catch (error) {
            console.error('Error creating patient:', error);
        }
    };

    const handleVerifyBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await verifyBatchAndScan(verifyBatchId, { userId: formData.patientId });
            alert(`Batch Verification:
                Genuine: ${response.data.isGenuine}
                Recalled: ${response.data.isRecalled}
                Dispensed: ${response.data.isDispensed}
                Scan Count: ${response.data.scanCount}`);
            setVerifyBatchId('');
        } catch (error) {
            console.error('Error verifying batch:', error);
        }
    };

    const handleReportSideEffect = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reportSideEffect(sideEffectData);
            setSideEffectData({ batchId: '', sideEffect: '' });
            alert('Side effect reported');
        } catch (error) {
            console.error('Error reporting side effect:', error);
        }
    };

    return (
        <div>
            <h2>Patient Info</h2>
            <form onSubmit={handleCreatePatient}>
                <input
                    type="text"
                    placeholder="Patient ID"
                    value={formData.patientId}
                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                />
                <input
                    type="text"
                    placeholder="Gender"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={formData.contact.phone}
                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                />
                <button type="submit">Save Profile</button>
            </form>

            <h3>Verify Batch</h3>
            <form onSubmit={handleVerifyBatch}>
                <input
                    type="text"
                    placeholder="Batch ID"
                    value={verifyBatchId}
                    onChange={e => setVerifyBatchId(e.target.value)}
                />
                <button type="submit">Verify Batch</button>
            </form>

            <h3>Report Side Effect</h3>
            <form onSubmit={handleReportSideEffect}>
                <input
                    type="text"
                    placeholder="Batch ID"
                    value={sideEffectData.batchId}
                    onChange={e => setSideEffectData({ ...sideEffectData, batchId: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Side Effect"
                    value={sideEffectData.sideEffect}
                    onChange={e => setSideEffectData({ ...sideEffectData, sideEffect: e.target.value })}
                />
                <button type="submit">Report Side Effect</button>
            </form>
        </div>
    );
};

export default Info;