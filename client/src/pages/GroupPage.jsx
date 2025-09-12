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

  // Pending requests for admins
  const isPrivileged = Boolean(groupData?.data?.group?.isAdmin || groupData?.data?.group?.isCreator);
  const { data: requestsData, refetch: refetchRequests } = useQuery(
    ['group-requests', id],
    () => groupService.getPendingRequests(id),
    {
      enabled: !!id && isPrivileged,
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

  // Comment mutation
  const addCommentMutation = useMutation(
    ({ postId, content }) => postService.addComment(postId, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group-posts', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment');
      },
    }
  );

  const [commentDrafts, setCommentDrafts] = useState({});
  const onChangeDraft = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };
  const submitComment = (postId) => {
    const content = (commentDrafts[postId] || '').trim();
    if (!content) return;
    addCommentMutation.mutate({ postId, content });
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const group = groupData?.data?.group;
  const posts = postsData?.data?.posts || [];
  const pendingRequests = requestsData?.data?.requests || [];

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
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2 mb-6">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                {group.isPrivate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    Private
                  </span>
                )}
              </div>
              <p className="opacity-90 mb-4">{group.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>{group.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle size={16} />
                  <span>{group.postCount} posts</span>
                </div>
                <span className="opacity-75">Created by {group.creator.name}</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 ml-3">
              <Users size={24} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {group.isMember ? (
              <>
                {(group.isAdmin || group.isCreator) && pendingRequests.length > 0 && (
                  <div className="mr-2 text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                    {pendingRequests.length} pending
                  </div>
                )}
                <button
                  onClick={handleLeaveGroup}
                  className="cursor-pointer rounded-xl bg-white/20 py-2 px-4 font-medium text-white border border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 flex items-center space-x-2"
                  disabled={leaveGroupMutation.isLoading}
                >
                  <UserMinus size={16} />
                  <span>Leave</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                className="cursor-pointer rounded-xl bg-white py-2 px-4 font-medium text-green-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>{group.isPrivate ? 'Request to Join' : 'Join Group'}</span>
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
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">Create Post</h3>
                  <p className="opacity-90">Share something with the group</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Plus size={24} />
                </div>
              </div>
              <Link
                to={`/create-post/${group._id}`}
                className="w-full cursor-pointer rounded-xl bg-white py-3 font-medium text-green-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-center block"
              >
                Create New Post
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Pending Requests */}
      {(group.isAdmin || group.isCreator) && (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2 mb-6">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">Join Requests</h3>
                <p className="opacity-90">{pendingRequests.length} pending requests</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Users size={24} />
              </div>
            </div>
            {pendingRequests.length === 0 ? (
              <p className="text-sm opacity-75">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((r) => (
                  <div key={r.user._id} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      {r.user.profilePicture ? (
                        <img src={r.user.profilePicture} alt={r.user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{r.user.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{r.user.name}</div>
                        <div className="text-xs opacity-75">{r.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => { await groupService.approveRequest(group._id, r.user._id); await refetchRequests(); toast.success('Approved'); queryClient.invalidateQueries(['group', id]); }}
                        className="cursor-pointer rounded-xl bg-white py-1 px-3 font-medium text-green-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => { await groupService.rejectRequest(group._id, r.user._id); await refetchRequests(); toast.success('Rejected'); }}
                        className="cursor-pointer rounded-xl bg-white/20 py-1 px-3 font-medium text-white border border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        <div className="mb-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Posts</h2>
                  <p className="text-sm opacity-90">Latest updates from the group</p>
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
              <div key={post._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-2">
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-bold">
                          {post.author.name}
                        </h4>
                        <span className="opacity-90">•</span>
                        <span className="opacity-90 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white mb-4">{post.content}</p>
                      
                      {/* Post Media */}
                      {post.media && post.media.length > 0 && (
                        <div className="mb-4">
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
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 ml-3">
                      <MessageCircle size={24} />
                    </div>
                  </div>
                  
                  {/* Post Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center space-x-1 hover:text-green-200 transition-colors ${
                          post.isLiked ? 'text-green-200' : ''
                        }`}
                      >
                        <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                        <span>{post.engagement.likeCount}</span>
                      </button>
                      <button
                        onClick={() => {
                          const el = document.getElementById(`comment-input-${post._id}`);
                          if (el) el.focus();
                        }}
                        className="flex items-center space-x-1 hover:text-green-200 transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span>{post.engagement.commentCount}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-green-200 transition-colors">
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment composer */}
                  <div className="mb-4 flex items-center space-x-2">
                    <input
                      id={`comment-input-${post._id}`}
                      type="text"
                      value={commentDrafts[post._id] || ''}
                      onChange={(e) => onChangeDraft(post._id, e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 rounded-xl bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      onClick={() => submitComment(post._id)}
                      className="cursor-pointer rounded-xl bg-white py-2 px-4 font-medium text-[#0F9D58] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm"
                      disabled={addCommentMutation.isLoading}
                    >
                      Comment
                    </button>
                  </div>

                  {/* Comments list */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3">
                      {post.comments.map((c) => (
                        <div key={c._id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                            {c.author?.profilePicture ? (
                              <img
                                src={c.author.profilePicture}
                                alt={c.author?.name || 'User'}
                                className="w-8 h-8 object-cover"
                              />
                            ) : (
                              <span className="text-xs text-white font-medium">
                                {(c.author?.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-white">
                                {c.author?.name || 'Unknown'}
                              </span>
                              <span className="text-xs opacity-75">
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-white mt-1">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0b0d12] border border-gray-800/60 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {group.isPrivate ? 'Request to Join' : 'Join'} {group.name}
            </h3>
            <p className="text-gray-600 mb-6">
              {group.isPrivate
                ? 'This is a private group. Your request will be sent to group admins for approval.'
                : "Are you sure you want to join this group? You'll be able to see and create posts."}
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
                {joinGroupMutation.isLoading ? (group.isPrivate ? 'Requesting...' : 'Joining...') : (group.isPrivate ? 'Send Request' : 'Join Group')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
