// frontend/src/pages/EmailVerification.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmailVerification.css';

function EmailVerification({ onLogin }) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const devCode = location.state?.devCode;
    const inputRefs = useRef([]);

    useEffect(() => {
        // Auto-fill dev code in development
        if (devCode && process.env.NODE_ENV === 'development') {
            setCode(devCode.split(''));
        }
        // Focus first input
        inputRefs.current[0]?.focus();
    }, [devCode]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Only last digit
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            setCode(pastedData.padEnd(6, '').split(''));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    code: code.join('')
                })
            });

            const data = await res.json();

            if (res.ok) {
                onLogin('verified');
                navigate('/dashboard');
            } else {
                setError(data.error || 'Verification failed');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setResendCooldown(60);

        try {
            const res = await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                alert('New code sent! Check your email.');
            } else {
                setError('Failed to resend code. Please try again.');
            }
        } catch (err) {
            setError('Network error.');
        }
    };

    if (!email) {
        navigate('/login');
        return null;
    }

    return (
        <div className="verification-container">
            <div className="verification-box">
                <div className="verification-header">
                    <div className="email-icon">📧</div>
                    <h2>Verify Your Email</h2>
                    <p className="verification-subtitle">
                        We've sent a 6-digit code to
                    </p>
                    <strong className="email-display">{email}</strong>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="code-inputs" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="code-digit"
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    {devCode && (
                        <div className="dev-hint">
                            💡 Dev code auto-filled: {devCode}
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || code.join('').length < 6}
                        className="verify-button"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <p className="resend-section">
                    Didn't receive the code?
                    <button
                        type="button"
                        className="resend-button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                </p>

                <button
                    onClick={() => navigate('/login')}
                    className="back-button"
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
}

export default EmailVerification;
