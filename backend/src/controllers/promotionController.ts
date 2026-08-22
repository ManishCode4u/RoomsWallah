import { Request, Response } from "express";
import Promotion from "../models/Promotion.js";

// @desc    Get all active promotions for website / all for admin
// @route   GET /api/promotions
// @access  Public
export const getPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;
    const filter: any = includeInactive === "true" ? {} : { status: "active" };

    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({
      message: "Server Error fetching promotions",
      error: (error as Error).message
    });
  }
};

// @desc    Create new promotional banner (Admin)
// @route   POST /api/promotions
// @access  Public / Admin
export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subtitle, badge, buttonText, buttonLink, gradientFrom, gradientTo, icon, image } = req.body;

    if (!title || !subtitle) {
      res.status(400).json({ message: "Title and Subtitle are required" });
      return;
    }

    const newPromotion = new Promotion({
      title,
      subtitle,
      badge: badge || "NEW",
      buttonText: buttonText || "Explore Now",
      buttonLink: buttonLink || "/welcome",
      gradientFrom: gradientFrom || "#6C4CF1",
      gradientTo: gradientTo || "#8E75FF",
      icon: icon || "Sparkles",
      image: image || "",
      status: "active"
    });

    const saved = await newPromotion.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({
      message: "Server Error creating promotion",
      error: (error as Error).message
    });
  }
};

// @desc    Update existing promotion
// @route   PUT /api/promotions/:id
// @access  Public / Admin
export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      res.status(404).json({ message: "Promotion not found" });
      return;
    }

    Object.assign(promotion, req.body);
    const updated = await promotion.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Server Error updating promotion",
      error: (error as Error).message
    });
  }
};

// @desc    Toggle status of promotion (active/inactive)
// @route   PATCH /api/promotions/:id/status
// @access  Public / Admin
export const updatePromotionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      res.status(404).json({ message: "Promotion not found" });
      return;
    }

    promotion.status = status;
    await promotion.save();
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({
      message: "Server Error updating promotion status",
      error: (error as Error).message
    });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Public / Admin
export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Promotion deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server Error deleting promotion",
      error: (error as Error).message
    });
  }
};
