import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, resendVerification } = useAuth();

  useEffect(() => {
    // Check URL parameters for verification status
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (verified === 'true') {
      toast.success('Email verified successfully! You can now log in.');
    } else if (error === 'invalid_token') {
      toast.error('Invalid or expired verification link.');
    } else if (error === 'verification_failed') {
      toast.error('Email verification failed. Please try again.');
    }

    // Check location state for other messages
    if (location.state?.message) {
      if (location.state.type === 'success') {
        toast.success(location.state.message);
      } else {
        toast.error(location.state.message);
      }
    }
  }, [location, searchParams]);

  const handleResendVerification = async () => {
    try {
      await resendVerification(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification email');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error) {
      if (error.message.includes('verify your email')) {
        toast.error(
          <div>
            Please verify your email before logging in.
            <button 
              onClick={handleResendVerification}
              style={{ 
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                color: '#4299e1',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Resend verification email
            </button>
          </div>
        );
      } else {
        toast.error(error.message || 'Failed to login');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign in to your account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !email || !password}
            className="auth-button"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          <p><Link to="/forgot-password">Forgot your password?</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 