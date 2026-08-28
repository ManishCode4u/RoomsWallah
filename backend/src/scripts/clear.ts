import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "../models/Listing.js";
import { Promotion } from "../models/Promotion.js";

dotenv.config();

const clearDB = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/roomswallah";
    await mongoose.connect(connString);
    console.log("📡 Connected to MongoDB to purge data...");

    // Clear existing listings and promotions
    const listingsResult = await Listing.deleteMany();
    const promotionsResult = await Promotion.deleteMany();
    console.log(`🗑 Purged ${listingsResult.deletedCount} listings and ${promotionsResult.deletedCount} promotions from the database successfully.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error purging database:", error);
    process.exit(1);
  }
};

clearDB();