import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { Users, Lock, Tag, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createGroupMutation = useMutation(
    (groupData) => groupService.createGroup(groupData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['groups']);
        toast.success('Group created successfully!');
        navigate(`/groups/${response.data.group._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create group');
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsLoading(true);
    createGroupMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Group
        </h1>
        <p className="text-gray-600">
          Start a new group for {user?.college} students to connect and share.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Group Information
          </h2>
          
          {/* Group Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field pl-10"
                placeholder="Enter group name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="input-field"
              placeholder="Describe what this group is about..."
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Privacy Setting */}
          <div className="mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Make this a private group
                </span>
              </div>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Private groups require approval to join
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tags
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add tags to help others find your group
          </p>
          
          {/* Tag Input */}
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

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="flex-1 btn-primary"
          >
            {isLoading ? 'Creating Group...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
