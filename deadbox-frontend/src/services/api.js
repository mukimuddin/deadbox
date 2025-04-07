import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // 10 seconds timeout
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden
        return Promise.reject(new Error(data.message || 'You do not have permission to perform this action'));
      } else if (status === 404) {
        // Not found
        return Promise.reject(new Error(data.message || 'Resource not found'));
      } else if (status === 500) {
        // Server error
        return Promise.reject(new Error(data.message || 'Server error occurred'));
      }
      
      // Handle validation errors
      if (status === 400 && data.errors) {
        return Promise.reject(new Error(Object.values(data.errors).join(', ')));
      }
      
      return Promise.reject(new Error(data.message || 'An error occurred'));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new Error('An error occurred while setting up the request.'));
    }
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
      throw error;
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