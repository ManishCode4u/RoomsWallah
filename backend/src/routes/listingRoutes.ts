import { Router } from "express";
import { 
  getListings, 
  getListingById, 
  createListing, 
  updateListing,
  deleteListing,
  getMyListings,
  updateListingStatus,
  submitBoostRequest,
  getMyBoostRequests,
  createInquiry,
  getMyInquiries,
  reportListing
} from "../controllers/listingController.js";
import { protect, profileCompletedOnly } from "../middleware/authMiddleware.js";

const router = Router();

// Publicly searchable listings, create requires auth and complete profile
router.route("/")
  .get(getListings)
  .post(protect, profileCompletedOnly, createListing);

// Fetch owner's listing inquiries (Defined BEFORE parameterized :id routes to prevent clash)
router.route("/inquiries/my-inquiries")
  .get(protect, getMyInquiries);

// Fetch only currently authenticated owner's listings
router.route("/my-listings")
  .get(protect, getMyListings);

// Route for changing listing status (Activate / Deactivate)
router.route("/:id/status")
  .patch(protect, updateListingStatus);

// Host boost routes
router.route("/boost-requests/my-requests")
  .get(protect, getMyBoostRequests);

router.route("/:id/boost")
  .post(protect, submitBoostRequest);

// Register a new tenant inquiry for a listing (Publicly accessible)
router.route("/:id/inquiry")
  .post(createInquiry);

// Report a listing (Publicly accessible)
router.route("/:id/report")
  .post(reportListing);

// Parameterized routes: public read, authenticated update and delete
router.route("/:id")
  .get(getListingById)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

export default router;
