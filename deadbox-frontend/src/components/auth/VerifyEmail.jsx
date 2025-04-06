import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await auth.verifyEmail(token);
        setStatus('success');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Email verified successfully! You can now login.' } });
        }, 3000);
      } catch (error) {
        setStatus('error');
        setError(error.response?.data?.error || 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Email Verification</h2>
        {status === 'verifying' && (
          <div className="verification-status">
            <p>Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="verification-status success">
            <p>Email verified successfully!</p>
            <p>Redirecting to login page...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="verification-status error">
            <p>{error}</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 