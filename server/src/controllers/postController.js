const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const Group = require('../models/Group');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { extractFilesInfo } = require('../utils/fileUpload');

// @desc    Get posts
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    groupId, 
    userId, 
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  let query = { isActive: true };

  // Filter by group
  if (groupId) {
    query.group = groupId;
  }

  // Filter by user
  if (userId) {
    query.author = userId;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const posts = await Post.find(query)
    .populate('author', 'name email profilePicture college')
    .populate('group', 'name description')
    .populate('likes.user', 'name email profilePicture')
    .populate('comments.author', 'name email profilePicture')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Add user interaction data
  const currentUserId = req.user._id;
  const postsWithInteractions = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.isLikedBy(currentUserId);
    postObj.userCanEdit = post.author._id.toString() === currentUserId.toString();
    postObj.userCanDelete = post.author._id.toString() === currentUserId.toString() || 
                           req.user.role === 'admin';
    return postObj;
  });

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithInteractions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name email profilePicture college')
    .populate('group', 'name description')
    .populate('likes.user', 'name email profilePicture')
    .populate('comments.author', 'name email profilePicture');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (!post.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Post is not active'
    });
  }

  const userId = req.user._id;
  const postObj = post.toObject();
  postObj.isLiked = post.isLikedBy(userId);
  postObj.userCanEdit = post.author._id.toString() === userId.toString();
  postObj.userCanDelete = post.author._id.toString() === userId.toString() || 
                         req.user.role === 'admin';

  res.status(200).json({
    success: true,
    data: { post: postObj }
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { content, groupId, visibility = 'group' } = req.body;
  let { tags } = req.body;

  // Normalize tags when coming from multipart/form-data
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) tags = parsed;
      else if (parsed) tags = [String(parsed)];
    } catch (_) {
      // Fallback: comma separated
      tags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  if (!Array.isArray(tags)) tags = [];
  const userId = req.user._id;

  // Verify group exists and user is a member
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Group is not active'
    });
  }

  // Check if user is a member of the group
  const isMember = group.members.some(member => 
    member.user.toString() === userId.toString()
  );

  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You must be a member of the group to post'
    });
  }

  // Extract file information if files were uploaded
  // Debug log to help trace media uploads in dev
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('CreatePost upload debug:', {
        hasFiles: Boolean(req.files),
        filesCount: Array.isArray(req.files) ? req.files.length : (req.files ? 1 : 0),
        fieldNames: req.files && req.files.map?.(f => f.fieldname)
      });
    } catch (_) {}
  }

  const media = extractFilesInfo(req.files);

  // Create post
  let post;
  try {
    post = await Post.create({
      author: userId,
      group: groupId,
      content,
      media,
      tags: tags || [],
      visibility
    });
  } catch (err) {
    console.error('CreatePost error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create post' });
  }

  // Update group post count
  group.postCount += 1;
  await group.save();

  // Populate the created post
  await post.populate('author', 'name email profilePicture college');
  await post.populate('group', 'name description');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: { post }
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const { content, tags, visibility } = req.body;
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user is authorized to update
  const isAuthorized = post.author.toString() === userId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this post'
    });
  }

  // Update fields
  if (content) post.content = content;
  if (tags) post.tags = tags;
  if (visibility) post.visibility = visibility;
  
  post.isEdited = true;
  post.editedAt = new Date();

  await post.save();

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: { post }
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user is authorized to delete
  const isAuthorized = post.author.toString() === userId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this post'
    });
  }

  // Soft delete - mark as inactive
  post.isActive = false;
  await post.save();

  // Update group post count
  const group = await Group.findById(post.group);
  if (group) {
    group.postCount = Math.max(0, group.postCount - 1);
    await group.save();
  }

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (!post.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Post is not active'
    });
  }

  // Toggle like
  await post.toggleLike(userId);

  // Get updated post with populated likes
  const updatedPost = await Post.findById(postId)
    .populate('likes.user', 'name email profilePicture');

  res.status(200).json({
    success: true,
    message: 'Like toggled successfully',
    data: {
      isLiked: updatedPost.isLikedBy(userId),
      likeCount: updatedPost.engagement.likeCount
    }
  });
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Comment content is required'
    });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (!post.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Post is not active'
    });
  }

  // Add comment
  await post.addComment(userId, content.trim());

  // Get updated post with populated comments
  const updatedPost = await Post.findById(postId)
    .populate('comments.author', 'name email profilePicture')
    .populate('comments.likes', 'name email profilePicture');

  const newComment = updatedPost.comments[updatedPost.comments.length - 1];

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      comment: newComment,
      commentCount: updatedPost.engagement.commentCount
    }
  });
});

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Remove comment
  await post.removeComment(commentId, userId);

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
    data: {
      commentCount: post.engagement.commentCount
    }
  });
});

// @desc    Like/Unlike comment
// @route   POST /api/posts/:id/comments/:commentId/like
// @access  Private
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Toggle comment like
  await post.toggleCommentLike(commentId, userId);

  // Get updated comment
  const comment = post.comments.id(commentId);
  const isLiked = comment.likes.includes(userId);

  res.status(200).json({
    success: true,
    message: 'Comment like toggled successfully',
    data: {
      isLiked,
      likeCount: comment.likes.length
    }
  });
});

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const posts = await Post.find({ 
    author: userId, 
    isActive: true 
  })
    .populate('author', 'name email profilePicture college')
    .populate('group', 'name description')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Post.countDocuments({ 
    author: userId, 
    isActive: true 
  });

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get group's posts
// @route   GET /api/posts/group/:groupId
// @access  Private
const getGroupPosts = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Verify group exists and user is a member
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const userId = req.user._id;
  const isMember = group.members.some(member => 
    member.user.toString() === userId.toString()
  );

  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You must be a member of the group to view posts'
    });
  }

  const posts = await Post.find({ 
    group: groupId, 
    isActive: true 
  })
    .populate('author', 'name email profilePicture college')
    .populate('group', 'name description')
    .populate('likes.user', 'name email profilePicture')
    .populate('comments.author', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Add user interaction data
  const postsWithInteractions = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.isLikedBy(userId);
    postObj.userCanEdit = post.author._id.toString() === userId.toString();
    postObj.userCanDelete = post.author._id.toString() === userId.toString() || 
                           req.user.role === 'admin';
    return postObj;
  });

  const total = await Post.countDocuments({ 
    group: groupId, 
    isActive: true 
  });

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithInteractions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  toggleCommentLike,
  getUserPosts,
  getGroupPosts
};
