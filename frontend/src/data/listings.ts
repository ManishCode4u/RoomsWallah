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

