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
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What's on your mind?
          </h2>
          
          <textarea
            name="content"
            rows={6}
            className="input-field"
            placeholder="Share your thoughts, ideas, or updates with the group..."
            value={formData.content}
            onChange={handleChange}
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.content.length}/2000 characters
          </p>
        </div>

        {/* Media Upload */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add Media (Optional)
          </h2>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images or Videos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
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
                    <Image className="h-8 w-8 text-gray-400" />
                    <Video className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
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
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
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
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tags (Optional)
          </h2>
          
          <form onSubmit={handleAddTag} className="mb-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Add a tag"
                  maxLength={30}
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Tags Display */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Visibility
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="visibility"
                value="group"
                checked={formData.visibility === 'group'}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
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
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Public (visible to all college students)
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || (!formData.content.trim() && mediaFiles.length === 0)}
            className="flex-1 btn-primary"
          >
            {isLoading ? 'Creating Post...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
