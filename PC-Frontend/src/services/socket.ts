import { io, Socket } from 'socket.io-client';

const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
    socket.on('connect', () => console.log('Socket.IO connected:', socket.id));
    socket.on('connect_error', (error) => console.error('Socket.IO connection error:', error.message));
    socket.on('error', (error) => console.error('Socket.IO error:', error));
};

export const subscribeToEvents = (callback: (event: string, data: any) => void) => {
    socket.on('batchCreated', (data) => callback('batchCreated', data));
    socket.on('batchTransferred', (data) => callback('batchTransferred', data));
    socket.on('batchRecalled', (data) => callback('batchRecalled', data));
    socket.on('maintenanceRecorded', (data) => callback('maintenanceRecorded', data));
    socket.on('equipmentRegistered', (data) => callback('equipmentRegistered', data));
    socket.on('equipmentStatusUpdated', (data) => callback('equipmentStatusUpdated', data));
    socket.on('roleAssigned', (data) => callback('roleAssigned', data));
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export default socket;