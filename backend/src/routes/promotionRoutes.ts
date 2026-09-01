import { Router } from "express";
import fs from "fs";
import path from "path";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  updatePromotionStatus,
  deletePromotion
} from "../controllers/promotionController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = Router();
import { getActiveBoostSlots, saveRawSlots, readRawSlots } from "../utils/boostManager.js";

router.route("/slots")
  .get(async (req, res) => {
    const activeSlots = await getActiveBoostSlots();
    res.json(activeSlots);
  })
  .post(protectAdmin, (req, res) => {
    saveRawSlots(req.body);
    res.json({ success: true });
  });

router.route("/")
  .get(getPromotions)
  .post(protectAdmin, createPromotion);

router.route("/:id/status")
  .patch(protectAdmin, updatePromotionStatus);

router.route("/:id")
  .put(protectAdmin, updatePromotion)
  .delete(protectAdmin, deletePromotion);

export default router;
