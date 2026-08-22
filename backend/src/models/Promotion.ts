import { Schema, model, Document } from "mongoose";

export interface IPromotion extends Document {
  title: string;
  subtitle: string;
  badge?: string;
  buttonText: string;
  buttonLink: string;
  gradientFrom?: string;
  gradientTo?: string;
  icon?: string;
  image?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    badge: { type: String, default: "NEW", trim: true },
    buttonText: { type: String, required: true, default: "Explore Now", trim: true },
    buttonLink: { type: String, required: true, default: "/welcome", trim: true },
    gradientFrom: { type: String, default: "#6C4CF1" },
    gradientTo: { type: String, default: "#8E75FF" },
    icon: { type: String, default: "Sparkles" },
    image: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  {
    timestamps: true
  }
);

export const Promotion = model<IPromotion>("Promotion", PromotionSchema);
export default Promotion;
