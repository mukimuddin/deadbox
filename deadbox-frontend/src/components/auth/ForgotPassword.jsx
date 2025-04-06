import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../services/api';
import { toast } from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await auth.forgotPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
      setEmail(''); // Clear the form after success
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 