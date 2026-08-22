export interface PropertyListing {
  id: string;
  title: string;
  type: "room" | "pg" | "hostel" | "flat";
  rent: number;
  city: string;
  area: string;
  image: string;
  description: string;
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerWhatsApp: string;
  tag: string; // e.g. "Boys Only", "Girls Only", "Family / Couple"
  rating: number;
  furnishing: string; // e.g. "Fully Furnished", "Semi-Furnished"
  sharing?: string; // e.g. "Single Room", "Double Sharing", "3-Sharing"
  deposit?: number;
  images?: string[];
  rules?: string;
  address?: string;
  pincode?: string;
  foodFacility?: string;
}

export const mockProperties: PropertyListing[] = [];

export const popularCities = [
  { name: "Noida", count: "120+ Listings", image: "/assets/room1.png" },
  { name: "Greater Noida", count: "80+ Listings", image: "/assets/room2.png" },
  { name: "Delhi", count: "250+ Listings", image: "/assets/hostel1.png" },
  { name: "Gurugram", count: "180+ Listings", image: "/assets/pg1.png" },
];
