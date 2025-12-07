import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const body = isRegister
                ? { email: formData.email, password: formData.password, name: formData.name }
                : { email: formData.email, password: formData.password };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',  // Important for cookies
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                if (isRegister) {
                    // Redirect to email verification
                    navigate('/verify-email', {
                        state: {
                            email: formData.email,
                            devCode: data.devCode  // Development code
                        }
                    });
                } else {
                    // Login successful - tokens in cookies, redirect to dashboard
                    onLogin('logged-in');
                    navigate('/dashboard');
                }
            } else {
                setError(data.error || data.errors?.[0]?.msg || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isRegister ? 'Create Account' : 'Login'}</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                    />

                    {isRegister && (
                        <div className="password-hint">
                            Password must be 8+ characters with uppercase, lowercase, number,
                            special character, and no repeated characters.
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
                    </button>
                </form>

                <p className="toggle-mode">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                            setFormData({ email: '', password: '', name: '' });
                        }}
                        className="link-button"
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </button>
                </p>

                <div style={styles.demo}>
                    <p><strong>Demo credentials:</strong></p>
                    <p>Email: demo@example.com</p>
                    <p>Password: Demo123!</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '0.5rem'
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '2rem',
        fontSize: '1.5rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.3s',
        outline: 'none'
    },
    button: {
        padding: '0.75rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'opacity 0.3s'
    },
    error: {
        padding: '0.75rem',
        background: '#fee',
        color: '#c33',
        borderRadius: '6px',
        fontSize: '0.9rem'
    },
    toggle: {
        textAlign: 'center',
        marginTop: '1rem',
        color: '#666'
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecoration: 'underline'
    },
    demo: {
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#666',
        textAlign: 'center'
    }
};

export default Login;
