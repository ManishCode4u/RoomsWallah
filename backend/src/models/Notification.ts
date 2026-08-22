import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  owner: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Index for query optimization by owner and read status
NotificationSchema.index({ owner: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", NotificationSchema);
export default Notification;
