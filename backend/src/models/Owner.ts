import { Schema, model, Document } from "mongoose";

export interface IOwner extends Document {
  fullName: string;
  email?: string;
  mobile?: string;
  password?: string;
  googleId?: string;
  profileImage?: string;
  alternateMobile?: string;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
  role: "OWNER";
  provider: "local" | "google";
  profileCompleted: boolean;
  status: "active" | "blocked";
  lastLoginIP?: string;
  lastLoginDevice?: string;
  lastLoginBrowser?: string;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema = new Schema<IOwner>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: false, 
      unique: true, 
      sparse: true,
      lowercase: true, 
      trim: true 
    },
    mobile: { 
      type: String, 
      required: false, 
      unique: true, 
      sparse: true,
      trim: true 
    },
    alternateMobile: { type: String, trim: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    profileImage: { type: String },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    role: { type: String, enum: ["OWNER"], default: "OWNER" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    profileCompleted: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    lastLoginIP: { type: String },
    lastLoginDevice: { type: String },
    lastLoginBrowser: { type: String },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: Date },
    lastLogin: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetTokenExpires;
        return ret;
      }
    }
  }
);



export const Owner = model<IOwner>("Owner", OwnerSchema);
export default Owner;
