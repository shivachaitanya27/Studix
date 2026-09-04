import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avatarsDir = path.resolve(__dirname, '../uploads/avatars');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Storage on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `avatar-${req.user?.id || 'guest'}-${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif', '.bmp', '.svg', '.avif'];

  if (mime.startsWith('image/') || validExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported image type: ${file.mimetype || ext}. Please choose a standard photo (JPEG, PNG, WebP).`
    );
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter,
});

export const handleAvatarUpload = (req, res, next) => {
  const uploadSingle = upload.single('avatar');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Avatar file size exceeds 5MB limit. Please choose a smaller photo.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Avatar upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(err.status || 400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

export default handleAvatarUpload;
