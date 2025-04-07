import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getProfile()
        .then(response => {
          if (response.data) {
            setUser(response.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await auth.login(email, password);
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        toast.success('Successfully logged in!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Successfully logged out');
  };

  const register = async (userData) => {
    try {
      const response = await auth.register(userData);
      toast.success('Registration successful! Please verify your email.');
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async (email) => {
    try {
      await auth.resendVerification(email);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    resendVerification,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 