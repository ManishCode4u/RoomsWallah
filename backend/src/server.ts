import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "passport";

if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL ERROR: JWT_SECRET environment variable is missing!");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!");
  process.exit(1);
}
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { logger } from "./middleware/loggerMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Connect to Database
connectDB().then(() => {
  import("./controllers/listingController.js").then(({ geocodeExistingListings }) => {
    geocodeExistingListings();
  }).catch((err) => {
    console.error("Failed to import geocodeExistingListings migration:", err);
  });
});

// Initialize passport configuration
import "./config/passport.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configure CORS to dynamically allow localhost and local IP network origins for mobile testing
const allowedOrigins = [
  CORS_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://roomswallah.vercel.app"
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or mobile apps)
    if (!origin) return callback(null, true);
    
    const isLocalIp = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
    
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalIp) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

app.use(logger);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Passport Initialization
app.use(passport.initialize());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Lightweight health-check endpoint for Render / uptime monitoring (prevents server sleep)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Basic test route
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    service: "RoomsWallah Backend API"
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`⚡️[server]: RoomsWallah API is running at http://localhost:${PORT}`);
});

// Graceful shutdown listener
const shutdown = () => {
  console.log("📡 Gracefully shutting down RoomsWallah server...");
  server.close(async () => {
    console.log("⚡️[server]: HTTP server closed.");
    try {
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close();
      console.log("⚡️[database]: MongoDB connection closed.");
      process.exit(0);
    } catch (e) {
      console.error("❌ Error closing MongoDB connection during shutdown:", e);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⚠️ Forcefully shutting down server due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
