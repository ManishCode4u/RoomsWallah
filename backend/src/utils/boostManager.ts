import fs from "fs";
import path from "path";
import BoostRequest from "../models/BoostRequest.js";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";

const SLOTS_FILE = path.join(process.cwd(), "uploads", "slots.json");

export interface IPromotedSlot {
  status: "Active" | "Expired" | "Inactive";
  listingId: string;
  ownerId?: string;
  plan?: string;
  amount?: number;
  durationDays?: number;
  approvedAt?: string;
  expiresAt?: string;
  notifiedExpiry?: boolean;
}

/**
 * Determine duration in days and expiry timestamp based on plan/amount.
 * ₹19 = 7 Days
 * ₹49 = 30 Days (1 Month)
 */
export const calculateBoostDuration = (amount: number, plan: string = ""): { durationDays: number; expiresAt: Date } => {
  const planLower = plan.toLowerCase();
  let durationDays = 7; // Default 7 days for ₹19

  if (amount === 49 || planLower.includes("49") || planLower.includes("ultra") || planLower.includes("month")) {
    durationDays = 30; // 1 month for ₹49
  } else if (amount === 19 || planLower.includes("19") || planLower.includes("basic") || planLower.includes("standard")) {
    durationDays = 7; // 7 days for ₹19
  }

  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
  return { durationDays, expiresAt };
};

/**
 * Read raw slots from filesystem
 */
export const readRawSlots = (): IPromotedSlot[] => {
  try {
    if (fs.existsSync(SLOTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SLOTS_FILE, "utf-8"));
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.error("Error reading slots.json:", e);
  }
  return [];
};

/**
 * Write slots to filesystem
 */
export const saveRawSlots = (slots: IPromotedSlot[]): void => {
  try {
    const dir = path.dirname(SLOTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SLOTS_FILE, JSON.stringify(slots, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving slots.json:", e);
  }
};

/**
 * Check all active boosts, deactivate expired ones and notify owners.
 */
export const checkAndExpireBoosts = async (): Promise<IPromotedSlot[]> => {
  try {
    const now = new Date();
    let slots = readRawSlots();
    let hasChanges = false;

    // 1. Process filesystem slots
    for (const slot of slots) {
      if (slot.status === "Active" && slot.expiresAt) {
        const expiryDate = new Date(slot.expiresAt);
        if (now >= expiryDate) {
          slot.status = "Expired";
          hasChanges = true;

          // Deactivate in DB Listing
          try {
            const listing = await Listing.findById(slot.listingId);
            if (listing) {
              listing.isBoosted = false;
              listing.boostExpiresAt = undefined;
              await listing.save();
            }

            // Update BoostRequest status in DB
            const boostReq = await BoostRequest.findOne({
              listing: slot.listingId as any,
              status: "Approved"
            });
            if (boostReq) {
              boostReq.status = "Expired";
              await boostReq.save();
            }

            // Send notification to owner if not already notified
            if (!slot.notifiedExpiry && (slot.ownerId || listing?.owner)) {
              const targetOwnerId = slot.ownerId || listing?.owner?.toString();
              if (targetOwnerId) {
                await Notification.create({
                  owner: targetOwnerId as any,
                  title: "Listing Boost Expired ⏰",
                  message: `Your ${slot.plan || "Boost"} plan for "${listing?.title || "Property"}" (${slot.durationDays || 7} days) has expired. Boost again to get #1 search placement!`,
                  type: "warning",
                  read: false
                });
                slot.notifiedExpiry = true;
              }
            }
          } catch (err) {
            console.error("Error expiring boost for slot:", slot.listingId, err);
          }
        }
      }
    }

    // 2. Also check database listings directly
    try {
      const expiredDbListings = await Listing.find({
        isBoosted: true,
        boostExpiresAt: { $lte: now }
      });

      for (const listing of expiredDbListings) {
        listing.isBoosted = false;
        listing.boostExpiresAt = undefined;
        await listing.save();

        if (listing.owner) {
          await Notification.create({
            owner: listing.owner,
            title: "Listing Boost Expired ⏰",
            message: `Your boost plan for "${listing.title}" has completed its duration and expired. Boost again to keep your property at the top!`,
            type: "warning",
            read: false
          });
        }
      }
    } catch (err) {
      console.error("Error checking expired DB listings:", err);
    }

    if (hasChanges) {
      saveRawSlots(slots);
    }

    return slots;
  } catch (error) {
    console.error("Error running checkAndExpireBoosts:", error);
    return readRawSlots();
  }
};

/**
 * Get only currently active, non-expired promoted slots.
 */
export const getActiveBoostSlots = async (): Promise<IPromotedSlot[]> => {
  const slots = await checkAndExpireBoosts();
  return slots.filter((slot) => slot.status === "Active");
};

/**
 * Start periodic cron checker (every 60 seconds)
 */
export const startBoostExpiryScheduler = (): void => {
  // Run once immediately
  checkAndExpireBoosts();

  // Run every 60 seconds
  setInterval(() => {
    checkAndExpireBoosts();
  }, 60 * 1000);

  console.log("⏱ Boost Expiration Engine initialized (Checks every 60s)");
};
