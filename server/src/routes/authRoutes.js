const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  getUsersByCollege,
  deactivateAccount
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../utils/fileUpload');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .custom((value) => {
      if (!value.endsWith('.edu')) {
        throw new Error('Only college email addresses (.edu) are allowed');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('college')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('College name must be between 2 and 100 characters'),
  body('graduationYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Graduation year must be between 2020 and 2030')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('graduationYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Graduation year must be between 2020 and 2030')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/upload-avatar', protect, uploadSingle('avatar'), handleUploadError, uploadAvatar);
router.get('/college/:college', protect, getUsersByCollege);
router.delete('/deactivate', protect, deactivateAccount);

module.exports = router;
