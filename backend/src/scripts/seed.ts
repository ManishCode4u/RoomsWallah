import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "../models/Listing.js";
import { Promotion } from "../models/Promotion.js";

dotenv.config();

const sampleListings = [
  {
    title: "Fully Furnished Luxury Room",
    type: "room",
    rent: 6500,
    city: "Greater Noida",
    area: "Knowledge Park 3",
    image: "/assets/room1.png",
    description: "Premium single room designed for students and working professionals. Located in the heart of Knowledge Park 3, close to major engineering and management colleges. It is fully furnished with a study table, modern wardrobe, comfortable single bed, and soft linens. Includes high-speed Wi-Fi and quiet study vibes.",
    amenities: ["Wi-Fi", "AC", "Power Backup", "Cleaning", "Parking"],
    ownerName: "Rakesh Sharma",
    ownerPhone: "+919876543210",
    ownerWhatsApp: "https://wa.me/919876543210",
    tag: "Boys Only",
    rating: 4.8,
    furnishing: "Fully Furnished",
    sharing: "Single Room",
  },
  {
    title: "Spacious 1BHK Flat for Rent",
    type: "flat",
    rent: 8000,
    city: "Greater Noida",
    area: "Beta 2",
    image: "/assets/room2.png",
    description: "Beautiful and ventilated 1BHK room perfect for couples or small families. Fully modular kitchen, attached washroom, balcony view, and premium wooden wardrobes. 24/7 security and close proximity to Metro Station and Local Market.",
    amenities: ["Wi-Fi", "Kitchen", "AC", "Parking", "Geyser"],
    ownerName: "Sunita Gupta",
    ownerPhone: "+919812345678",
    ownerWhatsApp: "https://wa.me/919812345678",
    tag: "Family / Couple",
    rating: 4.9,
    furnishing: "Semi-Furnished",
    sharing: "1 BHK",
  },
  {
    title: "Modern 2BHK Apartment",
    type: "flat",
    rent: 14000,
    city: "Greater Noida",
    area: "Alpha 1",
    image: "/assets/room2.png",
    description: "Well-furnished 2BHK flat available for rent in a secure residential society. Features 2 large bedrooms, 2 washrooms, modern modular kitchen, and separate living and dining space. Safe community with park and lift services.",
    amenities: ["Wi-Fi", "Kitchen", "Security", "Parking", "Gym", "Power Backup"],
    ownerName: "Sunita Gupta",
    ownerPhone: "+919812345678",
    ownerWhatsApp: "https://wa.me/919812345678",
    tag: "Family / Couple",
    rating: 4.8,
    furnishing: "Fully Furnished",
    sharing: "2 BHK",
  },
  {
    title: "Premium PG for Boys - Triple Sharing",
    type: "pg",
    rent: 4500,
    city: "Noida",
    area: "Sector 62",
    image: "/assets/pg1.png",
    description: "An affordable, clean, and highly secure PG accommodation for young boys. Includes 3 times delicious home-style meals, laundry service, and active room cleaning. Located near major corporate offices and tech parks in Noida Sector 62.",
    amenities: ["Wi-Fi", "Food Included", "AC", "Power Backup", "Security"],
    ownerName: "Vikram Singh",
    ownerPhone: "+919999888777",
    ownerWhatsApp: "https://wa.me/919999888777",
    tag: "Boys Only",
    rating: 4.6,
    furnishing: "Fully Furnished",
    sharing: "Triple Sharing",
  },
  {
    title: "Elite PG for Girls - Single & Double Sharing",
    type: "pg",
    rent: 7500,
    city: "Noida",
    area: "Sector 15",
    image: "/assets/pg1.png",
    description: "Highly rated girls-only PG featuring CCTV security, electronic entry cards, and cozy pastel interiors. Double sharing rooms with comfortable mattresses, storage drawers, and personal desks. Gym facility and breakfast/dinner included.",
    amenities: ["Wi-Fi", "Food Included", "Gym", "Power Backup", "CCTV Security"],
    ownerName: "Neha Verma",
    ownerPhone: "+919555444333",
    ownerWhatsApp: "https://wa.me/919555444333",
    tag: "Girls Only",
    rating: 4.7,
    furnishing: "Fully Furnished",
    sharing: "Double Sharing",
  },
  {
    title: "Vibrant Student Hostel Room",
    type: "hostel",
    rent: 5500,
    city: "Delhi",
    area: "North Campus",
    image: "/assets/hostel1.png",
    description: "Lively hostel accommodation for students studying in Delhi University North Campus. Complete with study corridors, recreation hall, and 24/7 canteen. Shared double bed setup with clean modern wardrobes and personal lockers.",
    amenities: ["Wi-Fi", "Food Included", "Recreation Hall", "Lockers", "Power Backup"],
    ownerName: "Aman Malhotra",
    ownerPhone: "+918888777766",
    ownerWhatsApp: "https://wa.me/918888777766",
    tag: "Boys Only",
    rating: 4.5,
    furnishing: "Fully Furnished",
    sharing: "Double Sharing",
  },
  {
    title: "Comfortable PG for Boys in Boring Road",
    type: "pg",
    rent: 5000,
    city: "Patna",
    area: "Boring Road",
    image: "/assets/pg1.png",
    description: "Affordable boys PG located in the central student area of Boring Road. Daily hygienic meals, high speed Wi-Fi, laundry service, and 24/7 water/electricity backup included in rent.",
    amenities: ["Wi-Fi", "Food Included", "Power Backup", "Cleaning"],
    ownerName: "Rajesh Kumar",
    ownerPhone: "+919122334455",
    ownerWhatsApp: "https://wa.me/919122334455",
    tag: "Boys Only",
    rating: 4.6,
    furnishing: "Semi-Furnished",
    sharing: "Double Sharing",
  },
  {
    title: "Spacious 2BHK Flat near Kankarbagh",
    type: "flat",
    rent: 9000,
    city: "Patna",
    area: "Kankarbagh",
    image: "/assets/room2.png",
    description: "Well ventilated 2BHK flat available for rent near Kankarbagh. Modern amenities, kitchen setup, parking slot, and close to medical centers and transport hubs.",
    amenities: ["Kitchen", "Parking", "AC", "Power Backup"],
    ownerName: "Anil Sinha",
    ownerPhone: "+918102345678",
    ownerWhatsApp: "https://wa.me/918102345678",
    tag: "Family / Couple",
    rating: 4.7,
    furnishing: "Fully Furnished",
    sharing: "2 BHK",
  }
];

const extraGreaterNoidaListings: any[] = [];
for (let i = 1; i <= 22; i++) {
  extraGreaterNoidaListings.push({
    title: `Cozy Student Room ${i}`,
    type: i % 2 === 0 ? "room" : "pg",
    rent: 5000 + (i * 200),
    city: "Greater Noida",
    area: i % 3 === 0 ? "Alpha 2" : i % 3 === 1 ? "Beta 1" : "Knowledge Park 3",
    image: i % 2 === 0 ? "/assets/room1.png" : "/assets/pg1.png",
    description: `Hygienic and comfortable student co-living space room number ${i}. Well maintained property near engineering colleges with all amenities included in rent. Ideal for college students.`,
    amenities: ["Wi-Fi", "Cleaning", "Power Backup", "CCTV Security"],
    ownerName: `Owner Sharma ${i}`,
    ownerPhone: `+919876543${100+i}`,
    ownerWhatsApp: `https://wa.me/919876543${100+i}`,
    tag: i % 2 === 0 ? "Boys Only" : "Girls Only",
    rating: 4.2 + (i % 8) * 0.1,
    furnishing: i % 3 === 0 ? "Fully Furnished" : "Semi-Furnished",
    sharing: i % 2 === 0 ? "Double Sharing" : "Single Room",
  });
}

const seedDB = async () => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
    await mongoose.connect(connString);
    console.log("📡 Connected to MongoDB to seed...");

    // Clear existing listings and promotions
    await Listing.deleteMany();
    await Promotion.deleteMany();
    console.log("🗑 Cleared existing listings and promotions.");

    // Insert sample listings
    await Listing.insertMany([...sampleListings, ...extraGreaterNoidaListings]);

    // Insert sample promotions
    const samplePromotions = [
      {
        title: "List Your Room & Find Genuine Tenants",
        subtitle: "Quick, Easy. 100% Free.",
        badge: "NEW",
        buttonText: "List Your Room",
        buttonLink: "/welcome",
        gradientFrom: "#6C4CF1",
        gradientTo: "#8E75FF",
        icon: "Smartphone",
        status: "active",
        image: ""
      },
      {
        title: "Verified Student PGs & Hostels Near Campus",
        subtitle: "Zero Brokerage. Verified Owners.",
        badge: "FEATURED",
        buttonText: "Explore PGs & Hostels",
        buttonLink: "/pg",
        gradientFrom: "#10B981",
        gradientTo: "#059669",
        icon: "Sparkles",
        status: "active",
        image: ""
      }
    ];
    await Promotion.insertMany(samplePromotions);
    console.log("🌱 Database seeded successfully with initial listings & promotions!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
