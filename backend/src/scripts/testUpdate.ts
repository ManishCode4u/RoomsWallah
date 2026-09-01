import mongoose from "mongoose";
import dotenv from "dotenv";
import Owner from "../models/Owner.js";

dotenv.config();

const run = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB...");
    
    const owner = await Owner.findOne({ mobile: "9155596712" });
    if (!owner) {
      console.log("Owner not found");
      return;
    }
    
    console.log("Found owner:", owner.fullName, "with ID:", owner._id);
    
    const updateData = {
      fullName: "Manish",
      email: "manish@gmail.com",
      mobile: "9155596712",
      alternateMobile: "9155596712"
    };
    
    if (updateData.fullName) owner.fullName = updateData.fullName;
    if (updateData.email === "") {
      owner.email = undefined;
    } else if (updateData.email) {
      owner.email = updateData.email;
    }
    owner.mobile = updateData.mobile;
    owner.alternateMobile = updateData.alternateMobile || "";
    owner.profileCompleted = true;
    
    console.log("Saving owner...");
    const saved = await owner.save();
    console.log("Saved successfully:", saved);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error during save:", error);
  }
};

run();
