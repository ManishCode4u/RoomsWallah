import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "../models/Listing.js";
import { Owner } from "../models/Owner.js";
import { Promotion } from "../models/Promotion.js";
import { Inquiry } from "../models/Inquiry.js";
import { BoostRequest } from "../models/BoostRequest.js";
import { Notification } from "../models/Notification.js";

dotenv.config();

const clearDB = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/roomswallah";
    await mongoose.connect(connString);
    console.log("📡 Connected to MongoDB to clear data...");

    await Listing.deleteMany({});
    console.log("🗑 Cleared all Listings.");

    await Owner.deleteMany({});
    console.log("🗑 Cleared all Owners.");

    await Promotion.deleteMany({});
    console.log("🗑 Cleared all Promotions.");

    await Inquiry.deleteMany({});
    console.log("🗑 Cleared all Inquiries.");

    await BoostRequest.deleteMany({});
    console.log("🗑 Cleared all BoostRequests.");

    await Notification.deleteMany({});
    console.log("🗑 Cleared all Notifications.");

    console.log("🧹 Database cleared completely!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
};

clearDB();