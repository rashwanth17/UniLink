const { validationResult } = require('express-validator');
const Group = require('../models/Group');
const User = require('../models/User');
const Post = require('../models/Post');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, college, search } = req.query;
  const userId = req.user._id;

  // Build query
  let query = { isActive: true };

  // Filter by college if specified
  if (college) {
    query.college = college;
  }

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const groups = await Group.find(query)
    .populate('creator', 'name email profilePicture')
    .populate('members.user', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Add membership status for each group
  const groupsWithMembership = groups.map(group => {
    const groupObj = group.toObject();
    const isMember = group.members.some(member => 
      member.user._id.toString() === userId.toString()
    );
    const memberInfo = group.members.find(member => 
      member.user._id.toString() === userId.toString()
    );
    
    groupObj.isMember = isMember;
    groupObj.memberRole = memberInfo ? memberInfo.role : null;
    
    return groupObj;
  });

  const total = await Group.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      groups: groupsWithMembership,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('creator', 'name email profilePicture bio college')
    .populate('members.user', 'name email profilePicture bio college')
    .populate('pendingRequests.user', 'name email profilePicture');

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

  const userId = req.user._id;
  const groupObj = group.toObject();
  
  // Check membership status
  const isMember = group.members.some(member => 
    member.user._id.toString() === userId.toString()
  );
  const memberInfo = group.members.find(member => 
    member.user._id.toString() === userId.toString()
  );
  
  groupObj.isMember = isMember;
  groupObj.memberRole = memberInfo ? memberInfo.role : null;
  groupObj.isAdmin = memberInfo && (memberInfo.role === 'admin' || memberInfo.role === 'moderator');
  groupObj.isCreator = group.creator._id.toString() === userId.toString();

  // Only show pendingRequests to admins/creator/system admin
  if (!(groupObj.isAdmin || groupObj.isCreator || req.user.role === 'admin')) {
    delete groupObj.pendingRequests;
  }

  res.status(200).json({
    success: true,
    data: { group: groupObj }
  });
});

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, description, isPrivate, tags } = req.body;
  const userId = req.user._id;
  const userCollege = req.user.college;

  // Create group
  const group = await Group.create({
    name,
    description,
    creator: userId,
    college: userCollege,
    isPrivate,
    tags: tags || []
  });

  // Populate the created group
  await group.populate('creator', 'name email profilePicture');
  await group.populate('members.user', 'name email profilePicture');

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: { group }
  });
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = asyncHandler(async (req, res) => {
  const { name, description, isPrivate, tags, settings } = req.body;
  const groupId = req.params.id;
  const userId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is authorized to update
  const member = group.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  const isAuthorized = member && (member.role === 'admin' || member.role === 'moderator') ||
                      group.creator.toString() === userId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this group'
    });
  }

  // Update fields
  if (name) group.name = name;
  if (description !== undefined) group.description = description;
  if (isPrivate !== undefined) group.isPrivate = isPrivate;
  if (tags) group.tags = tags;
  if (settings) group.settings = { ...group.settings, ...settings };

  await group.save();

  res.status(200).json({
    success: true,
    message: 'Group updated successfully',
    data: { group }
  });
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is authorized to delete
  const isAuthorized = group.creator.toString() === userId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this group'
    });
  }

  // Soft delete - mark as inactive
  group.isActive = false;
  await group.save();

  // Also deactivate all posts in this group
  await Post.updateMany(
    { group: groupId },
    { isActive: false }
  );

  res.status(200).json({
    success: true,
    message: 'Group deleted successfully'
  });
});

// @desc    Join group (request if private)
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

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

  // Check if user is already a member
  const isAlreadyMember = group.members.some(member => 
    member.user.toString() === userId.toString()
  );

  if (isAlreadyMember) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this group'
    });
  }

  // Check if group is from same college
  if (group.college !== req.user.college) {
    return res.status(403).json({
      success: false,
      message: 'You can only join groups from your college'
    });
  }

  if (group.isPrivate) {
    await group.addJoinRequest(userId);
    return res.status(200).json({ success: true, message: 'Join request sent to group admins' });
  } else {
    await group.addMember(userId);
    try { await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }); } catch (e) {}
    return res.status(200).json({ success: true, message: 'Successfully joined the group' });
  }
});

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is a member
  const isMember = group.members.some(member => 
    member.user.toString() === userId.toString()
  );

  if (!isMember) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this group'
    });
  }

  // Remove user from group
  await group.removeMember(userId);
  // Sync user's groups array
  try {
    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });
  } catch (e) {
    console.error('Failed to sync user.groups on leave:', e.message);
  }

  res.status(200).json({
    success: true,
    message: 'Successfully left the group'
  });
});

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = asyncHandler(async (req, res) => {
  const { userId: newMemberId, role = 'member' } = req.body;
  const groupId = req.params.id;
  const currentUserId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if current user is authorized to add members
  const member = group.members.find(member => 
    member.user.toString() === currentUserId.toString()
  );
  
  const isAuthorized = member && (member.role === 'admin' || member.role === 'moderator') ||
                      group.creator.toString() === currentUserId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add members to this group'
    });
  }

  // Check if user exists
  const user = await User.findById(newMemberId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user is from same college
  if (user.college !== group.college) {
    return res.status(403).json({
      success: false,
      message: 'User must be from the same college'
    });
  }

  // Add member to group
  await group.addMember(newMemberId, role);
  // Sync user's groups array
  try {
    await User.findByIdAndUpdate(newMemberId, { $addToSet: { groups: groupId } });
  } catch (e) {
    console.error('Failed to sync user.groups on addMember:', e.message);
  }

  res.status(200).json({
    success: true,
    message: 'Member added successfully'
  });
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
  const { userId: memberToRemoveId } = req.params;
  const groupId = req.params.id;
  const currentUserId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if current user is authorized to remove members
  const member = group.members.find(member => 
    member.user.toString() === currentUserId.toString()
  );
  
  const isAuthorized = member && (member.role === 'admin' || member.role === 'moderator') ||
                      group.creator.toString() === currentUserId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to remove members from this group'
    });
  }

  // Remove member from group
  await group.removeMember(memberToRemoveId);
  // Sync user's groups array
  try {
    await User.findByIdAndUpdate(memberToRemoveId, { $pull: { groups: groupId } });
  } catch (e) {
    console.error('Failed to sync user.groups on removeMember:', e.message);
  }

  res.status(200).json({
    success: true,
    message: 'Member removed successfully'
  });
});

// @desc    Update member role
// @route   PUT /api/groups/:id/members/:userId/role
// @access  Private
const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId: memberId, role } = req.body;
  const groupId = req.params.id;
  const currentUserId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if current user is authorized to update roles
  const member = group.members.find(member => 
    member.user.toString() === currentUserId.toString()
  );
  
  const isAuthorized = member && member.role === 'admin' ||
                      group.creator.toString() === currentUserId.toString() ||
                      req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update member roles'
    });
  }

  // Update member role
  await group.updateMemberRole(memberId, role);

  res.status(200).json({
    success: true,
    message: 'Member role updated successfully'
  });
});

// @desc    List pending join requests (admin/moderator/creator only)
// @route   GET /api/groups/:id/requests
// @access  Private
const listJoinRequests = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

  const group = await Group.findById(groupId)
    .populate('pendingRequests.user', 'name email profilePicture');

  if (!group) {
    return res.status(404).json({ success: false, message: 'Group not found' });
  }

  const member = group.members.find(m => m.user.toString() === userId.toString());
  const isPrivAdmin = member && (member.role === 'admin' || member.role === 'moderator');
  const isCreator = group.creator.toString() === userId.toString();
  const isSystemAdmin = req.user.role === 'admin';

  if (!isPrivAdmin && !isCreator && !isSystemAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, data: { requests: group.pendingRequests } });
});

// @desc    Approve join request
// @route   POST /api/groups/:id/requests/:userId/approve
// @access  Private
const approveJoinRequest = asyncHandler(async (req, res) => {
  const { id: groupId, userId: targetUserId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const member = group.members.find(m => m.user.toString() === userId.toString());
  const isPrivAdmin = member && (member.role === 'admin' || member.role === 'moderator');
  const isCreator = group.creator.toString() === userId.toString();
  const isSystemAdmin = req.user.role === 'admin';
  if (!isPrivAdmin && !isCreator && !isSystemAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await group.approveJoinRequest(targetUserId);
  try { await User.findByIdAndUpdate(targetUserId, { $addToSet: { groups: groupId } }); } catch(e) {}

  res.status(200).json({ success: true, message: 'Request approved' });
});

// @desc    Reject join request
// @route   POST /api/groups/:id/requests/:userId/reject
// @access  Private
const rejectJoinRequest = asyncHandler(async (req, res) => {
  const { id: groupId, userId: targetUserId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const member = group.members.find(m => m.user.toString() === userId.toString());
  const isPrivAdmin = member && (member.role === 'admin' || member.role === 'moderator');
  const isCreator = group.creator.toString() === userId.toString();
  const isSystemAdmin = req.user.role === 'admin';
  if (!isPrivAdmin && !isCreator && !isSystemAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await group.rejectJoinRequest(targetUserId);
  res.status(200).json({ success: true, message: 'Request rejected' });
});

module.exports = {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  addMember,
  removeMember,
  updateMemberRole,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest
};
