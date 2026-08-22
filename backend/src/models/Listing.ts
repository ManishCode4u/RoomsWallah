import { Schema, model, Document } from "mongoose";

export interface IListing extends Document {
  title: string;
  type: "room" | "pg" | "hostel" | "flat";
  rent: number;
  city: string;
  area: string;
  image: string;
  images?: string[];
  description: string;
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerWhatsApp: string;
  tag: string;
  rating: number;
  furnishing: string;
  sharing?: string;
  owner?: Schema.Types.ObjectId;
  listingStatus: "active" | "hidden" | "deleted";
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  deposit?: number;
  foodFacility?: string;
  rules?: string;
  availableRooms?: number;
  genderPreference?: "Boys Only" | "Girls Only" | "Family / Couple" | "Anyone";
  preferredTenants?: string[];
  createdAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["room", "pg", "hostel", "flat"], required: true },
    rent: { type: Number, required: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
    amenities: [{ type: String }],
    ownerName: { type: String, required: true, trim: true },
    ownerPhone: { type: String, required: true },
    ownerWhatsApp: { type: String, required: true },
    tag: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    furnishing: { type: String, required: true },
    sharing: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "Owner" },
    listingStatus: { 
      type: String, 
      enum: ["active", "hidden", "deleted"], 
      default: "active" 
    },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    deposit: { type: Number },
    foodFacility: { type: String, trim: true },
    rules: { type: String, trim: true },
    availableRooms: { type: Number, default: 1 },
    genderPreference: { 
      type: String, 
      enum: ["Boys Only", "Girls Only", "Family / Couple", "Anyone"], 
      default: "Anyone" 
    },
    preferredTenants: [{ type: String }]
  },
  {
    timestamps: true
  }
);

// Optimize performance for common queries using indexes
ListingSchema.index({ listingStatus: 1, type: 1 });
ListingSchema.index({ city: 1, area: 1 });
ListingSchema.index({ rent: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ owner: 1 });
ListingSchema.index({ rating: -1 });

// Add text indexes for search support (on title and description)
ListingSchema.index({ title: "text", description: "text" });

export const Listing = model<IListing>("Listing", ListingSchema);
