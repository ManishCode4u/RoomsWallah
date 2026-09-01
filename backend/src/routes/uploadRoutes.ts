import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure uploads directory exists (fallback check)
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Upload buffer helper for Cloudinary
const uploadToCloudinary = (fileBuffer: Buffer, originalName: string, folder: string = "checkrooms/general"): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uniqueName = path.parse(originalName).name + "-" + Date.now();
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uniqueName,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

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

// Multer memory storage configuration for Cloudinary uploads
const memoryStorage = multer.memoryStorage();
const uploadReceiptMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter,
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Public
router.post(
  "/",
  (req: Request, res: Response, next) => {
    // Custom wrapper to catch Multer errors gracefully using in-memory multer
    uploadReceiptMulter.single("image")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        res.status(400).json({ message: err.message });
      } else {
        next();
      }
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, "checkrooms/listings");
      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: uploadResult.secure_url,
      });
    } catch (err: any) {
      console.error("Error uploading listing image to Cloudinary:", err);
      res.status(500).json({ message: "Failed to upload image to Cloudinary" });
    }
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

// @desc    Upload a payment receipt to Cloudinary
// @route   POST /api/upload/receipt
// @access  Private (Owner/User only)
router.post(
  "/receipt",
  protect,
  (req: Request, res: Response, next) => {
    uploadReceiptMulter.single("image")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        res.status(400).json({ message: err.message });
      } else {
        next();
      }
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No receipt file uploaded" });
      return;
    }

    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, "checkrooms/payment-receipts");
      res.status(200).json({
        message: "Receipt uploaded successfully",
        imageUrl: uploadResult.secure_url,
      });
    } catch (err: any) {
      console.error("Error uploading receipt to Cloudinary:", err);
      res.status(500).json({ message: "Failed to upload receipt to Cloudinary" });
    }
  }
);

export default router;
