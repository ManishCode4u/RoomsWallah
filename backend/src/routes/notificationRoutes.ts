import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  clearAllNotifications
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Apply protection to all notification routes
router.use(protect);

router.route("/")
  .get(getNotifications)
  .delete(clearAllNotifications);

router.route("/:id/read")
  .patch(markAsRead);

export default router;
