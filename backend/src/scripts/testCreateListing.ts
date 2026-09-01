import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "../models/Listing.js";
import Owner from "../models/Owner.js";
import { createListingSchema } from "../validations/listingValidation.js";

dotenv.config();

const runTest = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
    await mongoose.connect(connString);
    console.log("Connected to MongoDB...");

    const owner = await Owner.findOne({ email: "manishsahu12643@gmail.com" });
    if (!owner) {
      console.log("Owner not found");
      await mongoose.connection.close();
      return;
    }

    // Mock frontend request body
    const mockRequestBody = {
      title: "Cozy Study Room Near KP-3",
      type: "room",
      rent: 5500,
      city: "Greater Noida",
      area: "Knowledge Park 3",
      image: "/uploads/mock-test-image.jpg",
      description: "A very nice single study room with Wi-Fi, AC, and wooden furnishing. Highly recommended for students.",
      amenities: ["Wi-Fi", "AC", "Study Table"],
      furnishing: "Semi Furnished",
      sharing: "Single Room",
      address: "H-12, Knowledge Park 3, Noida",
      pincode: "201310",
      deposit: 11000,
      foodFacility: "Not Included",
      rules: "No late entry after 10 PM",
      tag: "Boys Only"
    };

    // 1. Run Zod Validation
    const validation = createListingSchema.safeParse(mockRequestBody);
    if (!validation.success) {
      console.error("Zod Validation Failed:", validation.error.format());
      await mongoose.connection.close();
      return;
    }
    console.log("✅ Zod Validation Succeeded!");

    // 2. Build Listing Document (Same logic as listingController.ts)
    const listingData = {
      ...validation.data,
      owner: owner._id,
      ownerName: owner.fullName,
      ownerPhone: owner.mobile || "",
      ownerWhatsApp: owner.mobile || "",
      listingStatus: "active"
    };

    // 3. Save to MongoDB
    const newListing = new Listing(listingData);
    const saved = await newListing.save();
    console.log("✅ MongoDB Save Succeeded! Saved Listing ID:", saved._id);

    // 4. Verify we can fetch it via getMyListings query logic
    const myListings = await Listing.find({ owner: owner._id as any });
    console.log(`✅ Fetch Verification: Found ${myListings.length} listings for this Owner.`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
};

runTest();
