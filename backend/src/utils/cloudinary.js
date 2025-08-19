const cloudinary = require('cloudinary').v2;

// Cloudinary can auto-configure from CLOUDINARY_URL
// Example: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
// Optionally, support explicit env vars if provided.
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  api_key: process.env.CLOUDINARY_API_KEY || undefined,
  api_secret: process.env.CLOUDINARY_API_SECRET || undefined,
});

/**
 * Uploads a buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer (e.g., from Multer memory storage)
 * @param {string} folder - Destination folder path (supports dynamic folders like 'events/{organizerId}')
 * @param {object} extraOptions - Additional Cloudinary options
 * @returns {Promise<object>} Cloudinary upload result
 */
function uploadBuffer(buffer, folder, extraOptions = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        use_filename: true, // keeps original filename when possible
        unique_filename: true, // avoid collisions
        overwrite: false,
        ...extraOptions,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  uploadBuffer,
};
