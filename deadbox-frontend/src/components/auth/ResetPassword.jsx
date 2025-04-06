import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../services/api';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!formData.password || !formData.confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await auth.resetPassword(token, formData.password);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Your password has been reset successfully. Please login with your new password.',
            type: 'success'
          } 
        });
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      } else {
        setError('Failed to reset password. Please try again or request a new reset link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your new password"
              className={error ? 'error' : ''}
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className={error ? 'error' : ''}
              minLength="6"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password? <a href="/login">Login</a></p>
          <p>Need a new reset link? <a href="/forgot-password">Request Reset</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 