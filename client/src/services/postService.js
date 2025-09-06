import api from './api';

export const postService = {
  // Get posts
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post
  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('content', postData.content);
    formData.append('groupId', postData.groupId);
    if (postData.tags) {
      formData.append('tags', JSON.stringify(postData.tags));
    }
    if (postData.visibility) {
      formData.append('visibility', postData.visibility);
    }
    
    // Add media files
    if (postData.media && postData.media.length > 0) {
      postData.media.forEach((file, index) => {
        formData.append('media', file);
      });
    }
    
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update post
  updatePost: async (postId, updateData) => {
    const response = await api.put(`/posts/${postId}`, updateData);
    return response.data;
  },

  // Delete post
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Toggle like on post
  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Add comment to post
  addComment: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Toggle like on comment
  toggleCommentLike: async (postId, commentId) => {
    const response = await api.post(`/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  },

  // Get user's posts
  getUserPosts: async (userId, params = {}) => {
    const response = await api.get(`/posts/user/${userId}`, { params });
    return response.data;
  },

  // Get group's posts
  getGroupPosts: async (groupId, params = {}) => {
    const response = await api.get(`/posts/group/${groupId}`, { params });
    return response.data;
  },
};
