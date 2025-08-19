const multer = require('multer');

// Use memory storage so we can stream the buffer to Cloudinary
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

module.exports = upload;
