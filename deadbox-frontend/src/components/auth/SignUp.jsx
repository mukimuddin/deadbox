import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import './Auth.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    familyKey: '',
    familyEmail: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user types
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.familyEmail) {
      newErrors.familyEmail = 'Family email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.familyEmail)) {
      newErrors.familyEmail = 'Family email format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.familyKey) {
      newErrors.familyKey = 'Family key is required';
    } else if (formData.familyKey.length < 6) {
      newErrors.familyKey = 'Family key must be at least 6 characters';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    setErrors({});

    try {
      await auth.register(formData);
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account.',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('Invalid email')) {
          // Handle email validation errors
          if (error.response.data.error.includes('family email')) {
            setErrors(prev => ({
              ...prev,
              familyEmail: error.response.data.error
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              email: error.response.data.error
            }));
          }
        } else {
          setGeneralError(error.response.data.error);
        }
      } else {
        setGeneralError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          {generalError && <div className="error-message general-error">{generalError}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="familyEmail">Family Email Address</label>
            <input
              type="email"
              id="familyEmail"
              name="familyEmail"
              value={formData.familyEmail}
              onChange={handleChange}
              className={errors.familyEmail ? 'error' : ''}
            />
            {errors.familyEmail && <span className="error-message">{errors.familyEmail}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="familyKey">Family Key (min. 6 characters)</label>
            <input
              type="text"
              id="familyKey"
              name="familyKey"
              value={formData.familyKey}
              onChange={handleChange}
              className={errors.familyKey ? 'error' : ''}
            />
            {errors.familyKey && <span className="error-message">{errors.familyKey}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              I agree to the terms and conditions
            </label>
            {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 