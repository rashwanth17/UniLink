import api from './api';

export const groupService = {
  // Get all groups
  getGroups: async (params = {}) => {
    const response = await api.get('/groups', { params });
    return response.data;
  },

  // Get single group
  getGroup: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  // Create new group
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  // Update group
  updateGroup: async (groupId, updateData) => {
    const response = await api.put(`/groups/${groupId}`, updateData);
    return response.data;
  },

  // Delete group
  deleteGroup: async (groupId) => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },

  // Join group
  joinGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  // Admin: list pending requests
  getPendingRequests: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/requests`);
    return response.data;
  },

  approveRequest: async (groupId, userId) => {
    const response = await api.post(`/groups/${groupId}/requests/${userId}/approve`);
    return response.data;
  },
  rejectRequest: async (groupId, userId) => {
    const response = await api.post(`/groups/${groupId}/requests/${userId}/reject`);
    return response.data;
  },

  // Leave group
  leaveGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  // Add member to group
  addMember: async (groupId, userId, role = 'member') => {
    const response = await api.post(`/groups/${groupId}/members`, {
      userId,
      role,
    });
    return response.data;
  },

  // Remove member from group
  removeMember: async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  // Update member role
  updateMemberRole: async (groupId, userId, role) => {
    const response = await api.put(`/groups/${groupId}/members/${userId}/role`, {
      userId,
      role,
    });
    return response.data;
  },
};
