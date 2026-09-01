import { Router } from "express";
import {
  getAdminStats,
  getAdminOwners,
  updateOwnerStatus,
  deleteOwnerByAdmin,
  getAdminListings,
  updateListingStatusByAdmin,
  deleteListingByAdmin,
  createListingByAdmin,
  updateListingByAdmin,
  getGuide,
  updateGuide,
  getAdminBoostRequests,
  verifyBoostRequest,
  deleteBoostRequest,
  sendNotificationFromAdmin,
  adminLogin,
  adminLogout,
  getAdminMe,
  getAdminReports,
  deleteReportByAdmin
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public Admin Authentication & Guide Routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.get("/guide", getGuide);

// Authenticated Admin Route verification middleware
router.use(protectAdmin);

router.get("/me", getAdminMe);

router.route("/stats")
  .get(getAdminStats);

router.route("/owners")
  .get(getAdminOwners);

router.route("/owners/:id/status")
  .patch(updateOwnerStatus);

router.route("/owners/:id")
  .delete(deleteOwnerByAdmin);

router.route("/listings")
  .get(getAdminListings)
  .post(createListingByAdmin);

router.route("/listings/:id/status")
  .patch(updateListingStatusByAdmin);

router.route("/listings/:id")
  .put(updateListingByAdmin)
  .delete(deleteListingByAdmin);

router.route("/guide")
  .post(updateGuide);

// Boost requests admin review routes
router.route("/boost-requests")
  .get(getAdminBoostRequests);

router.route("/boost-requests/:id/verify")
  .patch(verifyBoostRequest);

router.route("/boost-requests/:id")
  .delete(deleteBoostRequest);

router.route("/notifications")
  .post(sendNotificationFromAdmin);

router.route("/reports")
  .get(getAdminReports);

router.route("/reports/:id")
  .delete(deleteReportByAdmin);

export default router;
