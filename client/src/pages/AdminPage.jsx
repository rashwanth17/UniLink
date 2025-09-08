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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600">
          Manage groups, posts, and users for Srishakthi College of Engineering
        </p>
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
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="card text-center">
            <Users className="mx-auto h-8 w-8 text-primary-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          
          <div className="card text-center">
            <Users className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{groups.length}</div>
            <div className="text-sm text-gray-600">Total Groups</div>
          </div>
          
          <div className="card text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          
          <div className="card text-center">
            <Shield className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-600">Admins</div>
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
                <div key={group._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.name}
                        </h3>
                        {group.isPrivate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{group.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{group.memberCount} members</span>
                        <span>{group.postCount} posts</span>
                        <span>Created by {group.creator.name}</span>
                        <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleDeleteGroup(group._id, group.name)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 size={18} />
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
                <div key={post._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {post.author.name}
                        </h4>
                        <span className="text-sm text-gray-500">in</span>
                        <span className="text-sm font-medium text-primary-600">
                          {post.group.name}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{post.engagement.likeCount} likes</span>
                        <span>{post.engagement.commentCount} comments</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={18} />
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
                <div key={user._id} className="card">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
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
