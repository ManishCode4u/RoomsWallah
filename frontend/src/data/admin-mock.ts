export interface Owner {
  id: string;
  name: string;
  mobile: string;
  email: string;
  joinedDate: string;
  avatar: string;
  status: "Active" | "Blacklisted";
}

export interface Advertisement {
  id: string;
  companyName: string;
  website: string;
  image: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Disabled";
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  replied?: boolean;
}

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle: string;
  ownerName: string;
  reason: "Fake Listing" | "Wrong Information" | "Duplicate Listing" | "Spam";
  message?: string;
  date: string;
  status: "Pending" | "Ignored" | "Resolved";
}

export interface PromotionSlot {
  slotId: "hero" | "home_card" | "top_rooms" | "middle_ad" | "bottom_banner";
  slotName: string;
  listingId: string | null;
  expiryDate: string;
  status: "Active" | "Disabled" | "Empty";
}

export const mockOwners: Owner[] = [];

export const mockAdvertisements: Advertisement[] = [];

export const mockContactMessages: ContactMessage[] = [];

export const mockReports: ListingReport[] = [];

export const mockPromotionSlots: PromotionSlot[] = [
  {
    slotId: "hero",
    slotName: "Hero Banner",
    listingId: null,
    expiryDate: "",
    status: "Empty"
  },
  {
    slotId: "home_card",
    slotName: "Home Promotion Card",
    listingId: null,
    expiryDate: "",
    status: "Empty"
  },
  {
    slotId: "top_rooms",
    slotName: "Top Rooms Promotion",
    listingId: null,
    expiryDate: "",
    status: "Empty"
  },
  {
    slotId: "middle_ad",
    slotName: "Middle Advertisement Banner",
    listingId: null,
    expiryDate: "",
    status: "Empty"
  },
  {
    slotId: "bottom_banner",
    slotName: "Bottom Banner",
    listingId: null,
    expiryDate: "",
    status: "Empty"
  }
];
