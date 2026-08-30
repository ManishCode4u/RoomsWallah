import { Request, Response } from "express";
import { Listing } from "../models/Listing.js";
import { createListingSchema } from "../validations/listingValidation.js";
import Notification from "../models/Notification.js";
import BoostRequest from "../models/BoostRequest.js";
import { Inquiry } from "../models/Inquiry.js";
import Report from "../models/Report.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const SLOTS_FILE = path.join(process.cwd(), "uploads", "slots.json");

const getSlotsFromFile = () => {
  try {
    if (fs.existsSync(SLOTS_FILE)) {
      return JSON.parse(fs.readFileSync(SLOTS_FILE, "utf-8"));
    }
  } catch (e) {}
  return [];
};

const geocodeAddress = async (address: string, area: string, city: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const query = encodeURIComponent(`${address || area || ""}, ${city || ""}, India`.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=in`;
    const response = await fetch(url, {
      headers: { "User-Agent": "RoomsWallah-API" }
    });
    if (response.ok) {
      const data: any = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.error("Geocoding failed for address:", err);
  }
  // Try city only fallback
  try {
    const query = encodeURIComponent(`${city || ""}, India`.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=in`;
    const response = await fetch(url, {
      headers: { "User-Agent": "RoomsWallah-API" }
    });
    if (response.ok) {
      const data: any = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.error("Geocoding fallback failed for city:", err);
  }
  return null;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// @desc    Get all listings with search and filters
// @route   GET /api/listings
// @access  Public
export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Safely parse and sanitize query parameters to prevent NoSQL object injection
    const cityClean = req.query.city ? String(req.query.city).split(",")[0].trim() : "";
    const stateClean = req.query.state ? String(req.query.state).trim() : "";
    const pincodeClean = req.query.pincode ? String(req.query.pincode).trim() : "";
    const areaClean = req.query.area ? String(req.query.area).trim() : "";
    const typeStr = req.query.type ? String(req.query.type) : "";
    const maxPriceStr = req.query.maxPrice ? String(req.query.maxPrice) : "";
    const furnishingVal = req.query.furnishing;
    const sharingVal = req.query.sharing;
    const tagVal = req.query.tag;
    const searchStr = req.query.search ? String(req.query.search).trim() : "";
    const sortByStr = req.query.sortBy ? String(req.query.sortBy) : "";
    const latStr = req.query.lat ? String(req.query.lat) : "";
    const lonStr = req.query.lon ? String(req.query.lon) : "";

    const query: any = {};
    const andConditions: any[] = [];

    // Filter by Active Listing Status only (do not show hidden/deleted)
    andConditions.push({ listingStatus: "active" });

    // Filter by City, State & Pincode (Flexible matching across fields)
    const locationConditions: any[] = [];

    if (cityClean && cityClean !== "all") {
      const isStrictNoida = cityClean.toLowerCase() === "noida";
      locationConditions.push(
        isStrictNoida
          ? { city: { $regex: /^noida$/i } }
          : { city: { $regex: cityClean, $options: "i" } },
        { area: { $regex: cityClean, $options: "i" } },
        { address: { $regex: cityClean, $options: "i" } },
        { title: { $regex: cityClean, $options: "i" } }
      );
    }

    if (stateClean && stateClean !== "all") {
      locationConditions.push(
        { address: { $regex: stateClean, $options: "i" } },
        { city: { $regex: stateClean, $options: "i" } }
      );
    }

    if (pincodeClean && pincodeClean !== "all") {
      locationConditions.push({ pincode: pincodeClean });
    }

    if (locationConditions.length > 0) {
      andConditions.push({ $or: locationConditions });
    }

    // Filter by Area / Locality
    if (areaClean && areaClean !== "Select Area" && areaClean !== "all") {
      andConditions.push({
        $or: [
          { area: { $regex: areaClean, $options: "i" } },
          { city: { $regex: areaClean, $options: "i" } },
          { address: { $regex: areaClean, $options: "i" } },
          { title: { $regex: areaClean, $options: "i" } }
        ]
      });
    }

    // Filter by Property Type strictly if type provided and not "all"
    if (typeStr && typeStr !== "all") {
      andConditions.push({ type: typeStr });
    }

    // Filter by Rent / Budget
    if (maxPriceStr) {
      const priceLimit = Number(maxPriceStr);
      if (!isNaN(priceLimit)) {
        andConditions.push({ rent: { $lte: priceLimit } });
      }
    }

    // Filter by Furnishing Status
    if (furnishingVal) {
      const furnishingArr = Array.isArray(furnishingVal) ? furnishingVal.map(String) : [String(furnishingVal)];
      andConditions.push({ furnishing: { $in: furnishingArr } });
    }

    // Filter by Room Sharing / Type (Single Room, Shared Room, etc.)
    if (sharingVal) {
      const sharingArr = Array.isArray(sharingVal) ? sharingVal.map(String) : [String(sharingVal)];
      const sharingQueries: any[] = [];
      
      sharingArr.forEach((s) => {
        if (s.toLowerCase() === "single room") {
          sharingQueries.push({ sharing: { $regex: /Single/i } });
        } else if (s.toLowerCase() === "shared room") {
          sharingQueries.push({ sharing: { $regex: /Sharing/i } });
        } else {
          sharingQueries.push({ sharing: { $regex: new RegExp(s, "i") } });
        }
      });

      if (sharingQueries.length > 0) {
        andConditions.push({ $or: sharingQueries });
      }
    }

    // Filter by Tag (e.g. Boys Only, Girls Only, Family)
    if (tagVal) {
      const tagArr = Array.isArray(tagVal) ? tagVal.map(String) : [String(tagVal)];
      const tagQueries = tagArr.map(t => ({
        tag: { $regex: new RegExp(t, "i") }
      }));
      
      if (tagQueries.length > 0) {
        andConditions.push({ $or: tagQueries });
      }
    }

    // Keyword Text Search (Title, Description, City, Area, Address)
    if (searchStr) {
      andConditions.push({
        $or: [
          { title: { $regex: searchStr, $options: "i" } },
          { description: { $regex: searchStr, $options: "i" } },
          { city: { $regex: searchStr, $options: "i" } },
          { area: { $regex: searchStr, $options: "i" } },
          { address: { $regex: searchStr, $options: "i" } }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Load promoted slots to sort active promotions first
    const activeSlots = getSlotsFromFile();
    const promotedIds = activeSlots
      .filter((slot: any) => slot.status === "Active" && slot.listingId)
      .map((slot: any) => slot.listingId);

    // Convert promoted IDs to mongoose ObjectIds for aggregation comparison
    const promotedObjectIds = promotedIds
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    // Optional pagination query parameters (with strict boundary safeguards)
    const pageNum = Math.max(1, Number(req.query.page) || 1);
    let limitNum = Number(req.query.limit);
    if (isNaN(limitNum) || limitNum < 1) {
      limitNum = 100; // Safe default limit
    }
    if (limitNum > 200) {
      limitNum = 200; // Enforce maximum limit to prevent abusiveness
    }

    // Build Aggregation Pipeline to inject `isPromoted` field for priority sorting
    const pipeline: any[] = [
      { $match: query }
    ];

    pipeline.push({
      $addFields: {
        isPromoted: {
          $cond: {
            if: { $in: ["$_id", promotedObjectIds] },
            then: 1,
            else: 0
          }
        }
      }
    });

    // Define Sorting Order (Active promotions always first, then sort by requested option)
    const sortStage: any = { isPromoted: -1 };
    if (sortByStr === "rent_asc") {
      sortStage.rent = 1;
    } else if (sortByStr === "rent_desc") {
      sortStage.rent = -1;
    } else if (sortByStr === "rating") {
      sortStage.rating = -1;
    } else {
      sortStage.createdAt = -1; // Default: Latest
    }
    pipeline.push({ $sort: sortStage });

    const hasCoords = latStr && lonStr && !isNaN(Number(latStr)) && !isNaN(Number(lonStr));

    if (limitNum > 0 && !hasCoords) {
      const skipNum = (pageNum - 1) * limitNum;
      pipeline.push({ $skip: skipNum });
      pipeline.push({ $limit: limitNum });
    }

    let listings = await Listing.aggregate(pipeline);

    if (hasCoords) {
      const userLat = Number(latStr);
      const userLon = Number(lonStr);
      
      listings = listings.map((item) => {
        if (item.latitude !== undefined && item.longitude !== undefined && item.latitude !== null && item.longitude !== null) {
          const distance = calculateDistance(userLat, userLon, item.latitude, item.longitude);
          return { ...item, distance };
        }
        return { ...item, distance: 999999 };
      });

      // Sort by proximity primarily, while respecting isPromoted status
      listings.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return a.distance - b.distance;
      });

      if (limitNum > 0) {
        const skipNum = (pageNum - 1) * limitNum;
        listings = listings.slice(skipNum, skipNum + limitNum);
      }
    }

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error fetching listings", 
      error: (error as Error).message 
    });
  }
};

// @desc    Get single listing details
// @route   GET /api/listings/:id
// @access  Public
export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.listingStatus === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error fetching listing detail", 
      error: (error as Error).message 
    });
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Owner Only)
export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Validate request body
    const validation = createListingSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    // Auto-bind listing to authenticated Owner and overwrite basic owner contact details
    const listingData: any = {
      ...validation.data,
      owner: user._id,
      ownerName: user.fullName,
      ownerPhone: user.mobile || req.body.ownerPhone || "",
      ownerWhatsApp: req.body.ownerWhatsApp || user.mobile || "",
      listingStatus: "active" // Default newly created listing to active
    };

    // Geocode coordinates if not provided
    if (!listingData.latitude || !listingData.longitude) {
      const coords = await geocodeAddress(listingData.address || "", listingData.area || "", listingData.city || "");
      if (coords) {
        listingData.latitude = coords.lat;
        listingData.longitude = coords.lon;
      }
    }

    const newListing = new Listing(listingData);
    const saved = await newListing.save();

    // Trigger Notification
    try {
      await Notification.create({
        owner: user._id as any,
        title: "Listing Published",
        message: `Your listing "${saved.title}" has been successfully published!`,
        type: "success"
      });
    } catch (err) {
      console.error("Failed to create notification on publish:", err);
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ 
      message: "Invalid Listing Data", 
      error: (error as Error).message 
    });
  }
};

// @desc    Update existing listing details
// @route   PUT /api/listings/:id
// @access  Private (Owner Only)
export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.listingStatus === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!listing.owner || listing.owner.toString() !== user._id.toString()) {
      res.status(403).json({ message: "Not authorized to update this listing" });
      return;
    }

    const validation = createListingSchema.partial().safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
      return;
    }

    Object.assign(listing, validation.data);

    // Check if we need to re-geocode coordinates
    const needsGeocode = 
      validation.data.address !== undefined || 
      validation.data.area !== undefined || 
      validation.data.city !== undefined || 
      !listing.latitude || 
      !listing.longitude;
      
    if (needsGeocode) {
      const coords = await geocodeAddress(listing.address || "", listing.area || "", listing.city || "");
      if (coords) {
        listing.latitude = coords.lat;
        listing.longitude = coords.lon;
      }
    }

    const updated = await listing.save();

    // Trigger Notification
    try {
      await Notification.create({
        owner: user._id as any,
        title: "Listing Updated",
        message: `Your listing "${updated.title}" has been updated successfully.`,
        type: "info"
      });
    } catch (err) {
      console.error("Failed to create notification on update:", err);
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error updating listing", 
      error: (error as Error).message 
    });
  }
};

// @desc    Delete listing (Hard Delete from Database and disk)
// @route   DELETE /api/listings/:id
// @access  Private (Owner Only)
export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Check ownership
    if (!listing.owner || listing.owner.toString() !== user._id.toString()) {
      res.status(403).json({ message: "Not authorized to delete this listing" });
      return;
    }

    // 1. Delete associated image files from uploads directory on disk
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

    if (listing.image) deleteLocalFile(listing.image);
    if (listing.images && listing.images.length > 0) {
      listing.images.forEach((img) => deleteLocalFile(img));
    }

    // 2. Hard delete listing from database
    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Listing permanently deleted from database and disk." });
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error deleting listing", 
      error: (error as Error).message 
    });
  }
};

// @desc    Get logged in Owner's listings
// @route   GET /api/listings/my-listings
// @access  Private (Owner Only)
export const getMyListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Fetch all listings owned by this user, excluding deleted ones (we want to show active and hidden)
    const listings = await Listing.find({ 
      owner: user._id,
      listingStatus: { $ne: "deleted" }
    }).sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error fetching owner listings", 
      error: (error as Error).message 
    });
  }
};

// @desc    Update listing status (Activate / Deactivate)
// @route   PATCH /api/listings/:id/status
// @access  Private (Owner Only)
export const updateListingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["active", "hidden"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.listingStatus === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }
    const user = (req as any).user;
    if (!user || !listing.owner || listing.owner.toString() !== user._id.toString()) {
      res.status(401).json({ message: "Not authorized to update this listing" });
      return;
    }

    listing.listingStatus = status as "active" | "hidden";
    await listing.save();

    res.status(200).json({ 
      message: `Listing status updated to ${status} successfully`, 
      listingStatus: listing.listingStatus 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error updating listing status", 
      error: (error as Error).message 
    });
  }
};

// Background migration helper to geocode any listings without coordinates
export const geocodeExistingListings = async (): Promise<void> => {
  try {
    const listings = await Listing.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
        { latitude: null },
        { longitude: null }
      ]
    });

    if (listings.length === 0) {
      console.log("⚡️[migration]: All listings have coordinates. No geocoding needed.");
      return;
    }

    console.log(`⚡️[migration]: Found ${listings.length} listings without coordinates. Geocoding in the background...`);

    // Run geocoding in background sequentially with delay to respect Nominatim policy
    for (const listing of listings) {
      try {
        const coords = await geocodeAddress(listing.address || "", listing.area || "", listing.city || "");
        if (coords) {
          listing.latitude = coords.lat;
          listing.longitude = coords.lon;
          await listing.save();
          console.log(`⚡️[migration]: Successfully geocoded listing "${listing.title}" to (${coords.lat}, ${coords.lon})`);
        } else {
          console.warn(`⚡️[migration]: Could not geocode listing "${listing.title}"`);
        }
        // sleep 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`⚡️[migration]: Error geocoding listing "${listing.title}":`, err);
      }
    }
  } catch (err) {
    console.error("⚡️[migration]: Error during geocoding migration:", err);
  }
};

// @desc    Submit a new boost request for verification
// @route   POST /api/listings/:id/boost
// @access  Private (Owner Only)
export const submitBoostRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { plan, amount, screenshot } = req.body;
    if (!plan || !amount || !screenshot) {
      res.status(400).json({ message: "Plan, amount and payment screenshot are required" });
      return;
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.listingStatus === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Verify ownership
    if (!listing.owner || listing.owner.toString() !== user._id.toString()) {
      res.status(403).json({ message: "Not authorized to boost this listing" });
      return;
    }

    // Check if there is already a Pending boost request for this listing
    const existingPending = await BoostRequest.findOne({
      listing: listing._id as any,
      status: "Pending"
    });
    if (existingPending) {
      res.status(400).json({ message: "A boost verification request is already pending for this listing" });
      return;
    }

    const boostRequest = new BoostRequest({
      listing: listing._id as any,
      owner: user._id as any,
      plan,
      amount,
      screenshot,
      status: "Pending"
    });

    await boostRequest.save();

    // Create system notification for verification request
    try {
      const adminNotification = new Notification({
        owner: user._id as any,
        title: "Boost Request Submitted",
        message: `Your boost request for "${listing.title}" (Plan: ${plan}) has been submitted for manual payment verification.`,
        type: "system",
        read: false
      });
      await adminNotification.save();
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: "Boost verification request submitted successfully!",
      boostRequest
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error submitting boost request",
      error: (error as Error).message
    });
  }
};

// @desc    Get current host's boost requests
// @route   GET /api/listings/boost-requests/my-requests
// @access  Private (Owner Only)
export const getMyBoostRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const requests = await BoostRequest.find({ owner: user._id })
      .populate("listing", "title type rent city area image")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching boost requests",
      error: (error as Error).message
    });
  }
};

// @desc    Register a new tenant inquiry for a listing
// @route   POST /api/listings/:id/inquiry
// @access  Public
export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, name, phone } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!listing.owner) {
      res.status(400).json({ message: "Listing owner not configured" });
      return;
    }

    const inquiry = await Inquiry.create({
      listingId: listing._id as any,
      ownerId: listing.owner as any,
      type: type || "call",
      name: name || "Guest User",
      phone: phone || "Not Provided"
    });

    res.status(201).json({
      success: true,
      message: "Inquiry registered successfully",
      inquiry
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error registering inquiry",
      error: (error as Error).message
    });
  }
};

// @desc    Get logged in Owner's inquiries
// @route   GET /api/listings/inquiries/my-inquiries
// @access  Private (Owner Only)
export const getMyInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const inquiries = await Inquiry.find({ ownerId: user._id })
      .populate("listingId", "title type rent city area image")
      .sort({ createdAt: -1 });

    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching inquiries",
      error: (error as Error).message
    });
  }
};

// @desc    Report a listing
// @route   POST /api/listings/:id/report
// @access  Public
export const reportListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason, message } = req.body;
    if (!reason) {
      res.status(400).json({ message: "Reason for reporting is required" });
      return;
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    const report = await Report.create({
      listingId: listing._id as any,
      listingTitle: listing.title,
      ownerName: listing.ownerName || "Property Owner",
      reason,
      message: message || ""
    });

    res.status(201).json({
      success: true,
      message: "Listing reported successfully to Admin",
      report
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error reporting listing",
      error: (error as Error).message
    });
  }
};
