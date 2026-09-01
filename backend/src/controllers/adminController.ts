import { Request, Response } from "express";
import Owner from "../models/Owner.js";
import { Listing } from "../models/Listing.js";
import Promotion from "../models/Promotion.js";
import Notification from "../models/Notification.js";
import BoostRequest from "../models/BoostRequest.js";
import Report from "../models/Report.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

// @desc    Get dynamic admin overview statistics
// @route   GET /api/admin/stats
// @access  Public / Admin
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalListings = await Listing.countDocuments({ listingStatus: { $ne: "deleted" } });
    const activeListings = await Listing.countDocuments({ listingStatus: "active" });
    const hiddenListings = await Listing.countDocuments({ listingStatus: "hidden" });

    const totalOwners = await Owner.countDocuments({});
    const activeOwners = await Owner.countDocuments({ status: "active" });
    const blockedOwners = await Owner.countDocuments({ status: "blocked" });

    const activePromotions = await Promotion.countDocuments({ status: "active" });

    res.status(200).json({
      listings: {
        total: totalListings,
        active: activeListings,
        hidden: hiddenListings
      },
      owners: {
        total: totalOwners,
        active: activeOwners,
        blocked: blockedOwners
      },
      promotions: activePromotions
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching admin stats",
      error: (error as Error).message
    });
  }
};

// @desc    Get all registered owners with property counts
// @route   GET /api/admin/owners
// @access  Public / Admin
export const getAdminOwners = async (req: Request, res: Response): Promise<void> => {
  try {
    const owners = await Owner.find().sort({ createdAt: -1 });

    const ownersWithCount = await Promise.all(
      owners.map(async (owner) => {
        const listingCount = await Listing.countDocuments({ owner: owner._id as any, listingStatus: { $ne: "deleted" } as any });
        return {
          id: owner._id.toString(),
          name: owner.fullName,
          email: owner.email,
          phone: owner.mobile || "N/A",
          listingsCount: listingCount,
          status: owner.status === "active" ? "Active" : "Blocked",
          createdAt: owner.createdAt
        };
      })
    );

    res.status(200).json(ownersWithCount);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching admin owners",
      error: (error as Error).message
    });
  }
};

// @desc    Toggle owner account status (Active / Blocked)
// @route   PATCH /api/admin/owners/:id/status
// @access  Public / Admin
export const updateOwnerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const owner = await Owner.findById(req.params.id);
    if (!owner) {
      res.status(404).json({ message: "Owner not found" });
      return;
    }

    const nextStatus = status === "Active" || status === "active" ? "active" : "blocked";
    owner.status = nextStatus;
    await owner.save();

    // Trigger Notification
    try {
      await Notification.create({
        owner: owner._id as any,
        title: `Account ${nextStatus === "active" ? "Unblocked" : "Blocked"}`,
        message: `Your host account has been ${nextStatus === "active" ? "unblocked" : "blocked"} by the admin.`,
        type: nextStatus === "active" ? "success" : "error"
      });
    } catch (err) {
      console.error("Failed to create owner status notification:", err);
    }

    res.status(200).json({ success: true, status: owner.status });
  } catch (error) {
    res.status(500).json({
      message: "Server Error updating owner status",
      error: (error as Error).message
    });
  }
};

// @desc    Delete owner account & cascade delete listings and images
// @route   DELETE /api/admin/owners/:id
// @access  Public / Admin
export const deleteOwnerByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.params.id;

    // Helper to delete local uploaded images from disk
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
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    };

    const listings = await Listing.find({ owner: ownerId as any });
    for (const listing of listings) {
      if (listing.image) deleteLocalFile(listing.image);
      if (listing.images && listing.images.length > 0) {
        listing.images.forEach((img) => deleteLocalFile(img));
      }
    }

    await Listing.deleteMany({ owner: ownerId as any });
    await Owner.findByIdAndDelete(ownerId);

    res.status(200).json({ success: true, message: "Owner and all associated listings permanently deleted." });
  } catch (error) {
    res.status(500).json({
      message: "Server Error deleting owner",
      error: (error as Error).message
    });
  }
};

// @desc    Get all listings for admin panel
// @route   GET /api/admin/listings
// @access  Public / Admin
export const getAdminListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await Listing.find({ listingStatus: { $ne: "deleted" } }).sort({ createdAt: -1 });

    const formatted = listings.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      type: item.type,
      rent: item.rent,
      city: item.city,
      area: item.area,
      image: item.image,
      images: item.images || [],
      description: item.description,
      amenities: item.amenities || [],
      ownerName: item.ownerName,
      ownerPhone: item.ownerPhone,
      ownerWhatsApp: item.ownerWhatsApp,
      tag: item.tag,
      rating: item.rating,
      furnishing: item.furnishing,
      sharing: item.sharing,
      status: item.listingStatus === "active" ? "Active" : "Inactive",
      createdAt: item.createdAt
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching admin listings",
      error: (error as Error).message
    });
  }
};

// @desc    Toggle listing status by Admin
// @route   PATCH /api/admin/listings/:id/status
// @access  Public / Admin
export const updateListingStatusByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    const nextStatus = status === "Active" || status === "active" ? "active" : "hidden";
    listing.listingStatus = nextStatus;
    await listing.save();

    // Trigger Notification
    if (listing.owner) {
      try {
        await Notification.create({
          owner: listing.owner as any,
          title: `Listing ${nextStatus === "active" ? "Approved" : "Blocked"}`,
          message: `Your listing "${listing.title}" is now ${nextStatus === "active" ? "active on the site" : "blocked by the admin"}.`,
          type: nextStatus === "active" ? "success" : "warning"
        });
      } catch (err) {
        console.error("Failed to create listing status notification:", err);
      }
    }

    res.status(200).json({ success: true, status: listing.listingStatus });
  } catch (error) {
    res.status(500).json({
      message: "Server Error updating listing status",
      error: (error as Error).message
    });
  }
};

// @desc    Delete listing by Admin
// @route   DELETE /api/admin/listings/:id
// @access  Public / Admin
export const deleteListingByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.image && listing.image.includes("/uploads/")) {
      const parts = listing.image.split("/uploads/");
      const fileName = parts[parts.length - 1];
      const filePath = `./uploads/${fileName}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Trigger Notification
    if (listing.owner) {
      try {
        await Notification.create({
          owner: listing.owner as any,
          title: "Listing Deleted by Admin",
          message: `Your listing "${listing.title}" was deleted by the admin.`,
          type: "error"
        });
      } catch (err) {
        console.error("Failed to create listing delete notification:", err);
      }
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Listing permanently deleted by Admin." });
  } catch (error) {
    res.status(500).json({
      message: "Server Error deleting listing",
      error: (error as Error).message
    });
  }
};

// @desc    Create listing by Admin
// @route   POST /api/admin/listings
// @access  Public / Admin
export const createListingByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const newListing = new Listing({
      ...req.body,
      listingStatus: "active"
    });
    const saved = await newListing.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({
      message: "Error creating listing by admin",
      error: (error as Error).message
    });
  }
};

// @desc    Update listing details by Admin
// @route   PUT /api/admin/listings/:id
// @access  Public / Admin
export const updateListingByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({
      message: "Error updating listing by admin",
      error: (error as Error).message
    });
  }
};

const GUIDE_FILE = path.join(process.cwd(), "uploads", "guide.json");

// @desc    Get video guide details
// @route   GET /api/admin/guide
// @access  Public
export const getGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    if (fs.existsSync(GUIDE_FILE)) {
      const data = fs.readFileSync(GUIDE_FILE, "utf-8");
      res.status(200).json(JSON.parse(data));
    } else {
      res.status(200).json({
        title: "How to List Your Room on CheckRooms",
        description: "Watch this step-by-step video guide to learn how you can list your room, PG, hostel or flat on CheckRooms in just 2 minutes.",
        videoUrl: ""
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching video guide",
      error: (error as Error).message
    });
  }
};

// @desc    Update video guide details
// @route   POST /api/admin/guide
// @access  Public / Admin
export const updateGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, videoUrl } = req.body;
    
    const guideData = {
      title: title || "How to List Your Room on CheckRooms",
      description: description || "",
      videoUrl: videoUrl || ""
    };
    
    const dir = path.dirname(GUIDE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(GUIDE_FILE, JSON.stringify(guideData, null, 2), "utf-8");
    res.status(200).json({
      message: "Video guide updated successfully",
      guide: guideData
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error updating video guide",
      error: (error as Error).message
    });
  }
};

// @desc    Get all boost requests (Admin)
// @route   GET /api/admin/boost-requests
// @access  Public / Admin
export const getAdminBoostRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await BoostRequest.find({})
      .populate("listing", "title type rent city area image ownerName ownerPhone")
      .populate("owner", "fullName email mobile")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching boost requests for admin",
      error: (error as Error).message
    });
  }
};

import { calculateBoostDuration, checkAndExpireBoosts } from "../utils/boostManager.js";

// @desc    Verify (Approve or Reject) boost request (Admin)
// @route   PATCH /api/admin/boost-requests/:id/verify
// @access  Public / Admin
export const verifyBoostRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status. Must be Approved or Rejected" });
      return;
    }

    const boostRequest = await BoostRequest.findById(req.params.id);
    if (!boostRequest) {
      res.status(404).json({ message: "Boost request not found" });
      return;
    }

    const SLOTS_FILE = path.join(process.cwd(), "uploads", "slots.json");
    
    // Helper to read slots
    const getSlots = () => {
      try {
        if (fs.existsSync(SLOTS_FILE)) {
          return JSON.parse(fs.readFileSync(SLOTS_FILE, "utf-8"));
        }
      } catch (e) {}
      return [];
    };

    // Helper to save slots
    const saveSlots = (slots: any[]) => {
      try {
        const dir = path.dirname(SLOTS_FILE);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SLOTS_FILE, JSON.stringify(slots, null, 2), "utf-8");
      } catch (e) {}
    };

    let slots = getSlots();
    const listingIdStr = boostRequest.listing.toString();
    const targetListing = await Listing.findById(boostRequest.listing);

    if (status === "Approved") {
      const { durationDays, expiresAt } = calculateBoostDuration(boostRequest.amount, boostRequest.plan);
      
      boostRequest.status = "Approved";
      boostRequest.durationDays = durationDays;
      boostRequest.expiresAt = expiresAt;
      boostRequest.notifiedExpiry = false;
      await boostRequest.save();

      // Add / Update slot
      slots = slots.filter((slot: any) => slot.listingId !== listingIdStr);
      slots.push({
        status: "Active",
        listingId: listingIdStr,
        ownerId: boostRequest.owner.toString(),
        plan: boostRequest.plan,
        amount: boostRequest.amount,
        durationDays: durationDays,
        approvedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        notifiedExpiry: false
      });
      saveSlots(slots);

      // Update Listing in DB
      if (targetListing) {
        targetListing.isBoosted = true;
        targetListing.boostExpiresAt = expiresAt;
        targetListing.boostPlan = boostRequest.plan;
        await targetListing.save();
      }

      // Send Approval Notification
      try {
        const dateFormatted = expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        await Notification.create({
          owner: boostRequest.owner as any,
          title: "Boost Request Approved! 🚀",
          message: `Your boost request for "${targetListing?.title || "Property"}" (${boostRequest.plan} - ${durationDays} Days) has been approved! Your listing is boosted to #1 rank until ${dateFormatted}.`,
          type: "success",
          read: false
        });
      } catch (err) {
        console.error("Failed to trigger boost verification notification:", err);
      }
    } else {
      // Rejected
      boostRequest.status = "Rejected";
      await boostRequest.save();

      slots = slots.filter((slot: any) => slot.listingId !== listingIdStr);
      saveSlots(slots);

      if (targetListing) {
        targetListing.isBoosted = false;
        targetListing.boostExpiresAt = undefined;
        await targetListing.save();
      }

      try {
        await Notification.create({
          owner: boostRequest.owner as any,
          title: "Boost Request Rejected ❌",
          message: `Your boost request for "${targetListing?.title || "Property"}" was not approved. Please check transaction details or contact support.`,
          type: "error",
          read: false
        });
      } catch (err) {}
    }

    res.status(200).json({
      success: true,
      message: `Boost request successfully ${status}!`,
      boostRequest
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error verifying boost request",
      error: (error as Error).message
    });
  }
};

// @desc    Delete boost request (Admin)
// @route   DELETE /api/admin/boost-requests/:id
// @access  Public / Admin
export const deleteBoostRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const boostRequest = await BoostRequest.findById(req.params.id);
    if (!boostRequest) {
      res.status(404).json({ message: "Boost request not found" });
      return;
    }

    if (boostRequest.status === "Approved") {
      const SLOTS_FILE = path.join(process.cwd(), "uploads", "slots.json");
      const getSlots = () => {
        try {
          if (fs.existsSync(SLOTS_FILE)) {
            return JSON.parse(fs.readFileSync(SLOTS_FILE, "utf-8"));
          }
        } catch (e) {}
        return [];
      };

      const saveSlots = (slots: any[]) => {
        try {
          const dir = path.dirname(SLOTS_FILE);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(SLOTS_FILE, JSON.stringify(slots, null, 2), "utf-8");
        } catch (e) {}
      };

      let slots = getSlots();
      const listingIdStr = boostRequest.listing.toString();
      slots = slots.filter((slot: any) => slot.listingId !== listingIdStr);
      saveSlots(slots);
    }

    await BoostRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Boost request deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error deleting boost request",
      error: (error as Error).message
    });
  }
};

// @desc    Send notification to owner from Admin
// @route   POST /api/admin/notifications
// @access  Public / Admin
export const sendNotificationFromAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobile, title, message, type } = req.body;
    if (!mobile || !title || !message) {
      res.status(400).json({ message: "Mobile number, title, and message are required" });
      return;
    }

    const owner = await Owner.findOne({ mobile });
    if (!owner) {
      res.status(404).json({ message: "Owner profile with this mobile number not found" });
      return;
    }

    const notification = await Notification.create({
      owner: owner._id as any,
      title,
      message,
      type: type || "info",
      read: false
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error sending notification",
      error: (error as Error).message
    });
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      res.status(500).json({ message: "Admin credentials are not configured in environment variables." });
      return;
    }

    if (email === expectedEmail && password === expectedPassword) {
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.status(200).json({
        success: true,
        message: "Admin authenticated successfully",
        token
      });
    } else {
      res.status(401).json({ message: "Invalid email or password credentials." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server Error during admin login",
      error: (error as Error).message
    });
  }
};

export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("admin_token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getAdminMe = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    admin: {
      name: "Admin Chief",
      email: process.env.ADMIN_EMAIL || "admin@checkrooms.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
    }
  });
};

// @desc    Get all listing reports for admin
// @route   GET /api/admin/reports
// @access  Private (Admin Only)
export const getAdminReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 });
    
    // Map dates to localized string formats to match frontend layout expectation
    const formattedReports = reports.map(r => {
      const json = r.toJSON();
      return {
        ...json,
        date: new Date(r.createdAt).toLocaleDateString("en-IN")
      };
    });

    res.status(200).json(formattedReports);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching reports",
      error: (error as Error).message
    });
  }
};

// @desc    Delete or resolve a report
// @route   DELETE /api/admin/reports/:id
// @access  Private (Admin Only)
export const deleteReportByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Report resolved/deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error deleting report",
      error: (error as Error).message
    });
  }
};


