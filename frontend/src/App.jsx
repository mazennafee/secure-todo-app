import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import EmailVerification from './pages/EmailVerification';
import NotificationBell from './components/Notifications/NotificationBell';
import './index.css';
function App() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token in sessionStorage
        // NOTE: For production, consider HttpOnly cookies for better security
        const savedToken = sessionStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
        }
        setLoading(false);
    }, []);

    const handleLogin = (newToken) => {
        setToken(newToken);
        // Store token in sessionStorage (cleared on tab close)
        // For production, consider using HttpOnly cookies instead
        sessionStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        sessionStorage.removeItem('token');
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading...</div>;
    }

    return (
        <BrowserRouter>
            {token ? (
                <>
                    <nav style={{ padding: '1rem', background: '#667eea', color: 'white', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
                        <Link to="/projects" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Projects</Link>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <NotificationBell />
                            <button onClick={handleLogout} style={{ background: 'white', color: '#667eea', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                        </div>
                    </nav>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard token={token} onLogout={handleLogout} />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/verify-email" element={<EmailVerification onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            )}
        </BrowserRouter>
    );
}

export default App;
