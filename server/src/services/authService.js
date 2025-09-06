const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthService {
  // Generate JWT token
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  // Extract college domain from email
  static extractCollegeDomain(email) {
    if (!email) return null;
    const domain = email.split('@')[1];
    return domain;
  }

  // Validate college email
  static validateCollegeEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    if (!email.endsWith('.edu')) {
      return { isValid: false, message: 'Only college email addresses (.edu) are allowed' };
    }

    return { isValid: true };
  }

  // Get user by email with password
  static async getUserByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  // Get user by ID
  static async getUserById(userId) {
    return await User.findById(userId);
  }

  // Create new user
  static async createUser(userData) {
    return await User.create(userData);
  }

  // Update user last active
  static async updateLastActive(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true }
    );
  }

  // Check if email exists
  static async emailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  // Get users by college
  static async getUsersByCollege(college, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const users = await User.find({ college, isActive: true })
      .select('name email profilePicture bio college graduationYear joinedAt')
      .sort({ joinedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments({ college, isActive: true });

    return {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  // Deactivate user account
  static async deactivateUser(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
  }

  // Update user profile
  static async updateUserProfile(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Change user password
  static async changeUserPassword(userId, newPassword) {
    const user = await User.findById(userId).select('+password');
    user.password = newPassword;
    return await user.save();
  }
}

module.exports = AuthService;
