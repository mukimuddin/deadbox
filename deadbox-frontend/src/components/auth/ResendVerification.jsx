import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import './Auth.css';

const ResendVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      await auth.resendVerification(email);
      setStatus('success');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Verification email sent! Please check your inbox.' } });
      }, 3000);
    } catch (error) {
      setStatus('error');
      setError(error.response?.data?.error || 'Failed to send verification email');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Resend Verification Email</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {status === 'success' && (
            <div className="success-message">
              Verification email sent! Redirecting to login...
            </div>
          )}
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Resend Verification'}
          </button>
        </form>
        <div className="auth-links">
          <button onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification; 