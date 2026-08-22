import mongoose from "mongoose";
import dotenv from "dotenv";
import Owner from "../models/Owner.js";

dotenv.config();

const run = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/roomswallah";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB for cleanup.");

    // Delete test owner
    const deleteResult = await Owner.deleteMany({ email: "test@example.com" });
    console.log("Deleted test accounts count:", deleteResult.deletedCount);

    const owners = await Owner.find({});
    console.log("Current database Owner count:", owners.length);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
};

run();
