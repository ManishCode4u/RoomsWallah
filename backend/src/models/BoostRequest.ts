import { Schema, model, Document } from "mongoose";

export interface IBoostRequest extends Document {
  listing: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
  plan: string;
  amount: number;
  screenshot: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}

const BoostRequestSchema = new Schema<IBoostRequest>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    plan: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    screenshot: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ["Pending", "Approved", "Rejected"], 
      default: "Pending" 
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for efficient querying
BoostRequestSchema.index({ owner: 1 });
BoostRequestSchema.index({ status: 1 });
BoostRequestSchema.index({ listing: 1 });

export const BoostRequest = model<IBoostRequest>("BoostRequest", BoostRequestSchema);
export default BoostRequest;
