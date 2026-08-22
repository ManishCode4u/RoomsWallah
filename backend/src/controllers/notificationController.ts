import { Request, Response } from "express";
import Notification from "../models/Notification.js";

// @desc    Get all notifications for the authenticated owner
// @route   GET /api/notifications
// @access  Private (Owner Only)
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const notifications = await Notification.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to top 50 recent notifications

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching notifications",
      error: (error as Error).message
    });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Owner Only)
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    // Verify ownership
    if (notification.owner.toString() !== user._id.toString()) {
      res.status(403).json({ message: "Not authorized to modify this notification" });
      return;
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Server Error updating notification status",
      error: (error as Error).message
    });
  }
};

// @desc    Clear all notifications for the authenticated owner
// @route   DELETE /api/notifications
// @access  Private (Owner Only)
export const clearAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    await Notification.deleteMany({ owner: user._id });

    res.status(200).json({ success: true, message: "All notifications cleared successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Server Error clearing notifications",
      error: (error as Error).message
    });
  }
};
