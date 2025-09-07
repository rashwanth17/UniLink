import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { postService } from '../services/postService';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar,
  Edit3,
  Camera,
  MessageCircle,
  Heart,
  Users
} from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, updateProfile, uploadAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Determine if viewing own profile or another user's
  const isOwnProfile = !userId || userId === currentUser?._id;
  const targetUserId = userId || currentUser?._id;

  // Fetch user profile only when viewing someone else's profile
  const { data: userData, isLoading: userLoading } = useQuery(
    ['user', targetUserId],
    () => authService.getUsersByCollege(currentUser?.college, 1, 100).then(data => {
      const user = data.data.users.find(u => u._id === targetUserId);
      return { success: true, data: { user } };
    }),
    {
      enabled: !!targetUserId && !!currentUser && !isOwnProfile,
    }
  );

  // Fetch user's posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['user-posts', targetUserId],
    () => postService.getUserPosts(targetUserId),
    {
      enabled: !!targetUserId,
    }
  );

  const user = isOwnProfile ? currentUser : userData?.data?.user;
  const posts = postsData?.data?.posts || [];

  const handleEdit = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      graduationYear: user?.graduationYear || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const payload = {
      name: editData.name,
      bio: editData.bio,
      graduationYear: editData.graduationYear ? parseInt(editData.graduationYear) : undefined,
    };
    const res = await updateProfile(payload);
    if (res?.success) setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (!isOwnProfile && userLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
        <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {isOwnProfile && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      await uploadAvatar(file);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                  <Camera size={16} />
                </button>
              </>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h1>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap size={16} />
                    <span>{user.college}</span>
                  </div>
                  {user.graduationYear && (
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>Class of {user.graduationYear}</span>
                    </div>
                  )}
                </div>
                {user.bio && (
                  <p className="mt-3 text-gray-700">{user.bio}</p>
                )}
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={handleEdit}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Profile
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={editData.graduationYear}
                  onChange={(e) => setEditData({...editData, graduationYear: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <MessageCircle className="h-5 w-5 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              {posts.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Posts</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-gray-900">
              {posts.reduce((total, post) => total + post.engagement.likeCount, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Likes Received</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">
              {user.groups?.length || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Groups Joined</p>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
        </h2>
        
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
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? 'No posts yet' : 'No posts to show'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isOwnProfile 
                ? 'Start sharing your thoughts with your college community!'
                : 'This user hasn\'t posted anything yet.'
              }
            </p>
            {isOwnProfile && (
              <Link to="/" className="btn-primary">
                Explore Groups
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card-hover">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Link to={`/groups/${post.group._id}`}>
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {post.group.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link
                        to={`/groups/${post.group._id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        {post.group.name}
                      </Link>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart size={16} />
                        <span>{post.engagement.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={16} />
                        <span>{post.engagement.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
