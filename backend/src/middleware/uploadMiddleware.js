// const multer = require('multer');
// const { storage } = require('../config/cloudinary');
// const AppError = require('../utils/appError');

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image')) {
//       cb(null, true);
//     } else {
//       cb(new AppError('Please upload only images', 400), false);
//     }
//   }
// });

// exports.uploadUserPhoto = upload.single('profilePhoto');

const multer = require('multer');
const { storage } = require('../config/cloudinary');
const AppError = require('../utils/appError');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log('Multer received file:', file);
    if (!file) {
      console.log('No file received by multer');
      return cb(null, false);
    }
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      console.log('Invalid file type:', file.mimetype);
      cb(new AppError('Please upload only images', 400), false);
    }
  },
});

exports.uploadUserPhoto = upload.single('profilePhoto');