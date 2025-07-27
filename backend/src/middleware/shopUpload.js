const multer = require('multer');
const { storage } = require('../config/cloudinary');
const AppError = require('../utils/appError');

const shopUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Please upload only images', 400), false);
    }
  },
}).fields([
  { name: 'shopImage', maxCount: 1 },
  { name: 'subServiceImage', maxCount: 1 },
  { name: 'subServiceImages', maxCount: 100 },
]);

const uploadShopAndServiceImages = (req, res, next) => {
  shopUpload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Multer error: ${err.message}`, 400));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = { uploadShopAndServiceImages };