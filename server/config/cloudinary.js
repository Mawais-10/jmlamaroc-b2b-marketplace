const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'choufliya/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
  },
});

// Storage for store avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'choufliya/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto:good' }],
  },
});

// Storage for store cover images
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'choufliya/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 600, crop: 'fill', quality: 'auto:good' }],
  },
});

const uploadProduct = multer({ storage: productStorage });
const uploadAvatar = multer({ storage: avatarStorage });
const uploadCover = multer({ storage: coverStorage, limits: { files: 4 } });

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
  }
};

module.exports = { cloudinary, uploadProduct, uploadAvatar, uploadCover, deleteImage };
