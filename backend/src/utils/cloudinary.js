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

/**
 * Deletes an asset by public_id.
 * @param {string} publicId
 * @returns {Promise<object>} Cloudinary destroy result
 */
function deleteByPublicId(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

/**
 * Tries to parse Cloudinary public_id from a secure URL.
 * Only works for standard delivery URLs, may fail for transformed URLs.
 */
function tryExtractPublicIdFromUrl(url) {
  try {
    // Example: https://res.cloudinary.com/<cloud>/image/upload/v123/users/uid/avatar/abcd123.jpg
    const u = new URL(url);
    const parts = u.pathname.split('/');
    // remove leading ''
    while (parts.length && parts[0] === '') parts.shift();
    // expected: ['<version or image>', 'upload', 'v123', 'users', ... , '<filename>']
    const last = parts[parts.length - 1];
    const withoutExt = last.includes('.') ? last.slice(0, last.lastIndexOf('.')) : last;
    // public_id is path after 'upload/' without file extension
    const uploadIdx = parts.findIndex((p) => p === 'upload');
    if (uploadIdx === -1) return null;
    const publicParts = parts.slice(uploadIdx + 1, parts.length - 1); // exclude filename, keep version + folders
    // If first part is version like v123, drop it
    const startIdx = publicParts[0] && /^v\d+$/i.test(publicParts[0]) ? 1 : 0;
    const pathParts = publicParts.slice(startIdx);
    pathParts.push(withoutExt);
    return pathParts.join('/');
  } catch (_) {
    return null;
  }
}

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteByPublicId,
  tryExtractPublicIdFromUrl,
};

