import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Ensure uploads directory exists (fallback check)
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File Filter (Image Only)
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images of type jpeg, jpg, png or webp are allowed"));
  }
};

// Multer Middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter,
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Public
router.post(
  "/",
  (req: Request, res: Response, next) => {
    // Custom wrapper to catch Multer errors gracefully
    upload.single("image")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer specific error (e.g. limit file size)
        res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        // General error (e.g. file format not allowed)
        res.status(400).json({ message: err.message });
      } else {
        next();
      }
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Return the relative URL of the uploaded image
    // For localhost development, it will look like /uploads/17000000000-image.jpg
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: fileUrl,
    });
  }
);

// File Filter (Video Only)
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /mp4|webm|quicktime|x-matroska|mkv|mov/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype || extname) {
    cb(null, true);
  } else {
    cb(new Error("Only videos of type mp4, webm, mov, or mkv are allowed"));
  }
};

// Multer Video Middleware
const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: videoFileFilter,
});

// @desc    Upload a guide video
// @route   POST /api/upload/video
// @access  Public
router.post(
  "/video",
  (req: Request, res: Response, next) => {
    uploadVideo.single("video")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        res.status(400).json({ message: err.message });
      } else {
        next();
      }
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No video file uploaded" });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      message: "Video uploaded successfully",
      videoUrl: fileUrl,
    });
  }
);

export default router;
