import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "../models/Listing.js";

dotenv.config();

const checkListings = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB...");
    
    const count = await Listing.countDocuments();
    console.log(`Total listings in DB: ${count}`);
    
    const all = await Listing.find();
    console.log("Listings details:");
    console.log(JSON.stringify(all, null, 2));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error connecting or querying:", error);
  }
};

checkListings();
