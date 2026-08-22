import { z } from "zod";

// Password regex: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full Name must be at least 2 characters"),
  email: z.string().trim().lowercase().email("Invalid email format").optional(),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full Name must be at least 2 characters").optional(),
  email: z.string().trim().lowercase().email("Invalid email format").optional().or(z.literal("").optional()),
  profileImage: z.string().optional().or(z.literal("").optional()),
  mobile: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number format").optional(),
  alternateMobile: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid alternate mobile number format").optional().or(z.literal("").optional()),
  city: z.string().trim().min(2, "City must be at least 2 characters").optional(),
  state: z.string().trim().min(2, "State must be at least 2 characters").optional(),
  address: z.string().trim().min(5, "Address must be at least 5 characters").optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be exactly 6 digits").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().lowercase().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    passwordRegex,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
