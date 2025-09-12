import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { postService } from '../services/postService';
import { 
  Image, 
  Video, 
  X, 
  Tag, 
  Plus,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    content: '',
    tags: [],
    visibility: 'group',
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch group details
  const { data: groupData } = useQuery(
    ['group', groupId],
    () => groupService.getGroup(groupId),
    {
      enabled: !!groupId,
    }
  );

  const createPostMutation = useMutation(
    (postData) => postService.createPost(postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group-posts', groupId]);
        queryClient.invalidateQueries(['group', groupId]);
        queryClient.invalidateQueries(['recent-posts']);
        toast.success('Post created successfully!');
        navigate(`/groups/${groupId}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create post');
      },
    }
  );

  const group = groupData?.data?.group;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 50MB`);
        return false;
      }
      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const handleRemoveFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media to your post');
      return;
    }

    setIsLoading(true);
    
    const postData = {
      content: formData.content,
      groupId: groupId,
      tags: formData.tags,
      visibility: formData.visibility,
      media: mediaFiles,
    };

    createPostMutation.mutate(postData);
  };

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
        <p className="text-gray-600 mb-6">The group you're trying to post to doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Post
        </h1>
        <p className="text-gray-600">
          Share something with <span className="font-medium">{group.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Content */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">What's on your mind?</h2>
                <p className="opacity-90">Share your thoughts with the group</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Tag size={24} />
              </div>
            </div>
            
            <textarea
              name="content"
              rows={6}
              className="w-full rounded-xl bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Share your thoughts, ideas, or updates with the group..."
              value={formData.content}
              onChange={handleChange}
              maxLength={2000}
            />
            <p className="mt-1 text-xs opacity-75">
              {formData.content.length}/2000 characters
            </p>
          </div>
        </div>

        {/* Media Upload */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Add Media (Optional)</h2>
                <p className="opacity-90">Upload images or videos</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Image size={24} />
              </div>
            </div>
            
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Upload Images or Videos
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="flex space-x-2">
                      <Image className="h-8 w-8 text-white/70" />
                      <Video className="h-8 w-8 text-white/70" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs opacity-75">
                        Images and videos up to 50MB each (max 5 files)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-white/10">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <p className="mt-1 text-xs opacity-75 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Tags (Optional)</h2>
                <p className="opacity-90">Add tags to categorize your post</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Tag size={24} />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-white/70" />
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full rounded-xl bg-white/20 border border-white/30 px-3 py-2 pl-10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Add a tag"
                    maxLength={30}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="cursor-pointer rounded-xl bg-white py-2 px-4 font-medium text-green-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-white hover:text-white/70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#107C10] to-[#5DBE3F] text-white transition-transform duration-300 hover:-translate-y-2">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Visibility</h2>
                <p className="opacity-90">Choose who can see your post</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Eye size={24} />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  value="group"
                  checked={formData.visibility === 'group'}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-white/30 bg-white/20"
                />
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-white/70" />
                  <span className="text-sm font-medium text-white">
                    Group members only
                  </span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-white/30 bg-white/20"
                />
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-white/70" />
                  <span className="text-sm font-medium text-white">
                    Public (visible to all college students)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex-1 cursor-pointer rounded-xl bg-white/20 py-3 font-medium text-white border border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || (!formData.content.trim() && mediaFiles.length === 0)}
            className="flex-1 cursor-pointer rounded-xl bg-white py-3 font-medium text-green-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Post...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
