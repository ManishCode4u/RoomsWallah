import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "../models/Listing.js";

dotenv.config();

const listAll = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/roomswallah";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB...");
    
    const listings = await Listing.find({});
    console.log(`Total listings found: ${listings.length}`);
    listings.forEach((item) => {
      console.log(`- ID: ${item._id}, Title: "${item.title}", Type: "${item.type}", Status: "${item.listingStatus}", Rent: ${item.rent}`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error listing properties:", err);
  }
};

listAll();
