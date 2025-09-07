const express = require('express');
const { body, param } = require('express-validator');
const {
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
} = require('../controllers/postController');
const { protect, checkGroupMembership } = require('../middleware/authMiddleware');
const { uploadMultiple, handleUploadError } = require('../utils/fileUpload');

const router = express.Router();

// Middleware to normalize multipart fields (e.g., tags from FormData)
const normalizePostFields = (req, _res, next) => {
  // Normalize tags: accept array, JSON string, or comma-separated string
  if (typeof req.body.tags === 'string') {
    try {
      const parsed = JSON.parse(req.body.tags);
      req.body.tags = Array.isArray(parsed)
        ? parsed
        : (parsed ? [String(parsed)] : []);
    } catch (_) {
      req.body.tags = req.body.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  if (req.body.tags === undefined) req.body.tags = [];
  if (!Array.isArray(req.body.tags)) req.body.tags = [];
  if (typeof req.body.content === 'string') req.body.content = req.body.content.trim();
  if (!req.body.visibility) req.body.visibility = 'group';
  next();
};

// Validation rules
const createPostValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('groupId')
    .isMongoId()
    .withMessage('Valid group ID is required'),
  body('tags')
    .optional()
    .custom((val) => Array.isArray(val))
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot be more than 30 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'group', 'private'])
    .withMessage('Visibility must be public, group, or private')
];

const updatePostValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('tags')
    .optional()
    .custom((val) => Array.isArray(val))
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot be more than 30 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'group', 'private'])
    .withMessage('Visibility must be public, group, or private')
];

const addCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters')
];

const postIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid post ID is required')
];

const commentIdValidation = [
  param('commentId')
    .isMongoId()
    .withMessage('Valid comment ID is required')
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
];

const groupIdValidation = [
  param('groupId')
    .isMongoId()
    .withMessage('Valid group ID is required')
];

// All routes are protected
router.use(protect);

// Post CRUD routes
router.get('/', getPosts);
router.get('/:id', postIdValidation, getPost);
router.post('/', uploadMultiple('media', 5), handleUploadError, normalizePostFields, createPostValidation, createPost);
router.put('/:id', postIdValidation, updatePostValidation, updatePost);
router.delete('/:id', postIdValidation, deletePost);

// Post interaction routes
router.post('/:id/like', postIdValidation, toggleLike);
router.post('/:id/comments', postIdValidation, addCommentValidation, addComment);
router.delete('/:id/comments/:commentId', postIdValidation, commentIdValidation, deleteComment);
router.post('/:id/comments/:commentId/like', postIdValidation, commentIdValidation, toggleCommentLike);

// User and group specific post routes
router.get('/user/:userId', userIdValidation, getUserPosts);
router.get('/group/:groupId', groupIdValidation, getGroupPosts);

module.exports = router;
