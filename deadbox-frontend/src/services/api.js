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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to login. Please try again.');
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