import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { postService } from '../services/postService';
import { 
  Users, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock,
  MessageCircle,
  Heart,
  Eye,
  Lock,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('groups');

  // Fetch groups (all groups are from Srishakthi College)
  const { data: groupsData, isLoading: groupsLoading } = useQuery(
    ['groups', searchTerm],
    () => groupService.getGroups({ search: searchTerm }),
    {
      enabled: !!user,
    }
  );

  // Fetch recent posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['recent-posts'],
    () => postService.getPosts({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    {
      enabled: !!user,
    }
  );

  const groups = groupsData?.data?.groups || [];
  const posts = postsData?.data?.posts || [];

  // Mutations
  const likePostMutation = useMutation(
    (postId) => postService.toggleLike(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recent-posts']);
      }
    }
  );

  const handleLikeRecentPost = (postId) => {
    likePostMutation.mutate(postId);
  };

  const goToGroup = (groupId) => navigate(`/groups/${groupId}`);

  const tabs = [
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'posts', label: 'Recent Posts', icon: MessageCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Connect with students from Srishakthi College of Engineering and discover new groups.
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full px-3 py-2 pl-10 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link
          to="/create-group"
          className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-1 shadow-lg flex items-center space-x-2 whitespace-nowrap px-6 py-3 font-medium"
        >
          <Plus size={18} />
          <span>Create Group</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-6 rounded-2xl font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? tab.id === 'groups'
                      ? 'bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white shadow-lg hover:-translate-y-1'
                      : 'bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white shadow-lg hover:-translate-y-1'
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedTab === 'groups' && (
            <div>
              <div className="mb-6">
                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-1">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                          <Users size={20} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">
                            {searchTerm ? 'Search Results' : 'Available Groups'}
                          </h2>
                          <p className="text-sm opacity-90">
                            {groups.length} group{groups.length !== 1 ? 's' : ''} found
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              ) : groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No groups found' : 'No groups available'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Be the first to create a group for your college!'
                    }
                  </p>
                  {!searchTerm && (
                    <Link to="/create-group" className="btn-primary">
                      Create First Group
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-2">
                      <div className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">
                              <Link to={`/groups/${group._id}`} className="hover:text-blue-200">
                                {group.name}
                              </Link>
                            </h3>
                            <p className="opacity-90 text-sm line-clamp-1">
                              {group.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 ml-3">
                            {group.isPrivate ? <Lock size={20} /> : <Globe size={20} />}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1 text-sm">
                            <Users size={14} />
                            <span>{group.memberCount} members</span>
                          </div>
                          <span className="text-xs opacity-75">by {group.creator.name}</span>
                        </div>
                        {group.isMember ? (
                          <Link
                            to={`/groups/${group._id}`}
                            className="w-full cursor-pointer rounded-xl bg-white py-2 font-medium text-[#0078D4] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-center block text-sm"
                          >
                            Open Group
                          </Link>
                        ) : (
                          <Link
                            to={`/groups/${group._id}`}
                            className="w-full cursor-pointer rounded-xl bg-white/20 py-2 font-medium text-white border border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 text-center block text-sm"
                          >
                            View Group
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'posts' && (
            <div>
              <div className="mb-6">
                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                          <MessageCircle size={20} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">
                            Recent Posts
                          </h2>
                          <p className="text-sm opacity-90">
                            {posts.length} post{posts.length !== 1 ? 's' : ''} from your groups
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500">
                    Join a group and start sharing with your college community!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-2">
                      <div className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-bold">
                                {post.author.name}
                              </h4>
                              <span className="opacity-90">in</span>
                              <Link
                                to={`/groups/${post.group._id}`}
                                className="text-lg font-bold hover:text-green-200"
                              >
                                {post.group.name}
                              </Link>
                            </div>
                            <p className="opacity-90 text-sm mb-3">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-white mb-4 line-clamp-3">
                              {post.content}
                            </p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 ml-3">
                            <MessageCircle size={24} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <button
                              onClick={() => handleLikeRecentPost(post._id)}
                              className="flex items-center space-x-1 hover:text-green-200"
                            >
                              <Heart size={16} />
                              <span>{post.engagement.likeCount}</span>
                            </button>
                            <button
                              onClick={() => goToGroup(post.group._id)}
                              className="flex items-center space-x-1 hover:text-green-200"
                            >
                              <MessageCircle size={16} />
                              <span>{post.engagement.commentCount}</span>
                            </button>
                          </div>
                          <button
                            onClick={() => goToGroup(post.group._id)}
                            className="cursor-pointer rounded-xl bg-white py-2 px-4 font-medium text-[#0F9D58] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm"
                          >
                            View Post
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile & Actions */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0047BB] to-[#2D68F8] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">Your Profile</h3>
                  <p className="opacity-90">Manage & Connect</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Users size={24} />
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex items-center space-x-3 mb-6">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
                    <span className="text-white font-medium text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-white">{user?.name}</h4>
                  <p className="text-sm opacity-90">Srishakthi College</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="w-full cursor-pointer rounded-xl bg-white py-3 font-medium text-blue-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-center block"
                >
                  View Profile
                </Link>
                <Link
                  to="/create-group"
                  className="w-full cursor-pointer rounded-xl bg-white/20 py-3 font-medium text-white border border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 text-center block"
                >
                  Create Group
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0047BB] to-[#2D68F8] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">Quick Stats</h3>
                  <p className="opacity-90">Your Activity</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="opacity-90">Groups Joined:</span>
                  <span className="text-xl font-bold">
                    {user?.groups?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-90">College:</span>
                  <span className="text-sm font-medium">
                    Srishakthi
                  </span>
                </div>
                {user?.graduationYear && (
                  <div className="flex items-center justify-between">
                    <span className="opacity-90">Graduation:</span>
                    <span className="text-sm font-medium">
                      {user.graduationYear}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
