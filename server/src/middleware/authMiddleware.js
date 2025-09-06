const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user is member of a group
const checkGroupMembership = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const Group = require('../models/Group');
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

    const isMember = group.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    req.group = group;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking group membership'
    });
  }
};

// Check if user is admin/moderator of a group
const checkGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const Group = require('../models/Group');
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const member = group.members.find(member => 
      member.user.toString() === userId.toString()
    );

    const isAdmin = member && (member.role === 'admin' || member.role === 'moderator');
    const isGroupCreator = group.creator.toString() === userId.toString();
    const isSystemAdmin = req.user.role === 'admin';

    if (!isAdmin && !isGroupCreator && !isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action'
      });
    }

    req.group = group;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking group admin status'
    });
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkGroupMembership,
  checkGroupAdmin
};
