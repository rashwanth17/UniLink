import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (updateData) => {
    const response = await api.put('/auth/profile', updateData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get users by college
  getUsersByCollege: async (college, page = 1, limit = 20) => {
    const response = await api.get(`/auth/college/${college}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get all users (Admin only)
  getAllUsers: async (page = 1, limit = 50, search = '') => {
    const response = await api.get('/auth/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async () => {
    const response = await api.delete('/auth/deactivate');
    return response.data;
  },
};
