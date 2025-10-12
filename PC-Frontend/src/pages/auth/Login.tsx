import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Login.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                formData
            );
            localStorage.setItem('token', response.data.token);
            const role = JSON.parse(atob(response.data.token.split('.')[1])).role;
            toast.success('Login successful');
            if (role === 'Admin') {
                navigate('/admin');
            } else if (role === 'Manufacturer') {
                navigate('/manufacturer');
            } else if (role === 'Technician') {
                navigate('/technician');
            } else if (role === 'Distributor') {
                navigate('/distributor');
            } else if (role === 'Pharmacist') {
                navigate('/pharmacist');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            console.error('Error logging in:', error);
            toast.error(`Error logging in: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;