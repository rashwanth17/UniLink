// import React, { useState, useRef } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { useQuery } from 'react-query';
// import { useAuth } from '../context/AuthContext';
// import { authService } from '../services/authService';
// import { postService } from '../services/postService';
// import { 
//   User, 
//   Mail, 
//   GraduationCap, 
//   Calendar,
//   Edit3,
//   Camera,
//   MessageCircle,
//   Heart,
//   Users
// } from 'lucide-react';

// const ProfilePage = () => {
//   const { userId } = useParams();
//   const { user: currentUser, updateProfile, uploadAvatar } = useAuth();
//   const fileInputRef = useRef(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({});

//   // Determine if viewing own profile or another user's
//   const isOwnProfile = !userId || userId === currentUser?._id;
//   const targetUserId = userId || currentUser?._id;

//   // Fetch user profile only when viewing someone else's profile
//   const { data: userData, isLoading: userLoading } = useQuery(
//     ['user', targetUserId],
//     () => authService.getUsersByCollege(currentUser?.college, 1, 100).then(data => {
//       const user = data.data.users.find(u => u._id === targetUserId);
//       return { success: true, data: { user } };
//     }),
//     {
//       enabled: !!targetUserId && !!currentUser && !isOwnProfile,
//     }
//   );

//   // Fetch user's posts
//   const { data: postsData, isLoading: postsLoading } = useQuery(
//     ['user-posts', targetUserId],
//     () => postService.getUserPosts(targetUserId),
//     {
//       enabled: !!targetUserId,
//     }
//   );

//   const user = isOwnProfile ? currentUser : userData?.data?.user;
//   const posts = postsData?.data?.posts || [];

//   const handleEdit = () => {
//     setEditData({
//       name: user?.name || '',
//       bio: user?.bio || '',
//       graduationYear: user?.graduationYear || '',
//     });
//     setIsEditing(true);
//   };

//   const handleSave = async () => {
//     const payload = {
//       name: editData.name,
//       bio: editData.bio,
//       graduationYear: editData.graduationYear ? parseInt(editData.graduationYear) : undefined,
//     };
//     const res = await updateProfile(payload);
//     if (res?.success) setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditData({});
//   };

//   if (!isOwnProfile && userLoading) {
//     return (
//       <div className="max-w-4xl mx-auto">
//         <div className="animate-pulse">
//           <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="card">
//                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
//                 <div className="h-3 bg-gray-200 rounded w-full"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="max-w-4xl mx-auto text-center py-12">
//         <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
//         <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
//         <Link to="/" className="bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white hover:-translate-y-1 transition-all duration-300 px-6 py-3 rounded-xl font-medium shadow-lg">
//           Back to Dashboard
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Profile Header */}
//       <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-1 mb-6">
//         <div className="p-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
//           {/* Profile Picture */}
//           <div className="relative">
//             {user.profilePicture ? (
//               <img
//                 src={user.profilePicture}
//                 alt={user.name}
//                 className="w-24 h-24 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-2xl">
//                   {user.name.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//             )}
//             {isOwnProfile && (
//               <>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={async (e) => {
//                     const file = e.target.files && e.target.files[0];
//                     if (file) {
//                       await uploadAvatar(file);
//                       e.target.value = '';
//                     }
//                   }}
//                 />
//                 <button
//                   onClick={() => fileInputRef.current && fileInputRef.current.click()}
//                   className="absolute bottom-0 right-0 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
//                 >
//                   <Camera size={16} />
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Profile Info */}
//           <div className="flex-1">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-white mb-2">
//                   {user.name}
//                 </h1>
//                 <div className="space-y-2 text-sm text-white/90">
//                   <div className="flex items-center space-x-2">
//                     <Mail size={16} />
//                     <span>{user.email}</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <GraduationCap size={16} />
//                     <span>{user.college}</span>
//                   </div>
//                   {user.graduationYear && (
//                     <div className="flex items-center space-x-2">
//                       <Calendar size={16} />
//                       <span>Class of {user.graduationYear}</span>
//                     </div>
//                   )}
//                 </div>
//                 {user.bio && (
//                   <p className="mt-3 text-white/80">{user.bio}</p>
//                 )}
//               </div>
              
//               {isOwnProfile && (
//                 <button
//                   onClick={handleEdit}
//                   className="bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 px-4 py-2 rounded-xl flex items-center space-x-2"
//                 >
//                   <Edit3 size={16} />
//                   <span>Edit Profile</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//         </div>
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-1 max-w-md w-full mx-4 shadow-xl">
//             <div className="p-6">
//               <div className="flex items-center space-x-3 mb-6">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
//                   <Edit3 size={20} />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold text-white">
//                     Edit Profile
//                   </h3>
//                   <p className="text-sm text-white/90">Update your profile information</p>
//                 </div>
//               </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-white/90 mb-2">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   value={editData.name}
//                   onChange={(e) => setEditData({...editData, name: e.target.value})}
//                   className="w-full px-4 py-3 border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-white/90 mb-2">
//                   Bio
//                 </label>
//                 <textarea
//                   rows={3}
//                   value={editData.bio}
//                   onChange={(e) => setEditData({...editData, bio: e.target.value})}
//                   className="w-full px-4 py-3 border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm resize-none"
//                   placeholder="Tell us about yourself..."
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-white/90 mb-2">
//                   Graduation Year
//                 </label>
//                 <input
//                   type="number"
//                   min="2020"
//                   max="2030"
//                   value={editData.graduationYear}
//                   onChange={(e) => setEditData({...editData, graduationYear: e.target.value})}
//                   className="w-full px-4 py-3 border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm"
//                 />
//               </div>
//             </div>
            
//             <div className="flex space-x-3 mt-6">
//               <button
//                 onClick={handleCancel}
//                 className="flex-1 bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 px-4 py-3 rounded-xl font-medium backdrop-blur-sm"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="flex-1 bg-white text-blue-600 hover:-translate-y-1 transition-all duration-300 px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//         <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
//           <div className="p-4 text-center">
//             <div className="flex items-center justify-center space-x-2 mb-2">
//               <MessageCircle className="h-5 w-5 text-white" />
//               <span className="text-2xl font-bold text-white">
//                 {posts.length}
//               </span>
//             </div>
//             <p className="text-sm text-white/90">Posts</p>
//           </div>
//         </div>
        
//         <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-1">
//           <div className="p-4 text-center">
//             <div className="flex items-center justify-center space-x-2 mb-2">
//               <Heart className="h-5 w-5 text-white" />
//               <span className="text-2xl font-bold text-white">
//                 {posts.reduce((total, post) => total + post.engagement.likeCount, 0)}
//               </span>
//             </div>
//             <p className="text-sm text-white/90">Likes Received</p>
//           </div>
//         </div>
        
//         <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-1">
//           <div className="p-4 text-center">
//             <div className="flex items-center justify-center space-x-2 mb-2">
//               <Users className="h-5 w-5 text-white" />
//               <span className="text-2xl font-bold text-white">
//                 {user.groups?.length || 0}
//               </span>
//             </div>
//             <p className="text-sm text-white/90">Groups Joined</p>
//           </div>
//         </div>
//       </div>

//       {/* Posts */}
//       <div>
//         <div className="mb-6">
//           <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
//             <div className="p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
//                   <MessageCircle size={20} />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-bold">
//                     {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
//                   </h2>
//                   <p className="text-sm opacity-90">
//                     {posts.length} post{posts.length !== 1 ? 's' : ''} shared
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {postsLoading ? (
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="card animate-pulse">
//                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
//                 <div className="h-3 bg-gray-200 rounded w-full"></div>
//               </div>
//             ))}
//           </div>
//         ) : posts.length === 0 ? (
//           <div className="text-center py-12">
//             <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               {isOwnProfile ? 'No posts yet' : 'No posts to show'}
//             </h3>
//             <p className="text-gray-500 mb-6">
//               {isOwnProfile 
//                 ? 'Start sharing your thoughts with your college community!'
//                 : 'This user hasn\'t posted anything yet.'
//               }
//             </p>
//             {isOwnProfile && (
//               <Link to="/" className="bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white hover:-translate-y-1 transition-all duration-300 px-6 py-3 rounded-xl font-medium shadow-lg">
//                 Explore Groups
//               </Link>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {posts.map((post) => (
//               <div key={post._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
//                 <div className="p-4">
//                   <div className="flex items-start space-x-3">
//                     <div className="flex-shrink-0">
//                       <Link to={`/groups/${post.group._id}`}>
//                         <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                           <span className="text-white font-medium text-sm">
//                             {post.group.name.charAt(0).toUpperCase()}
//                           </span>
//                         </div>
//                       </Link>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center space-x-2 mb-2">
//                         <Link
//                           to={`/groups/${post.group._id}`}
//                           className="text-sm font-medium text-white hover:text-white/80"
//                         >
//                           {post.group.name}
//                         </Link>
//                         <span className="text-sm text-white/60">•</span>
//                         <span className="text-sm text-white/60">
//                           {new Date(post.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                       <p className="text-white mb-3 line-clamp-3">
//                         {post.content}
//                       </p>
//                       <div className="flex items-center space-x-4 text-sm text-white/80">
//                         <div className="flex items-center space-x-1">
//                           <Heart size={16} />
//                           <span>{post.engagement.likeCount}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <MessageCircle size={16} />
//                           <span>{post.engagement.commentCount}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
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
        <Link to="/" className="bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white hover:-translate-y-1 transition-all duration-300 px-6 py-3 rounded-xl font-medium shadow-lg">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-1 mb-6">
        <div className="p-6">
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
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
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
                  className="absolute bottom-0 right-0 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
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
                <h1 className="text-2xl font-bold text-white mb-2">
                  {user.name}
                </h1>
                <div className="space-y-2 text-sm text-white/90">
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
                  <p className="mt-3 text-white/80">{user.bio}</p>
                )}
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 px-4 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white transition-transform duration-300 hover:-translate-y-1 max-w-md w-full mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-white/90">Update your profile information</p>
                </div>
              </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  className="w-full px-4 py-3 border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={editData.graduationYear}
                  onChange={(e) => setEditData({...editData, graduationYear: e.target.value})}
                  className="w-full px-4 py-3 border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 px-4 py-3 rounded-xl font-medium backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-white text-blue-600 hover:-translate-y-1 transition-all duration-300 px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <span className="text-2xl font-bold text-white">
                {posts.length}
              </span>
            </div>
            <p className="text-sm text-white/90">Posts</p>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-1">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-white" />
              <span className="text-2xl font-bold text-white">
                {posts.reduce((total, post) => total + post.engagement.likeCount, 0)}
              </span>
            </div>
            <p className="text-sm text-white/90">Likes Received</p>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-1">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-white" />
              <span className="text-2xl font-bold text-white">
                {user.groups?.length || 0}
              </span>
            </div>
            <p className="text-sm text-white/90">Groups Joined</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <div className="mb-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
                  </h2>
                  <p className="text-sm opacity-90">
                    {posts.length} post{posts.length !== 1 ? 's' : ''} shared
                  </p>
                </div>
              </div>
            </div>
          </div>
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
              <Link to="/" className="bg-gradient-to-r from-[#0078D4] to-[#50B6FF] text-white hover:-translate-y-1 transition-all duration-300 px-6 py-3 rounded-xl font-medium shadow-lg">
                Explore Groups
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F9D58] to-[#3DDB94] text-white transition-transform duration-300 hover:-translate-y-1">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Link to={`/groups/${post.group._id}`}>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {post.group.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link
                          to={`/groups/${post.group._id}`}
                          className="text-sm font-medium text-white hover:text-white/80"
                        >
                          {post.group.name}
                        </Link>
                        <span className="text-sm text-white/60">•</span>
                        <span className="text-sm text-white/60">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white mb-3 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-white/80">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;