import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
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
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('groups');

  // Fetch groups
  const { data: groupsData, isLoading: groupsLoading } = useQuery(
    ['groups', searchTerm],
    () => groupService.getGroups({ search: searchTerm, college: user?.college }),
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
          Connect with students from {user?.college} and discover new groups.
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
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link
          to="/create-group"
          className="btn-primary flex items-center space-x-2 whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Create Group</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedTab === 'groups' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchTerm ? 'Search Results' : 'Available Groups'}
                </h2>
                <span className="text-sm text-gray-500">
                  {groups.length} group{groups.length !== 1 ? 's' : ''}
                </span>
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
                    <div key={group._id} className="card-hover">
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
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {group.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users size={16} />
                              <span>{group.memberCount} members</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle size={16} />
                              <span>{group.postCount} posts</span>
                            </div>
                            <span>Created by {group.creator.name}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {group.isMember ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Member
                            </span>
                          ) : (
                            <Link
                              to={`/groups/${group._id}`}
                              className="btn-outline text-sm"
                            >
                              View Group
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Posts
                </h2>
                <span className="text-sm text-gray-500">
                  {posts.length} post{posts.length !== 1 ? 's' : ''}
                </span>
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
                    <div key={post._id} className="card-hover">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {post.author.profilePicture ? (
                            <img
                              src={post.author.profilePicture}
                              alt={post.author.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {post.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {post.author.name}
                            </h4>
                            <span className="text-sm text-gray-500">in</span>
                            <Link
                              to={`/groups/${post.group._id}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              {post.group.name}
                            </Link>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-900 mb-3 line-clamp-3">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-primary-600">
                              <Heart size={16} />
                              <span>{post.engagement.likeCount}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-primary-600">
                              <MessageCircle size={16} />
                              <span>{post.engagement.commentCount}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-primary-600">
                              <Eye size={16} />
                              <span>View</span>
                            </button>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Profile
            </h3>
            <div className="flex items-center space-x-3 mb-4">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{user?.name}</h4>
                <p className="text-sm text-gray-500">{user?.college}</p>
              </div>
            </div>
            <Link to="/profile" className="btn-outline w-full text-center">
              View Profile
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Groups Joined</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.groups?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">College</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.college}
                </span>
              </div>
              {user?.graduationYear && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Graduation</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.graduationYear}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/create-group"
                className="w-full btn-primary text-center block"
              >
                Create Group
              </Link>
              <Link
                to="/profile"
                className="w-full btn-secondary text-center block"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
