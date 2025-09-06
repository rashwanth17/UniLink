const express = require('express');
const { body, param } = require('express-validator');
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  addMember,
  removeMember,
  updateMemberRole
} = require('../controllers/groupController');
const { 
  protect, 
  authorize, 
  checkGroupMembership, 
  checkGroupAdmin 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createGroupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot be more than 30 characters')
];

const updateGroupValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot be more than 30 characters')
];

const addMemberValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['member', 'moderator'])
    .withMessage('Role must be either member or moderator')
];

const updateMemberRoleValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .isIn(['member', 'moderator', 'admin'])
    .withMessage('Role must be member, moderator, or admin')
];

const groupIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid group ID is required')
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
];

// All routes are protected
router.use(protect);

// Group CRUD routes
router.get('/', getGroups);
router.get('/:id', groupIdValidation, getGroup);
router.post('/', createGroupValidation, createGroup);
router.put('/:id', groupIdValidation, updateGroupValidation, updateGroup);
router.delete('/:id', groupIdValidation, deleteGroup);

// Group membership routes
router.post('/:id/join', groupIdValidation, joinGroup);
router.post('/:id/leave', groupIdValidation, leaveGroup);

// Group member management routes (admin/moderator only)
router.post('/:id/members', groupIdValidation, addMemberValidation, addMember);
router.delete('/:id/members/:userId', groupIdValidation, userIdValidation, removeMember);
router.put('/:id/members/:userId/role', groupIdValidation, userIdValidation, updateMemberRoleValidation, updateMemberRole);

module.exports = router;
