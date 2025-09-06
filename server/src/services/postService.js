const Post = require('../models/Post');
const Group = require('../models/Group');

class PostService {
  // Get posts with filters and pagination
  static async getPosts(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(filters)
      .populate('author', 'name email profilePicture college')
      .populate('group', 'name description')
      .populate('likes.user', 'name email profilePicture')
      .populate('comments.author', 'name email profilePicture')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Post.countDocuments(filters);

    return {
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  // Get single post by ID
  static async getPostById(postId) {
    return await Post.findById(postId)
      .populate('author', 'name email profilePicture college')
      .populate('group', 'name description')
      .populate('likes.user', 'name email profilePicture')
      .populate('comments.author', 'name email profilePicture');
  }

  // Create new post
  static async createPost(postData) {
    const post = await Post.create(postData);
    
    // Update group post count
    await Group.findByIdAndUpdate(
      postData.group,
      { $inc: { postCount: 1 } }
    );

    return await post.populate('author', 'name email profilePicture college');
  }

  // Update post
  static async updatePost(postId, updateData) {
    return await Post.findByIdAndUpdate(
      postId,
      { ...updateData, isEdited: true, editedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  // Delete post (soft delete)
  static async deletePost(postId) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { isActive: false },
      { new: true }
    );

    if (post) {
      // Update group post count
      await Group.findByIdAndUpdate(
        post.group,
        { $inc: { postCount: -1 } }
      );
    }

    return post;
  }

  // Toggle like on post
  static async togglePostLike(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) return null;

    await post.toggleLike(userId);
    return post;
  }

  // Add comment to post
  static async addComment(postId, authorId, content) {
    const post = await Post.findById(postId);
    if (!post) return null;

    await post.addComment(authorId, content);
    return post;
  }

  // Remove comment from post
  static async removeComment(postId, commentId, userId) {
    const post = await Post.findById(postId);
    if (!post) return null;

    await post.removeComment(commentId, userId);
    return post;
  }

  // Toggle like on comment
  static async toggleCommentLike(postId, commentId, userId) {
    const post = await Post.findById(postId);
    if (!post) return null;

    await post.toggleCommentLike(commentId, userId);
    return post;
  }

  // Get posts by user
  static async getPostsByUser(userId, page = 1, limit = 10) {
    return await this.getPosts(
      { author: userId, isActive: true },
      page,
      limit
    );
  }

  // Get posts by group
  static async getPostsByGroup(groupId, page = 1, limit = 10) {
    return await this.getPosts(
      { group: groupId, isActive: true },
      page,
      limit
    );
  }

  // Search posts
  static async searchPosts(searchTerm, filters = {}, page = 1, limit = 10) {
    const searchFilters = {
      ...filters,
      $or: [
        { content: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    return await this.getPosts(searchFilters, page, limit);
  }

  // Get trending posts (most liked in last 7 days)
  static async getTrendingPosts(filters = {}, page = 1, limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingFilters = {
      ...filters,
      createdAt: { $gte: sevenDaysAgo },
      isActive: true
    };

    return await this.getPosts(trendingFilters, page, limit, 'engagement.likeCount', 'desc');
  }

  // Get post statistics
  static async getPostStats(postId) {
    const post = await Post.findById(postId);
    if (!post) return null;

    return {
      likeCount: post.engagement.likeCount,
      commentCount: post.engagement.commentCount,
      shareCount: post.engagement.shareCount,
      viewCount: post.engagement.viewCount || 0
    };
  }

  // Get user's post statistics
  static async getUserPostStats(userId) {
    const stats = await Post.aggregate([
      { $match: { author: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$engagement.likeCount' },
          totalComments: { $sum: '$engagement.commentCount' },
          avgLikes: { $avg: '$engagement.likeCount' },
          avgComments: { $avg: '$engagement.commentCount' }
        }
      }
    ]);

    return stats[0] || {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      avgLikes: 0,
      avgComments: 0
    };
  }

  // Get group's post statistics
  static async getGroupPostStats(groupId) {
    const stats = await Post.aggregate([
      { $match: { group: groupId, isActive: true } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$engagement.likeCount' },
          totalComments: { $sum: '$engagement.commentCount' },
          avgLikes: { $avg: '$engagement.likeCount' },
          avgComments: { $avg: '$engagement.commentCount' }
        }
      }
    ]);

    return stats[0] || {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      avgLikes: 0,
      avgComments: 0
    };
  }
}

module.exports = PostService;
