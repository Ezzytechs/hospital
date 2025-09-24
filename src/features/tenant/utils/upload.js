const multer = require("multer");

// Whitelist mimetypes
const allowedFormats = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp3",
  // Video
  "video/mp4",
  "video/mkv",
  "video/avi",
  "video/mov",
  "video/webm",
];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file format: ${file.mimetype}. Allowed formats: ${allowedFormats.join(", ")}`
        )
      );
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
