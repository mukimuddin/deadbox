import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../services/api';
import { toast } from 'react-hot-toast';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one letter and one number';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Both password fields are required');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await auth.resetPassword(token, formData.password);
      toast.success('Password reset successful! Redirecting to login...', {
        icon: '✓'
      });
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
      if (error.message.includes('Invalid or expired')) {
        toast.error('This reset link has expired. Please request a new one.');
      } else {
        toast.error(error.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your new password"
              minLength="8"
              required
              disabled={isLoading}
            />
            <small className="input-help">
              Password must be at least 8 characters long and contain at least one letter and one number
            </small>
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
              minLength="8"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !formData.password || !formData.confirmPassword}
            className="auth-button"
          >
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