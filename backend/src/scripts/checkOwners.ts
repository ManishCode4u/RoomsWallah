import mongoose from "mongoose";
import dotenv from "dotenv";
import Owner from "../models/Owner.js";

dotenv.config();

const checkOwners = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/roomswallah";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB...");
    
    const count = await Owner.countDocuments();
    console.log(`Total Owners in DB: ${count}`);
    
    const all = await Owner.find({}, { password: 0 }); // Hide password hashes
    console.log("Owners details:");
    console.log(JSON.stringify(all, null, 2));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error connecting or querying:", error);
  }
};

checkOwners();
