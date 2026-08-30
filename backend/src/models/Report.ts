import { Schema, model, Document } from "mongoose";

export interface IReport extends Document {
  listingId: Schema.Types.ObjectId;
  listingTitle: string;
  ownerName: string;
  reason: "Fake Listing" | "Wrong Information" | "Duplicate Listing" | "Spam";
  message?: string;
  status: "Pending" | "Ignored" | "Resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    listingTitle: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    reason: { 
      type: String, 
      enum: ["Fake Listing", "Wrong Information", "Duplicate Listing", "Spam"], 
      required: true 
    },
    message: { type: String, trim: true },
    status: { 
      type: String, 
      enum: ["Pending", "Ignored", "Resolved"], 
      default: "Pending" 
    }
  },
  {
    timestamps: true
  }
);

// Map _id to virtual id for frontend compatibility
ReportSchema.virtual("id").get(function(this: IReport) {
  return this._id.toHexString();
});

ReportSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Report = model<IReport>("Report", ReportSchema);
export default Report;
