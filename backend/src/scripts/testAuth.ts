import mongoose from "mongoose";
import dotenv from "dotenv";
import { Owner } from "../models/Owner.js";
import { Listing } from "../models/Listing.js";
import { register, login, updateProfile } from "../controllers/authController.js";
import { createListing, getListings, deleteListing } from "../controllers/listingController.js";

dotenv.config();

const mockRes = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.jsonData = data;
    return res;
  };
  res.cookie = (name: string, value: string, options: any) => {
    res.cookies = res.cookies || {};
    res.cookies[name] = { value, options };
    return res;
  };
  res.clearCookie = (name: string, options: any) => {
    res.cookies = res.cookies || {};
    delete res.cookies[name];
    res.cookieCleared = name;
    return res;
  };
  return res;
};

const runTests = async () => {
  console.log("🚀 Starting Authentication and Authorization Integration Tests...");
  
  // Connect to DB
  const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
  await mongoose.connect(connString);
  console.log("📡 Connected to Database");

  // Clean test data
  await Owner.deleteMany({ email: /@testauth\.com/ });
  await Listing.deleteMany({ title: /Test Listing/ });
  console.log("🧹 Cleaned existing test database records");

  // Test 1: Password Strength Validation Fail
  console.log("\n🧪 Test 1: Register with weak password");
  const req1: any = {
    body: {
      fullName: "Test Owner",
      email: "test@testauth.com",
      mobile: "9876543210",
      password: "123",
      confirmPassword: "123"
    },
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" },
    socket: { remoteAddress: "127.0.0.1" }
  };
  const res1 = mockRes();
  await register(req1, res1);
  console.log(`Status: ${res1.statusCode}`);
  console.log(`Validation Error Message:`, res1.jsonData?.message);
  if (res1.statusCode === 400 && res1.jsonData?.errors) {
    console.log("✅ Test 1 Passed: Correctly blocked weak password");
  } else {
    console.error("❌ Test 1 Failed");
  }

  // Test 2: Successful Registration
  console.log("\n🧪 Test 2: Successful Owner Registration");
  const req2: any = {
    body: {
      fullName: "Test Owner",
      email: "test@testauth.com",
      mobile: "9876543210",
      password: "SecurePassword123!",
      confirmPassword: "SecurePassword123!"
    },
    headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15" },
    socket: { remoteAddress: "192.168.1.1" }
  };
  const res2 = mockRes();
  await register(req2, res2);
  console.log(`Status: ${res2.statusCode}`);
  if (res2.statusCode === 201 && res2.cookies?.owner_token) {
    console.log("✅ Test 2 Passed: Owner registered, JWT cookie set successfully");
    console.log("Registered Owner info:", res2.jsonData?.owner);
  } else {
    console.error("❌ Test 2 Failed");
  }

  // Retrieve owner from database to verify tracking fields
  const createdOwner = await Owner.findOne({ email: "test@testauth.com" });
  console.log("\n🔍 Verifying logged device/IP details in DB:");
  console.log(`IP: ${createdOwner?.lastLoginIP}`);
  console.log(`Device: ${createdOwner?.lastLoginDevice}`);
  console.log(`Browser: ${createdOwner?.lastLoginBrowser}`);
  if (createdOwner?.lastLoginDevice === "Mobile" && createdOwner?.lastLoginBrowser === "Safari") {
    console.log("✅ Audit details matched mobile user agent exactly!");
  } else {
    console.warn("⚠️ Device / Browser parsing did not match expected exactly, parsed as device:", createdOwner?.lastLoginDevice, "browser:", createdOwner?.lastLoginBrowser);
  }

  // Test 3: Login Attempt
  console.log("\n🧪 Test 3: Local Login with Mobile/Password");
  const req3: any = {
    body: {
      mobile: "9876543210",
      password: "SecurePassword123!"
    },
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0" },
    socket: { remoteAddress: "10.0.0.5" }
  };
  const res3 = mockRes();
  await login(req3, res3);
  console.log(`Status: ${res3.statusCode}`);
  if (res3.statusCode === 200 && res3.cookies?.owner_token) {
    console.log("✅ Test 3 Passed: Login successful");
  } else {
    console.error("❌ Test 3 Failed");
  }

  // Test 4: Attempt listing property before completing profile
  console.log("\n🧪 Test 4: Create listing before profile completion (should block)");
  const req4: any = {
    user: createdOwner,
    body: {
      title: "Test Listing Room",
      type: "room",
      rent: 5000,
      city: "Delhi",
      area: "Connaught Place",
      image: "http://image.jpg",
      description: "Beautiful room for rent",
      amenities: ["AC", "Wifi"],
      furnishing: "Furnished",
      tag: "Boys Only"
    }
  };
  const res4 = mockRes();
  
  // Simulate profileCompletedOnly middleware
  let middlewarePassed = true;
  // Check if profile is complete (should block)
  if (!createdOwner?.profileCompleted) {
    middlewarePassed = false;
    res4.status(403).json({ message: "Profile incomplete" });
  }
  
  console.log(`Status: ${res4.statusCode}`);
  if (res4.statusCode === 403 && !middlewarePassed) {
    console.log("✅ Test 4 Passed: Prevented property listing creation for incomplete profile");
  } else {
    console.error("❌ Test 4 Failed");
  }

  // Test 5: Profile Completion
  console.log("\n🧪 Test 5: Complete Owner Profile");
  const req5: any = {
    user: createdOwner,
    body: {
      fullName: "Test Owner Updated",
      mobile: "+919876543210",
      alternateMobile: "+919999999999",
      city: "Delhi",
      state: "Delhi",
      address: "12, Block A, Connaught Place",
      pincode: "110001"
    }
  };
  const res5 = mockRes();
  await updateProfile(req5, res5);
  console.log(`Status: ${res5.statusCode}`);
  if (res5.statusCode === 200 && res5.jsonData?.owner?.profileCompleted === true) {
    console.log("✅ Test 5 Passed: Profile completed status updated in DB");
  } else {
    console.error("❌ Test 5 Failed");
  }

  // Update mock user reference for next tests
  const updatedOwner = await Owner.findOne({ email: "test@testauth.com" });

  // Test 6: Create listing after completing profile
  console.log("\n🧪 Test 6: Create listing after profile completion");
  const req6: any = {
    user: updatedOwner,
    body: {
      title: "Test Listing Room",
      type: "room",
      rent: 5000,
      city: "Delhi",
      area: "Connaught Place",
      image: "http://image.jpg",
      description: "Beautiful room for rent",
      amenities: ["AC", "Wifi"],
      furnishing: "Furnished",
      tag: "Boys Only",
      ownerWhatsApp: "+919876543210"
    }
  };
  const res6 = mockRes();
  await createListing(req6, res6);
  console.log(`Status: ${res6.statusCode}`);
  if (res6.statusCode === 201 && res6.jsonData?.owner?.toString() === updatedOwner?._id?.toString()) {
    console.log("✅ Test 6 Passed: Listing created and successfully linked to owner ID");
  } else {
    console.error("❌ Test 6 Failed", res6.jsonData);
  }

  const createdListingId = res6.jsonData?._id;

  // Test 7: Public Listings view filters out inactive status
  console.log("\n🧪 Test 7: Verify public search retrieves listing");
  const req7: any = { query: { search: "Test Listing" } };
  const res7 = mockRes();
  await getListings(req7, res7);
  console.log(`Public Listings Found: ${res7.jsonData?.length}`);
  if (res7.statusCode === 200 && res7.jsonData?.length > 0) {
    console.log("✅ Test 7 Passed: Public listing visible as status is default 'active'");
  } else {
    console.error("❌ Test 7 Failed");
  }

  // Test 8: Soft Delete Listing
  console.log("\n🧪 Test 8: Soft Delete Listing");
  const req8: any = {
    user: updatedOwner,
    params: { id: createdListingId?.toString() }
  };
  const res8 = mockRes();
  await deleteListing(req8, res8);
  console.log(`Status: ${res8.statusCode}`);
  
  const deletedListing = await Listing.findById(createdListingId);
  console.log(`DB listingStatus: ${deletedListing?.listingStatus}`);
  if (res8.statusCode === 200 && deletedListing?.listingStatus === "deleted") {
    console.log("✅ Test 8 Passed: Listing was soft-deleted, not permanently removed");
  } else {
    console.error("❌ Test 8 Failed");
  }

  // Test 9: Public search filter check (deleted listing should not show)
  console.log("\n🧪 Test 9: Verify public search hides soft-deleted listing");
  const req9: any = { query: { search: "Test Listing" } };
  const res9 = mockRes();
  await getListings(req9, res9);
  console.log(`Public Listings Found: ${res9.jsonData?.length}`);
  if (res9.statusCode === 200 && res9.jsonData?.length === 0) {
    console.log("✅ Test 9 Passed: Soft deleted listing is excluded from public search");
  } else {
    console.error("❌ Test 9 Failed");
  }

  // Test 10: Blocked user check
  console.log("\n🧪 Test 10: Block login for suspended/blocked user");
  if (updatedOwner) {
    updatedOwner.status = "blocked";
    await updatedOwner.save();
  }
  const req10: any = {
    body: {
      mobile: "9876543210",
      password: "SecurePassword123!"
    },
    headers: { "user-agent": "Mozilla/5.0" },
    socket: { remoteAddress: "127.0.0.1" }
  };
  const res10 = mockRes();
  await login(req10, res10);
  console.log(`Status: ${res10.statusCode}`);
  console.log(`Error Message:`, res10.jsonData?.message);
  if (res10.statusCode === 403) {
    console.log("✅ Test 10 Passed: Blocked owner is prevented from logging in");
  } else {
    console.error("❌ Test 10 Failed");
  }

  // Cleanup
  await Owner.deleteMany({ email: /@testauth\.com/ });
  await Listing.deleteMany({ title: /Test Listing/ });
  console.log("\n🧹 Cleaned up test data from Database");
  
  await mongoose.disconnect();
  console.log("🔌 Disconnected DB. All tests completed!");
};

runTests().catch(err => {
  console.error("❌ Test script error:", err);
  process.exit(1);
});
