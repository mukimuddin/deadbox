import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (userData) => api.patch('/api/users/profile', userData),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/api/auth/reset-password/${token}`, { 
    password,
    confirmPassword: password
  }),
  verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email })
};

export const letters = {
  getAll: () => api.get('/api/letters'),
  create: (letterData) => api.post('/api/letters', letterData),
  update: (id, letterData) => api.put(`/api/letters/${id}`, letterData),
  delete: (id) => api.delete(`/api/letters/${id}`),
  unlock: (id, familyKey) => api.post(`/api/letters/${id}/unlock`, { familyKey })
};

export default api; 