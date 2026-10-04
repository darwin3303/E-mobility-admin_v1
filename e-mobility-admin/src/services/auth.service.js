import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silently handle
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data.valid;
    } catch {
      return false;
    }
  },

  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetToken: async ({ token, email }) => {
    const response = await api.post('/auth/verify-reset-token', { token, email });
    return response.data;
  },

  resetPassword: async ({ token, email, newPassword }) => {
    const response = await api.post('/auth/reset-password', { token, email, newPassword });
    return response.data;
  },

  // Admin Provisioning (Super Admin)
  createAdmin: async ({ name, officialEmail, personalEmail, email }) => {
    const response = await api.post('/auth/admins', {
      name,
      officialEmail: officialEmail || email,
      personalEmail
    });
    return response.data;
  },

  resendCredentials: async (id, personalEmail) => {
    const response = await api.post(`/auth/admins/${id}/resend-credentials`, { personalEmail });
    return response.data;
  },

  // Set-Password Flow
  verifySetupToken: async (token) => {
    const response = await api.get('/auth/verify-setup-token', { params: { token } });
    return response.data;
  },

  setPassword: async ({ token, newPassword, confirmPassword }) => {
    const response = await api.post('/auth/set-password', { token, newPassword, confirmPassword });
    return response.data;
  },

  // First-Time Activation Flow
  verifyActivationToken: async ({ token, email }) => {
    const response = await api.post('/auth/verify-activation-token', { token, email });
    return response.data;
  },

  activateAdmin: async ({ token, email, newPassword, profilePhoto }) => {
    const response = await api.post('/auth/activate', { token, email, newPassword, profilePhoto });
    return response.data;
  },

  // Admin Lifecycle
  approveAdmin: async (id) => {
    const response = await api.post(`/auth/admins/${id}/approve`);
    return response.data;
  },

  rejectAdmin: async (id) => {
    const response = await api.post(`/auth/admins/${id}/reject`);
    return response.data;
  },

  toggleSuspendAdmin: async (id) => {
    const response = await api.post(`/auth/admins/${id}/suspend`);
    return response.data;
  },

  // Daily Login Photo Verification
  verifyLoginPhoto: async ({ pendingToken, photo }) => {
    const response = await api.post('/auth/verify-login-photo', { pendingToken, photo });
    return response.data;
  },

  // Super Admin Login Photo Audit
  getLoginAudits: async (params = {}) => {
    const response = await api.get('/auth/audit/login-audits', { params });
    return response.data;
  },

  getAuditPhotoBlob: async (id) => {
    const response = await api.get(`/auth/audit/login-photo/${id}`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  },

  getAuditPhotoViews: async (id) => {
    const response = await api.get(`/auth/audit/photo-views/${id}`);
    return response.data;
  }
};

export default api;