import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { postService } from '../services/postService';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreVertical,
  Plus,
  Settings,
  UserPlus,
  UserMinus
} from 'lucide-react';
import toast from 'react-hot-toast';

const GroupPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Fetch group details
  const { data: groupData, isLoading: groupLoading } = useQuery(
    ['group', id],
    () => groupService.getGroup(id),
    {
      enabled: !!id,
    }
  );

  // Fetch group posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['group-posts', id],
    () => postService.getGroupPosts(id),
    {
      enabled: !!id,
    }
  );

  // Join group mutation
  const joinGroupMutation = useMutation(
    () => groupService.joinGroup(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group', id]);
        queryClient.invalidateQueries(['groups']);
        toast.success('Successfully joined the group!');
        setShowJoinModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to join group');
      },
    }
  );

  // Leave group mutation
  const leaveGroupMutation = useMutation(
    () => groupService.leaveGroup(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group', id]);
        queryClient.invalidateQueries(['groups']);
        toast.success('Successfully left the group');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to leave group');
      },
    }
  );

  // Like post mutation
  const likePostMutation = useMutation(
    (postId) => postService.toggleLike(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group-posts', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to like post');
      },
    }
  );

  const group = groupData?.data?.group;
  const posts = postsData?.data?.posts || [];

  const handleJoinGroup = () => {
    joinGroupMutation.mutate();
  };

  const handleLeaveGroup = () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      leaveGroupMutation.mutate();
    }
  };

  const handleLikePost = (postId) => {
    likePostMutation.mutate(postId);
  };

  if (groupLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
        <p className="text-gray-600 mb-6">The group you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Group Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              {group.isPrivate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Private
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
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
          
          <div className="flex items-center space-x-2">
            {group.isMember ? (
              <>
                {group.isAdmin && (
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings size={20} />
                  </button>
                )}
                <button
                  onClick={handleLeaveGroup}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={leaveGroupMutation.isLoading}
                >
                  <UserMinus size={16} />
                  <span>Leave</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>Join Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Group Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Button */}
      {group.isMember && (
        <div className="mb-6">
          <Link
            to={`/create-post/${group._id}`}
            className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Create Post</span>
          </Link>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
        
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
            <p className="text-gray-500 mb-6">
              {group.isMember 
                ? 'Be the first to share something with the group!'
                : 'Join the group to see posts and start sharing!'
              }
            </p>
            {group.isMember && (
              <Link to={`/create-post/${group._id}`} className="btn-primary">
                Create First Post
              </Link>
            )}
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
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-3">{post.content}</p>
                    
                    {/* Post Media */}
                    {post.media && post.media.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {post.media.map((media, index) => (
                            <div key={index} className="relative">
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={`Post media ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  controls
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Post Actions */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center space-x-1 hover:text-primary-600 transition-colors ${
                          post.isLiked ? 'text-primary-600' : ''
                        }`}
                      >
                        <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                        <span>{post.engagement.likeCount}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                        <MessageCircle size={16} />
                        <span>{post.engagement.commentCount}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Join {group.name}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to join this group? You'll be able to see and create posts.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinGroup}
                disabled={joinGroupMutation.isLoading}
                className="flex-1 btn-primary"
              >
                {joinGroupMutation.isLoading ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
