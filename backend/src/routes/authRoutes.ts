import { Router, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  googleAuth,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteAccount
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Rate limiter for authentication and password reset routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth routes
  message: { message: "Too many attempts from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

// 1. Local Registration
router.post("/register", authRateLimiter, register);

// 2. Local Login
router.post("/login", authRateLimiter, login);

// 3. Google OAuth via credential Token (SPA)
router.post("/google", googleAuth);

// 4. Redirect-based Google OAuth routes (via Passport)
router.get(
  "/google/redirect",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req: Request, res: Response) => {
    // Generate JWT token for redirect auth
    if (!req.user) {
      res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:3000"}/welcome?error=auth_failed`);
      return;
    }

    const owner = req.user as any;
    const token = generateToken(owner._id.toString());

    // Set cookie
    res.cookie("owner_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend dashboard or profile step based on completion status
    const targetUrl = owner.profileCompleted
      ? `${process.env.CORS_ORIGIN || "http://localhost:3000"}/welcome/dashboard`
      : `${process.env.CORS_ORIGIN || "http://localhost:3000"}/welcome?step=profile`;

    res.redirect(targetUrl);
  }
);

// 5. Logout
router.post("/logout", logout);

// 6. Get current profile (Protected)
router.get("/me", protect, getMe);

// 7. Update profile (Protected)
router.put("/profile", protect, updateProfile);

// 8. Forgot & Reset Password
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);

// 9. Delete Account permanently (Protected)
router.delete("/delete-account", protect, deleteAccount);

export default router;
