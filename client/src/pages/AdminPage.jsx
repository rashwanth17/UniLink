import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { postService } from '../services/postService';
import { authService } from '../services/authService';
import { 
  Users, 
  MessageCircle, 
  Shield, 
  Trash2, 
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all groups
  const { data: groupsData, isLoading: groupsLoading } = useQuery(
    ['admin-groups', searchTerm],
    () => groupService.getGroups({ search: searchTerm }),
    {
      enabled: user?.role === 'admin',
    }
  );

  // Fetch all posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['admin-posts', searchTerm],
    () => postService.getPosts({ search: searchTerm }),
    {
      enabled: user?.role === 'admin',
    }
  );

  // Fetch all users (Admin only) - all users are from Srishakthi College
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['admin-users', searchTerm],
    () => authService.getAllUsers(1, 100, searchTerm),
    {
      enabled: user?.role === 'admin',
    }
  );

  const groups = groupsData?.data?.groups || [];
  const posts = postsData?.data?.posts || [];
  const users = usersData?.data?.users || [];

  // Delete group mutation
  const deleteGroupMutation = useMutation(
    (groupId) => groupService.deleteGroup(groupId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-groups']);
        queryClient.invalidateQueries(['groups']);
        toast.success('Group deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete group');
      },
    }
  );

  // Delete post mutation
  const deletePostMutation = useMutation(
    (postId) => postService.deletePost(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-posts']);
        queryClient.invalidateQueries(['recent-posts']);
        toast.success('Post deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      },
    }
  );

  const handleDeleteGroup = (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      deleteGroupMutation.mutate(groupId);
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePostMutation.mutate(postId);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'posts', label: 'Posts', icon: MessageCircle },
    { id: 'users', label: 'Users', icon: Users },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="opacity-90">Manage groups, posts, and users for Srishakthi College of Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 pl-10 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const getTabTheme = (tabId) => {
              switch(tabId) {
                case 'overview': return 'from-[#107C10] to-[#5DBE3F]'; // Xbox green
                case 'groups': return 'from-[#0078D4] to-[#50B6FF]'; // Microsoft blue
                case 'posts': return 'from-[#0F9D58] to-[#3DDB94]'; // Google Play green
                case 'users': return 'from-[#107C10] to-[#5DBE3F]'; // Xbox green
                default: return 'from-[#107C10] to-[#5DBE3F]';
              }
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-6 rounded-2xl font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${getTabTheme(tab.id)} text-white shadow-lg hover:-translate-y-1`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Users size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm opacity-90">Total Users</div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Users size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold">{groups.length}</div>
              <div className="text-sm opacity-90">Total Groups</div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <MessageCircle size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold">{posts.length}</div>
              <div className="text-sm opacity-90">Total Posts</div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Shield size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm opacity-90">Admins</div>
            </div>
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Groups Management</h2>
            <span className="text-sm text-gray-500">{groups.length} groups</span>
          </div>

          {groupsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-2">
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold">
                            {group.name}
                          </h3>
                          {group.isPrivate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="opacity-90 mb-3">{group.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>{group.memberCount} members</span>
                          <span>{group.postCount} posts</span>
                          <span className="opacity-75">Created by {group.creator.name}</span>
                          <span className="opacity-75">Created {new Date(group.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 ml-3">
                        <Users size={24} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteGroup(group._id, group.name)}
                        className="cursor-pointer rounded-xl bg-white py-2 px-4 font-medium text-[#0078D4] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center space-x-2"
                        title="Delete Group"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Posts Management</h2>
            <span className="text-sm text-gray-500">{posts.length} posts</span>
          </div>

          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-2">
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold">
                            {post.author.name}
                          </h4>
                          <span className="opacity-90">in</span>
                          <span className="text-lg font-bold">
                            {post.group.name}
                          </span>
                        </div>
                        <p className="text-white mb-3 line-clamp-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>{post.engagement.likeCount} likes</span>
                          <span>{post.engagement.commentCount} comments</span>
                          <span className="opacity-75">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 ml-3">
                        <MessageCircle size={24} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="cursor-pointer rounded-xl bg-white py-2 px-4 font-medium text-[#0F9D58] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center space-x-2"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Users Management</h2>
            <span className="text-sm text-gray-500">{users.length} users</span>
          </div>

          {usersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
                            <span className="text-white font-medium text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">{user.name}</h4>
                        <p className="text-sm opacity-90">{user.email}</p>
                        <p className="text-sm opacity-75">
                          Joined {new Date(user.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                            Admin
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
