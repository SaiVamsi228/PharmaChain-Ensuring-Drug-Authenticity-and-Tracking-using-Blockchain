import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 50000
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const createBatch = async (data: any) => {
    try {
        return await api.post('/api/batches', data);
    } catch (error) {
        throw new Error(`Failed to create batch: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const getBatches = async () => {
    try {
        return await api.get('/api/batches');
    } catch (error) {
        throw new Error(`Failed to fetch batches: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const transferBatch = async (batchId: string, data: { to: string; quantity: number }) => {
    try {
        return await api.post(`/api/batches/${batchId}/transfer`, data);
    } catch (error) {
        throw new Error(`Failed to transfer batch: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const createEquipment = async (data: any) => {
    try {
        return await api.post('/api/equipment', data);
    } catch (error) {
        throw new Error(`Failed to create equipment: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const getEquipment = async () => {
    try {
        return await api.get('/api/equipment');
    } catch (error) {
        throw new Error(`Failed to fetch equipment: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const updateEquipmentStatus = async (equipmentId: string, data: { status: string }) => {
    try {
        return await api.put(`/api/equipment/${equipmentId}/status`, data);
    } catch (error) {
        throw new Error(`Failed to update equipment status: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const recordMaintenance = async (equipmentId: string, data: any) => {
    try {
        return await api.post(`/api/equipment/${equipmentId}/maintenance`, data);
    } catch (error) {
        throw new Error(`Failed to record maintenance: ${(error as AxiosError).response?.data?.error || (error as Error).message}`);
    }
};

export const createRecall = async (data: any) => api.post('/api/recalls', data);
export const updateRecovery = async (recallId: string, data: { recoveredUnits: number }) =>
    api.put(`/api/recalls/${recallId}/recovery`, data);
export const completeRecall = async (recallId: string) => api.put(`/api/recalls/${recallId}/complete`);
export const reportDefect = async (data: any) => api.post('/api/defects', data);
export const getDefects = async () => api.get('/api/defects');
export const createShipment = async (data: any) => api.post('/api/shipments', data);
export const verifyBatch = async (data: { batchId: string }) => api.post('/api/shipments/verify', data);
export const logShipmentStatus = async (batchId: string, data: { accepted: boolean; reason: string }) =>
    api.post(`/api/shipments/${batchId}/status`, data);
export const createTransfer = async (data: any) => api.post('/api/transfers', data);
export const createDispensation = async (data: any) => api.post('/api/dispensations', data);
export const createPatient = async (data: any) => api.post('/api/patients', data);
export const getPatient = async (patientId: string) => api.get(`/api/patients/${patientId}`);
export const verifyBatchAndScan = async (batchId: string, data: { userId: string }) =>
    api.post(`/api/patients/verify/${batchId}`, data);
export const reportSideEffect = async (data: { batchId: string; sideEffect: any }) =>
    api.post('/api/patients/side-effects', data);
export const createAdherenceReport = async (data: any) => api.post('/api/patients/adherence');
export const assignRole = async (address: string, role: number) => {
    try {
        return await api.post('/api/admin/assign-role', { address, role });
    } catch (error: any) {
        throw new Error(`Failed to assign role: ${error.message}`);
    }
};

export default api;