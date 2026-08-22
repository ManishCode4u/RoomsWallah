import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Owner from "../models/Owner.js";
import { Listing } from "../models/Listing.js";
import fs from "fs";
import {
  registerSchema,
  loginSchema,
  profileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/authValidation.js";

// Helper to generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

// Helper to parse User-Agent
const parseUserAgent = (userAgent: string | undefined) => {
  if (!userAgent) return { device: "Unknown Device", browser: "Unknown Browser" };

  let browser = "Unknown Browser";
  let device = "Desktop";

  const ua = userAgent.toLowerCase();

  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipod")) {
    device = "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet") || ua.includes("playbook") || ua.includes("kindle")) {
    device = "Tablet";
  }

  return { device, browser };
};

// Helper to set Cookie
const sendTokenCookie = (res: Response, token: string) => {
  res.cookie("owner_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @desc    Register new Owner
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    const { fullName, email, mobile, password } = validation.data;

    // Check if mobile number already exists
    const existingOwner = await Owner.findOne({ mobile });
    if (existingOwner) {
      res.status(400).json({ message: "Owner with this mobile number already exists" });
      return;
    }

    // Check if email already exists (only if email is provided)
    if (email) {
      const existingEmail = await Owner.findOne({ email });
      if (existingEmail) {
        res.status(400).json({ message: "Owner with this email already exists" });
        return;
      }
    }

    // Hash password (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Extract device/browser/IP info
    const { device, browser } = parseUserAgent(req.headers["user-agent"]);
    const clientIP = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "Unknown";

    // Create owner (status is active by default as email verification is removed)
    const owner = new Owner({
      fullName,
      email: email || undefined,
      mobile,
      password: hashedPassword,
      provider: "local",
      status: "active",
      profileCompleted: false,
      lastLogin: new Date(),
      lastLoginIP: clientIP,
      lastLoginDevice: device,
      lastLoginBrowser: browser
    });

    const savedOwner = await owner.save();

    // Generate JWT
    const token = generateToken(savedOwner._id.toString());

    // Set cookie
    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Owner registered and logged in successfully",
      owner: {
        _id: savedOwner._id,
        fullName: savedOwner.fullName,
        email: savedOwner.email,
        mobile: savedOwner.mobile,
        profileCompleted: savedOwner.profileCompleted,
        status: savedOwner.status,
        provider: savedOwner.provider,
        role: savedOwner.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error during registration", 
      error: (error as Error).message 
    });
  }
};

// @desc    Login Owner
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    const { mobile, password } = validation.data;

    // Check if owner exists
    const owner = await Owner.findOne({ mobile });
    if (!owner) {
      res.status(401).json({ message: "Invalid mobile number or password" });
      return;
    }

    // Check status
    if (owner.status === "blocked") {
      res.status(403).json({ message: "Access denied. Your account is blocked." });
      return;
    }

    // If local login, check password
    if (owner.provider === "google" && !owner.password) {
      res.status(400).json({ 
        message: "This account was created using Google. Please log in using Google." 
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, owner.password || "");
    if (!isMatch) {
      res.status(401).json({ message: "Invalid mobile number or password" });
      return;
    }

    // Update login info
    const { device, browser } = parseUserAgent(req.headers["user-agent"]);
    const clientIP = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "Unknown";

    owner.lastLogin = new Date();
    owner.lastLoginIP = clientIP;
    owner.lastLoginDevice = device;
    owner.lastLoginBrowser = browser;
    await owner.save();

    // Generate JWT
    const token = generateToken(owner._id.toString());

    // Set cookie
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      owner: {
        _id: owner._id,
        fullName: owner.fullName,
        email: owner.email,
        mobile: owner.mobile,
        profileImage: owner.profileImage,
        city: owner.city,
        state: owner.state,
        address: owner.address,
        pincode: owner.pincode,
        profileCompleted: owner.profileCompleted,
        status: owner.status,
        provider: owner.provider,
        role: owner.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error during login", 
      error: (error as Error).message 
    });
  }
};

// @desc    Google OAuth direct verification (e.g. verify ID Token from frontend)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token: idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ message: "Google ID Token is required" });
      return;
    }

    // Call Google's tokeninfo API to verify token
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const response = await fetch(tokenInfoUrl);
    
    if (!response.ok) {
      res.status(400).json({ message: "Invalid Google ID Token" });
      return;
    }

    const payload = (await response.json()) as any;
    
    // Check if token matches client ID if provided in env
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      res.status(400).json({ message: "Google Token client mismatch" });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      res.status(400).json({ message: "Google account does not share email" });
      return;
    }

    // Check if owner exists
    let owner = await Owner.findOne({ email });

    const { device, browser } = parseUserAgent(req.headers["user-agent"]);
    const clientIP = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "Unknown";

    if (owner) {
      if (owner.status === "blocked") {
        res.status(403).json({ message: "Access denied. Your account is blocked." });
        return;
      }

      // Update provider to google if they signed up locally first, or just update googleId
      if (!owner.googleId) owner.googleId = googleId;
      if (!owner.profileImage) owner.profileImage = picture;
      
      owner.lastLogin = new Date();
      owner.lastLoginIP = clientIP;
      owner.lastLoginDevice = device;
      owner.lastLoginBrowser = browser;
      await owner.save();
    } else {
      // Auto-register new owner via Google
      owner = new Owner({
        fullName: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        profileImage: picture,
        provider: "google",
        status: "active",
        profileCompleted: false,
        lastLogin: new Date(),
        lastLoginIP: clientIP,
        lastLoginDevice: device,
        lastLoginBrowser: browser
      });
      await owner.save();
    }

    const token = generateToken(owner._id.toString());
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      owner: {
        _id: owner._id,
        fullName: owner.fullName,
        email: owner.email,
        profileImage: owner.profileImage,
        city: owner.city,
        state: owner.state,
        address: owner.address,
        pincode: owner.pincode,
        profileCompleted: owner.profileCompleted,
        status: owner.status,
        provider: owner.provider,
        role: owner.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error during Google auth verification", 
      error: (error as Error).message 
    });
  }
};

// @desc    Logout Owner & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("owner_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error during logout", 
      error: (error as Error).message 
    });
  }
};

// @desc    Get current logged in Owner profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    res.status(200).json({
      success: true,
      owner: user
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error fetching profile info", 
      error: (error as Error).message 
    });
  }
};

const logRequestAndError = (body: any, err?: any, validationErrors?: any) => {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      requestBody: body,
      error: err ? { message: err.message, stack: err.stack, name: err.name } : null,
      validationErrors: validationErrors || null
    };
    fs.appendFileSync(
      "request_error.log",
      JSON.stringify(logData, null, 2) + "\n====================================\n"
    );
  } catch (e) {
    console.error("Failed to write to request_error.log:", e);
  }
};

// @desc    Update Owner profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    logRequestAndError(req.body);

    const validation = profileSchema.safeParse(req.body);
    if (!validation.success) {
      logRequestAndError(req.body, null, validation.error.format());
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    const {
      fullName,
      email,
      profileImage,
      mobile,
      alternateMobile,
      city,
      state,
      address,
      pincode
    } = validation.data;

    const owner = await Owner.findById(user._id);
    if (!owner) {
      res.status(404).json({ message: "Owner not found" });
      return;
    }

    // Update values (only update fields that are explicitly provided)
    if (fullName !== undefined) owner.fullName = fullName;
    if (email !== undefined) {
      if (email === "") {
        owner.email = undefined;
      } else {
        owner.email = email;
      }
    }
    if (profileImage !== undefined) owner.profileImage = profileImage;
    if (mobile !== undefined) owner.mobile = mobile;
    if (alternateMobile !== undefined) owner.alternateMobile = alternateMobile;
    if (city !== undefined) owner.city = city;
    if (state !== undefined) owner.state = state;
    if (address !== undefined) owner.address = address;
    if (pincode !== undefined) owner.pincode = pincode;
    
    // Mark profile as complete
    owner.profileCompleted = true;

    const updatedOwner = await owner.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      owner: updatedOwner
    });
  } catch (error) {
    logRequestAndError(req.body, error);
    res.status(500).json({ 
      message: "Server error updating profile", 
      error: (error as Error).message 
    });
  }
};

// @desc    Forgot password link placeholder
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    const { email } = validation.data;
    const owner = await Owner.findOne({ email });

    if (!owner) {
      // Security practice: Don't reveal email exists or not
      res.status(200).json({ 
        success: true, 
        message: "If email exists in our system, a password reset link has been generated." 
      });
      return;
    }

    // Create random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    owner.passwordResetToken = hashedResetToken;
    owner.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await owner.save();

    // Log the token/mock link for dev testing. In production, this can be retrieved or mailed.
    console.log(`🔑 PASSWORD RESET REQUEST:
Email: ${email}
Reset Token: ${resetToken}
Mock Link: http://localhost:3000/owner/reset-password?token=${resetToken}
`);

    res.status(200).json({
      success: true,
      message: "If email exists in our system, a password reset link has been generated.",
      // Include token in response in non-production mode for easy testing/integration
      ...(process.env.NODE_ENV !== "production" ? { dev_token: resetToken } : {})
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error during forgot-password request", 
      error: (error as Error).message 
    });
  }
};

// @desc    Reset password using token placeholder
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Reset token is required in query params" });
      return;
    }

    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    const { password } = validation.data;

    // Hash query token to compare with database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const owner = await Owner.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: new Date() }
    });

    if (!owner) {
      res.status(400).json({ message: "Invalid or expired password reset token" });
      return;
    }

    // Set new password
    owner.password = await bcrypt.hash(password, 12);
    owner.passwordResetToken = undefined;
    owner.passwordResetTokenExpires = undefined;
    await owner.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in."
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error resetting password", 
      error: (error as Error).message 
    });
  }
};

// @desc    Delete Owner Account permanently (and delete all their listings & images)
// @route   DELETE /api/auth/delete-account
// @access  Private (Owner Only)
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const ownerId = user._id;

    // 1. Find all listings owned by this owner
    const listings = await Listing.find({ owner: ownerId });

    // 2. Helper to delete local uploaded images from disk
    const deleteLocalFile = (fileUrl: string) => {
      if (fileUrl && fileUrl.includes("/uploads/")) {
        const parts = fileUrl.split("/uploads/");
        const fileName = parts[parts.length - 1];
        const filePath = `./uploads/${fileName}`;
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Failed to delete local file: ${filePath}`, err);
        }
      }
    };

    // Clean up all images from disk for all listings of this owner
    for (const listing of listings) {
      if (listing.image) deleteLocalFile(listing.image);
      if (listing.images && listing.images.length > 0) {
        listing.images.forEach((img) => deleteLocalFile(img));
      }
    }

    // 3. Delete all listing documents of this owner from MongoDB
    await Listing.deleteMany({ owner: ownerId });

    // 4. Delete the owner profile image if stored locally
    if (user.profileImage) {
      deleteLocalFile(user.profileImage);
    }

    // 5. Delete the Owner document from MongoDB
    await Owner.findByIdAndDelete(ownerId);

    // 6. Clear auth cookie
    res.clearCookie("owner_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ success: true, message: "Account and all associated listings/images permanently deleted." });
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error deleting owner account", 
      error: (error as Error).message 
    });
  }
};
