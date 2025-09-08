const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  coverImage: {
    type: String,
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // College is now fixed to Srishakthi College of Engineering
  // No need for college field since only one college is allowed
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  memberCount: {
    type: Number,
    default: 1,
    min: 1
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  },
  settings: {
    allowMemberPosts: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ creator: 1 });
groupSchema.index({ isActive: 1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ 'pendingRequests.user': 1 });

// Virtual for checking if user is member
groupSchema.virtual('isMember').get(function() {
  return (userId) => {
    return this.members.some(member => member.user.toString() === userId.toString());
  };
});

// Virtual for checking if user is admin/moderator
groupSchema.virtual('isAdmin').get(function() {
  return (userId) => {
    const member = this.members.find(member => member.user.toString() === userId.toString());
    return member && (member.role === 'admin' || member.role === 'moderator');
  };
});

// Method to add member
groupSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => member.user.toString() === userId.toString());
  
  if (existingMember) {
    throw new Error('User is already a member of this group');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  
  this.memberCount = this.members.length;
  return this.save();
};

// Method to add a join request
groupSchema.methods.addJoinRequest = function(userId) {
  const alreadyMember = this.members.some(m => m.user.toString() === userId.toString());
  if (alreadyMember) throw new Error('User is already a member of this group');
  const alreadyRequested = this.pendingRequests.some(r => r.user.toString() === userId.toString());
  if (alreadyRequested) throw new Error('Join request already pending');
  this.pendingRequests.push({ user: userId, requestedAt: new Date() });
  return this.save();
};

// Approve a join request
groupSchema.methods.approveJoinRequest = function(userId, role = 'member') {
  const reqIndex = this.pendingRequests.findIndex(r => r.user.toString() === userId.toString());
  if (reqIndex === -1) throw new Error('No pending request for this user');
  this.pendingRequests.splice(reqIndex, 1);
  const exists = this.members.some(m => m.user.toString() === userId.toString());
  if (!exists) {
    this.members.push({ user: userId, role, joinedAt: new Date() });
    this.memberCount = this.members.length;
  }
  return this.save();
};

// Reject a join request
groupSchema.methods.rejectJoinRequest = function(userId) {
  const reqIndex = this.pendingRequests.findIndex(r => r.user.toString() === userId.toString());
  if (reqIndex === -1) throw new Error('No pending request for this user');
  this.pendingRequests.splice(reqIndex, 1);
  return this.save();
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => member.user.toString() === userId.toString());
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this group');
  }
  
  // Don't allow removing the creator
  if (this.creator.toString() === userId.toString()) {
    throw new Error('Cannot remove the group creator');
  }
  
  this.members.splice(memberIndex, 1);
  this.memberCount = this.members.length;
  return this.save();
};

// Method to update member role
groupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  
  if (!member) {
    throw new Error('User is not a member of this group');
  }
  
  member.role = newRole;
  return this.save();
};

// Method to get member info
groupSchema.methods.getMemberInfo = function(userId) {
  return this.members.find(member => member.user.toString() === userId.toString());
};

// Pre-save middleware to ensure creator is a member
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add creator as admin member
    this.members.push({
      user: this.creator,
      role: 'admin',
      joinedAt: new Date()
    });
    this.memberCount = 1;
  }
  next();
});

// Ensure virtual fields are serialized
groupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
