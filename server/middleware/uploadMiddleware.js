import multer from 'multer';

// Use memory storage so the file buffer is directly accessible
// for SHA-256 hash calculation and OpenRouter AI inspection
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

const fileFilter = (req, file, cb) => {
  const name = (file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  // Allow ALL PDF formats regardless of browser mimetype
  const isPdf = name.endsWith('.pdf') || mime.includes('pdf');

  // Allow Office documents & text files
  const isDoc =
    name.endsWith('.doc') ||
    name.endsWith('.docx') ||
    name.endsWith('.ppt') ||
    name.endsWith('.pptx') ||
    name.endsWith('.txt') ||
    allowedMimeTypes.includes(mime);

  // Allow document image scans
  const isImage =
    mime.startsWith('image/') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp');

  if (isPdf || isDoc || isImage) {
    if (isPdf && (!file.mimetype || file.mimetype === 'application/octet-stream')) {
      file.mimetype = 'application/pdf';
    }
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file format: "${file.originalname}". Only PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), and Image Scans (PNG/JPG) are allowed.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max to easily accommodate high-res and multi-page PDFs
  },
});

export const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload validation error.',
      });
    }
    next();
  });
};

export default uploadSingle;

