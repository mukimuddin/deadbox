import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the request (excluding sensitive data)
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data ? { ...config.data, password: '[REDACTED]' } : undefined
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log the response
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log the error details
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.patch('/users/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email })
};

export const letters = {
  getAll: () => api.get('/letters'),
  create: (letterData) => api.post('/letters', letterData),
  update: (id, letterData) => api.put(`/letters/${id}`, letterData),
  delete: (id) => api.delete(`/letters/${id}`),
  unlock: (id, familyKey) => api.post(`/letters/${id}/unlock`, { familyKey })
};

export default api; 