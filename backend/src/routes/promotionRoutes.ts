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
const SLOTS_FILE = path.join(process.cwd(), "uploads", "slots.json");

const getSlotsFromFile = () => {
  try {
    if (fs.existsSync(SLOTS_FILE)) {
      return JSON.parse(fs.readFileSync(SLOTS_FILE, "utf-8"));
    }
  } catch (e) {}
  return [];
};

const saveSlotsToFile = (slots: any) => {
  try {
    fs.writeFileSync(SLOTS_FILE, JSON.stringify(slots, null, 2));
  } catch (e) {}
};

router.route("/slots")
  .get((req, res) => {
    res.json(getSlotsFromFile());
  })
  .post(protectAdmin, (req, res) => {
    saveSlotsToFile(req.body);
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
