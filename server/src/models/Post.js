const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post content cannot be more than 2000 characters']
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    filename: {
      type: String
    },
    size: {
      type: Number
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'group', 'private'],
    default: 'group'
  },
  engagement: {
    likeCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ author: 1 });
postSchema.index({ group: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isActive: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ 'engagement.likeCount': -1 });
postSchema.index({ content: 'text' });

// Virtual for checking if user liked the post
postSchema.virtual('isLikedBy').get(function() {
  return (userId) => {
    return this.likes.some(like => like.user.toString() === userId.toString());
  };
});

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (existingLikeIndex > -1) {
    // Remove like
    this.likes.splice(existingLikeIndex, 1);
    this.engagement.likeCount = Math.max(0, this.engagement.likeCount - 1);
  } else {
    // Add like
    this.likes.push({
      user: userId,
      likedAt: new Date()
    });
    this.engagement.likeCount += 1;
  }
  
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  });
  this.engagement.commentCount += 1;
  return this.save();
};

// Method to remove comment
postSchema.methods.removeComment = function(commentId, userId) {
  const commentIndex = this.comments.findIndex(comment => 
    comment._id.toString() === commentId.toString()
  );
  
  if (commentIndex === -1) {
    throw new Error('Comment not found');
  }
  
  const comment = this.comments[commentIndex];
  
  // Only allow author or post author to delete comment
  if (comment.author.toString() !== userId.toString() && this.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this comment');
  }
  
  this.comments.splice(commentIndex, 1);
  this.engagement.commentCount = Math.max(0, this.engagement.commentCount - 1);
  return this.save();
};

// Method to like/unlike comment
postSchema.methods.toggleCommentLike = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  const existingLikeIndex = comment.likes.findIndex(like => like.toString() === userId.toString());
  
  if (existingLikeIndex > -1) {
    comment.likes.splice(existingLikeIndex, 1);
  } else {
    comment.likes.push(userId);
  }
  
  return this.save();
};

// Pre-save middleware to update engagement counts
postSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.engagement.likeCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.engagement.commentCount = this.comments.length;
  }
  next();
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
