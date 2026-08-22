import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  type: z.enum(["room", "pg", "hostel", "flat"], {
    message: "Type must be 'room', 'pg', 'hostel', or 'flat'",
  }),
  rent: z.number().min(0, "Rent must be a positive number"),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  area: z.string().trim().min(2, "Area must be at least 2 characters"),
  image: z.string().trim().min(1, "Image URL/path is required"),
  images: z.array(z.string()).default([]),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  tag: z.string().trim().min(1, "Tag is required"),
  amenities: z.array(z.string()).default([]),
  furnishing: z.string().trim().min(1, "Furnishing status is required"),
  sharing: z.string().trim().optional(),
  address: z.string().trim().optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .optional()
    .or(z.literal("").optional()),
  deposit: z.number().min(0, "Deposit must be a positive number").optional().or(z.literal(0).optional()),
  foodFacility: z.string().trim().optional().or(z.literal("").optional()),
  rules: z.string().trim().optional().or(z.literal("").optional()),
  availableRooms: z.number().min(0, "Available rooms must be a positive number").optional(),
  genderPreference: z.enum(["Boys Only", "Girls Only", "Family / Couple", "Anyone"]).optional(),
  preferredTenants: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
