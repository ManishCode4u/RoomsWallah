import mongoose from "mongoose";
import dotenv from "dotenv";
import Owner from "../models/Owner.js";

dotenv.config();

const setProfileComplete = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB...");
    
    const owner = await Owner.findOne({ email: "manishsahu12643@gmail.com" });
    if (!owner) {
      console.log("Owner not found!");
      await mongoose.connection.close();
      return;
    }
    
    owner.profileCompleted = true;
    owner.mobile = owner.mobile || "9263119717";
    await owner.save();
    console.log("SUCCESS: Owner profileCompleted set to true!");
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error connecting or updating:", error);
  }
};

setProfileComplete();
