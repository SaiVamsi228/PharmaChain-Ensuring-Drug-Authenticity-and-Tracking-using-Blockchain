import React, { useState, useEffect } from 'react';
import { assignRole, getRole } from '../../services/contract';
import { connectSocket, subscribeToEvents } from '../../services/socket';
import { Role } from '../../types/role';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const [formData, setFormData] = useState<{ address: string; role: Role }>({
        address: '',
        role: Role.None
    });
    const [roles, setRoles] = useState<{ address: string; role: Role }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        connectSocket();
        fetchRoles();
        subscribeToEvents((event, data) => {
            if (event === 'roleAssigned') {
                console.log('Role assigned:', data);
                toast.info(`Role assigned to ${data.account}`);
                fetchRoles();
            }
        });
    }, []);

    const fetchRoles = async () => {
        try {
            // Example: Fetch known addresses or query contract events
            const knownAddresses = [
                '0x450edcb36b83c059b983a36b3e1a9fe4478da7fd', // Backend account
                // Add more addresses as needed
            ];
            const rolePromises = knownAddresses.map(async (address) => ({
                address,
                role: await getRole(address)
            }));
            const fetchedRoles = await Promise.all(rolePromises);
            setRoles(fetchedRoles.filter(r => r.role !== Role.None));
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Failed to fetch roles');
        }
    };

    const handleAssignRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
                throw new Error('Invalid Ethereum address');
            }
            await assignRole(formData.address, formData.role);
            toast.success(`Role ${Role[formData.role]} assigned to ${formData.address}`);
            setFormData({ address: '', role: Role.None });
            fetchRoles();
        } catch (error: any) {
            console.error('Error assigning role:', error);
            toast.error(`Error assigning role: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard - Role Management</h2>
            <form onSubmit={handleAssignRole} className="role-form">
                <div className="form-group">
                    <label>Ethereum Address</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: parseInt(e.target.value) as Role })}
                        required
                    >
                        <option value={Role.None}>Select Role</option>
                        <option value={Role.Manufacturer}>Manufacturer</option>
                        <option value={Role.Technician}>Technician</option>
                        <option value={Role.Distributor}>Distributor</option>
                        <option value={Role.Pharmacist}>Pharmacist</option>
                    </select>
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Assigning...' : 'Assign Role'}
                </button>
            </form>

            <h3>Assigned Roles</h3>
            <table className="roles-table">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(({ address, role }) => (
                        <tr key={address}>
                            <td>{address}</td>
                            <td>{Role[role]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;