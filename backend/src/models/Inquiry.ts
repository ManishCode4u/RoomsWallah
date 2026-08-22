import { Schema, model, Document } from "mongoose";

export interface IInquiry extends Document {
  listingId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  name: string;
  phone: string;
  type: "call" | "whatsapp" | "book";
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    name: { type: String, default: "Guest User" },
    phone: { type: String, default: "Not Provided" },
    type: { type: String, enum: ["call", "whatsapp", "book"], required: true }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

export const Inquiry = model<IInquiry>("Inquiry", InquirySchema);
export default Inquiry;
