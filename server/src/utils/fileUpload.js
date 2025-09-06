const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'unilink',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
    ]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// Helper function to delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Helper function to upload single file
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Helper function to upload multiple files
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Helper function to upload mixed files
const uploadMixed = (fields) => {
  return upload.fields(fields);
};

// Middleware to handle file upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image and video files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image and video files are allowed!'
    });
  }

  next(error);
};

// Helper function to extract file info
const extractFileInfo = (file) => {
  if (!file) return null;
  
  return {
    type: file.mimetype.startsWith('image/') ? 'image' : 'video',
    url: file.path,
    publicId: file.filename,
    filename: file.originalname,
    size: file.size
  };
};

// Helper function to extract multiple files info
const extractFilesInfo = (files) => {
  if (!files) return [];
  
  if (Array.isArray(files)) {
    return files.map(extractFileInfo).filter(Boolean);
  }
  
  return [extractFileInfo(files)].filter(Boolean);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadMixed,
  deleteFile,
  handleUploadError,
  extractFileInfo,
  extractFilesInfo,
  cloudinary
};
