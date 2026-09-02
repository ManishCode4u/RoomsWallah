"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, 
  Plus, 
  UserRound, 
  LayoutDashboard,
  Rocket,
  CalendarDays,
  MessageCircle,
  Settings,
  CircleHelp,
  LogOut,
  Bell, 
  ChevronDown, 
  Eye, 
  CheckCircle2, 
  MoreVertical, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Clock, 
  Sparkles,
  Menu,
  Phone,
  Mail,
  Camera,
  MapPin,
  ShieldCheck,
  House,
  Calendar,
  ExternalLink,
  Download,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  TrendingUp,
  ArrowUpDown,
  Share2,
  Filter,
  User,
  MessageSquare,
  FileText,
  Info
} from "lucide-react";
import { getApiUrl, getImageUrl } from "@/data/api";

interface Listing {
  id: string;
  title: string;
  location: string;
  sharing: string;
  rent: number;
  deposit?: number;
  description?: string;
  facilities: string[];
  furniture?: string[];
  status: "Active" | "Inactive";
  date: string;
  image: string;
  type?: "room" | "pg" | "hostel" | "flat";
  bhk?: string;
  views?: number;
  inquiries?: number;
  isBoosted?: boolean;
  boostExpiresAt?: string;
  boostPlan?: string;
  foodOption?: string;
  preferredTenant?: string;
  houseRules?: string;
}

interface CustomerLead {
  id: string;
  propertyTitle: string;
  userName?: string;
  phone?: string;
  type: "whatsapp" | "call" | "booking";
  date: string;
  time: string;
}

interface BoostHistoryRecord {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  plan: string;
  amount: number;
  startDate: string;
  expiryDate: string;
  status: "Active" | "Expired";
}

export default function OwnerDashboard() {
  const router = useRouter();

  // Owner-authenticated API fetch helper
  const ownerFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("owner_token") || "" : "";
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };
    return fetch(url, { ...options, credentials: "include", headers });
  };

  // Screen and tab navigation states
  const [activeNav, setActiveNav] = useState<"profile" | "dashboard" | "listings" | "boost" | "bookings" | "settings" | "help">("profile");
  const [dashboardTab, setDashboardTab] = useState<"Listing" | "Overview" | "Inquiry">("Listing");
  const [activeScreen, setActiveScreen] = useState<"dashboard" | "listings" | "step1" | "step2" | "step3" | "step4" | "step5" | "profile" | "bookings" | "help">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // My Listings Filter & View States
  const [listingSearchQuery, setListingSearchQuery] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<"all" | "room" | "pg" | "flat" | "hostel">("all");
  const [listingStatusFilter, setListingStatusFilter] = useState<"all" | "active" | "inactive" | "boosted">("all");
  const [listingViewMode, setListingViewMode] = useState<"grid" | "table">("grid");
  const [listingSortBy, setListingSortBy] = useState<"newest" | "price_asc" | "price_desc" | "views">("newest");

  // Bookings & Boost History States
  const [bookingTab, setBookingTab] = useState<"leads" | "boost_history">("leads");
  const [bookingLeadSearch, setBookingLeadSearch] = useState("");

  // Time & Greeting state
  const [currentTimeStr, setCurrentTimeStr] = useState("02:45 PM");
  const [currentDateStr, setCurrentDateStr] = useState("Friday, 23 May 2025");
  const [dynamicGreeting, setDynamicGreeting] = useState({ text: "Good Afternoon", emoji: "👋" });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours();
      
      if (hrs >= 5 && hrs < 12) {
        setDynamicGreeting({ text: "Good Morning", emoji: "🖐" });
      } else if (hrs >= 12 && hrs < 17) {
        setDynamicGreeting({ text: "Good Afternoon", emoji: "🖐" });
      } else if (hrs >= 17 && hrs < 21) {
        setDynamicGreeting({ text: "Good Evening", emoji: "🖐" });
      } else {
        setDynamicGreeting({ text: "Good Night", emoji: "🖐" });
      }

      setCurrentTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
      setCurrentDateStr(now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Notifications states (Persisted in localStorage permanently until explicitly dismissed by owner)
  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("checkrooms_owner_notifications");
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  // Automatically sync notifications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("checkrooms_owner_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Profile data (fetched dynamically from backend / localStorage)
  const [profileName, setProfileName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("owner_name") || localStorage.getItem("checkrooms_user_name") || "";
    }
    return "";
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("owner_email") || "";
    }
    return "";
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("owner_phone") || localStorage.getItem("checkrooms_user_phone") || "";
    }
    return "";
  });
  const [profileWhatsApp, setProfileWhatsApp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("owner_whatsapp") || localStorage.getItem("owner_phone") || "";
    }
    return "";
  });
  const [profileAvatar, setProfileAvatar] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("owner_avatar") || "";
    }
    return "";
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Inquiries & Leads List (Loaded from real database /api/listings/inquiries/my-inquiries)
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  // Boost Modal State
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [boostingListing, setBoostingListing] = useState<Listing | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("basic");
  const [checkoutStep, setCheckoutStep] = useState<"select_listing" | "plans" | "payment" | "success">("select_listing");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [receiptFile, setReceiptFile] = useState<{ name: string; size: string; url: string } | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isSubmittingBoost, setIsSubmittingBoost] = useState(false);

  // Help & Support Contact Admin state
  const [helpSubject, setHelpSubject] = useState("General Help & Query");
  const [helpMessage, setHelpMessage] = useState("");
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [helpSubmittedSuccess, setHelpSubmittedSuccess] = useState(false);
  const [helpAccordionOpen, setHelpAccordionOpen] = useState(true);

  // Delete Account Modal state
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Open Boost modal with optional pre-selected listing - always starts on select_listing
  const openBoostModalForListing = (listing?: Listing) => {
    if (listing) {
      setBoostingListing(listing);
    } else {
      const firstAvailable = listings.find(l => !l.isBoosted && (!l.views || l.views <= 350)) || listings[0];
      setBoostingListing(firstAvailable || null);
    }
    setCheckoutStep("select_listing");
    setScreenshotUrl("");
    setReceiptFile(null);
    setReceiptError(null);
    setShowBoostModal(true);
  };

  // Customer Leads State (Loaded from real DB inquiries)
  const [customerLeads, setCustomerLeads] = useState<CustomerLead[]>([]);

  // Boost Purchase History State & Handlers (Loaded from real DB boost requests)
  const [boostHistory, setBoostHistory] = useState<BoostHistoryRecord[]>([]);

  const handleDeleteCustomerLead = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer lead?")) return;
    setCustomerLeads((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("checkrooms_customer_leads", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Listing creation form state
  const [propertyType, setPropertyType] = useState<"room" | "pg" | "hostel" | "flat">("flat");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Noida");
  const [pincode, setPincode] = useState("");
  const [roomType, setRoomType] = useState("1 BHK Flat");
  const [customRoomType, setCustomRoomType] = useState("");
  const [showCustomRoomTypeInput, setShowCustomRoomTypeInput] = useState(false);
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [foodOption, setFoodOption] = useState<"Yes" | "No" | "Optional">("Yes");
  const [preferredTenant, setPreferredTenant] = useState<"Boys Only" | "Girls Only" | "Family / Couple" | "Anyone">("Anyone");
  const [houseRules, setHouseRules] = useState("");

  // Facilities & Furniture states exactly matching reference design
  const defaultBaseFacilities = ["Wi-Fi", "AC", "Laundry", "Food", "TV", "Geyser", "Parking", "RO Water"];
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
  const [customFacilitiesList, setCustomFacilitiesList] = useState<string[]>([]);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [showAddFacilityInput, setShowAddFacilityInput] = useState(false);

  const defaultBaseFurniture = ["Bed", "Study Table", "Chair", "Mattress (Gadda)", "Almirah / Wardrobe"];
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>(["Bed", "Study Table", "Chair"]);
  const [customFurnitureList, setCustomFurnitureList] = useState<string[]>([]);
  const [customFurnitureInput, setCustomFurnitureInput] = useState("");
  const [showAddFurnitureInput, setShowAddFurnitureInput] = useState(false);

  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  // Validation Error Tracker
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const clearFormError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      alert("Please type DELETE to confirm account deletion.");
      return;
    }
    setIsDeletingAccount(true);

    try {
      await ownerFetch(getApiUrl("/api/auth/delete-account"), {
        method: "DELETE"
      });
    } catch (e) {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("owner_logged_in");
      localStorage.removeItem("owner_token");
      localStorage.removeItem("owner_name");
      localStorage.removeItem("owner_phone");
      localStorage.removeItem("owner_email");
      localStorage.removeItem("owner_whatsapp");
      localStorage.removeItem("checkrooms_owner_token");
      localStorage.removeItem("checkrooms_user_name");
      localStorage.removeItem("checkrooms_user_phone");
      localStorage.removeItem("checkrooms_customer_leads");
      localStorage.removeItem("checkrooms_boost_history");
      localStorage.removeItem("checkrooms_properties");
    }

    setIsDeletingAccount(false);
    setShowDeleteAccountModal(false);
    alert("Your CheckRooms landlord account and all published listings have been permanently deleted.");
    router.push("/welcome");
  };

  // Load real owner data from database APIs
  const loadOwnerData = async () => {
    // 1. Fetch authenticated owner profile from /api/auth/me
    try {
      const meRes = await ownerFetch(getApiUrl("/api/auth/me"));
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.owner) {
          const o = meData.owner;
          if (o.fullName) {
            setProfileName(o.fullName);
            if (typeof window !== "undefined") localStorage.setItem("owner_name", o.fullName);
          }
          if (o.email) {
            setProfileEmail(o.email);
            if (typeof window !== "undefined") localStorage.setItem("owner_email", o.email);
          }
          if (o.mobile) {
            setProfilePhone(o.mobile);
            setProfileWhatsApp(o.mobile);
            if (typeof window !== "undefined") {
              localStorage.setItem("owner_phone", o.mobile);
              localStorage.setItem("owner_whatsapp", o.mobile);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error loading owner profile:", e);
    }

    // 2. Fetch logged-in owner's real listings from /api/listings/my-listings
    try {
      const res = await ownerFetch(getApiUrl("/api/listings/my-listings"));
      if (res.ok) {
        const apiListings = await res.json();
        if (Array.isArray(apiListings)) {
          const mapped: Listing[] = apiListings.map((p: any) => ({
            id: p._id || p.id,
            title: p.title,
            location: p.area ? `${p.area}, ${p.city || "Noida"}` : (p.location || p.city || "Noida"),
            sharing: p.sharing || "Single Room",
            rent: Number(p.rent) || 0,
            deposit: Number(p.deposit) || 0,
            description: p.description || "",
            facilities: p.amenities || p.facilities || [],
            furniture: p.furniture || [],
            foodOption: p.foodFacility || "Yes",
            preferredTenant: p.genderPreference || "Anyone",
            houseRules: p.rules || "",
            status: p.listingStatus === "active" ? "Active" : "Inactive",
            date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            image: p.image || p.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
            type: (p.type || "room").toLowerCase() as any,
            views: p.views || 0,
            inquiries: p.inquiries || 0
          }));
          setListings(mapped);
        }
      }
    } catch (err) {
      console.error("Error loading owner listings:", err);
    }

    // 3. Fetch real inquiries & leads from /api/listings/inquiries/my-inquiries
    try {
      const inqRes = await ownerFetch(getApiUrl("/api/listings/inquiries/my-inquiries"));
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        if (Array.isArray(inqData)) {
          const mappedInq = inqData.map((iq: any, idx: number) => {
            const colors = ["bg-[#4820B8]", "bg-[#1E2235]", "bg-[#7C4DFF]", "bg-[#162A45]", "bg-[#0D9488]"];
            const color = colors[idx % colors.length];
            const name = iq.name || "Guest User";
            const dateObj = iq.createdAt ? new Date(iq.createdAt) : new Date();
            const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
            return {
              id: iq._id || iq.id,
              name: name,
              property: iq.listingId?.title || "Rental Property",
              time: timeStr,
              avatarBg: color,
              initial: name.charAt(0).toUpperCase() || "G"
            };
          });
          setInquiriesList(mappedInq);

          const mappedLeads: CustomerLead[] = inqData.map((iq: any) => {
            const dateObj = iq.createdAt ? new Date(iq.createdAt) : new Date();
            const dateStr = dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
            return {
              id: iq._id || iq.id,
              propertyTitle: iq.listingId?.title || "Rental Property",
              userName: iq.name || "Guest User",
              phone: iq.phone && iq.phone !== "Not Provided" ? iq.phone : undefined,
              type: iq.type === "whatsapp" ? "whatsapp" : iq.type === "booking" ? "booking" : "call",
              date: dateStr,
              time: timeStr
            };
          });
          setCustomerLeads(mappedLeads);
        }
      }
    } catch (e) {
      console.error("Error loading inquiries:", e);
    }

    // 4. Fetch real boost requests from /api/listings/boost-requests/my-requests
    try {
      const bRes = await ownerFetch(getApiUrl("/api/listings/boost-requests/my-requests"));
      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData)) {
          const mappedBoost: BoostHistoryRecord[] = bData.map((b: any) => ({
            id: b._id || b.id,
            propertyId: b.listing?._id || b.listing?.id || "",
            propertyTitle: b.listing?.title || "Rental Property",
            propertyImage: b.listing?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
            plan: b.plan || "Standard Boost",
            amount: b.amount || 19,
            startDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "",
            expiryDate: b.expiresAt ? new Date(b.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "",
            status: b.status === "approved" || b.status === "Active" ? "Active" : "Expired"
          }));
          setBoostHistory(mappedBoost);
        }
      }
    } catch (e) {
      console.error("Error loading boost requests:", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isOwnerLoggedIn = localStorage.getItem("owner_logged_in") === "true";
      const ownerToken = localStorage.getItem("owner_token");
      if (!isOwnerLoggedIn && !ownerToken) {
        router.push("/welcome");
        return;
      }
    }
    loadOwnerData();
  }, [router]);

  // Upload handler for listing photos
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await ownerFetch(getApiUrl("/api/upload"), {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.imageUrl) {
            const fullUrl = data.imageUrl.startsWith("http") ? data.imageUrl : getApiUrl(data.imageUrl);
            setPhotos((prev) => [...prev, fullUrl]);
          }
        } else {
          alert("Image uploaded with fallback preview.");
          const previewUrl = URL.createObjectURL(file);
          setPhotos((prev) => [...prev, previewUrl]);
        }
      } catch (e) {
        const previewUrl = URL.createObjectURL(file);
        setPhotos((prev) => [...prev, previewUrl]);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Toggle listing status in real database
  const handleToggleStatus = async (id: string) => {
    const target = listings.find((l) => l.id === id);
    if (!target) return;
    const nextStatus = target.status === "Active" ? "Inactive" : "Active";

    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
    setOpenMenuId(null);

    try {
      await ownerFetch(getApiUrl(`/api/listings/${id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus === "Active" ? "active" : "hidden" })
      });
      window.dispatchEvent(new Event("checkroomsPropertiesUpdated"));
    } catch (e) {
      console.error("Error updating listing status:", e);
    }
  };

  // Delete listing from real database
  const handleDeleteListing = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      setListings((prev) => prev.filter((item) => item.id !== id));
      setOpenMenuId(null);

      try {
        await ownerFetch(getApiUrl(`/api/listings/${id}`), {
          method: "DELETE"
        });
        window.dispatchEvent(new Event("checkroomsPropertiesUpdated"));
      } catch (e) {
        console.error("Error deleting listing:", e);
      }
    }
  };

  // Reset form for new listing
  const resetForm = () => {
    setEditingListingId(null);
    setTitle("");
    setDescription("");
    setAddress("");
    setArea("");
    setCity("Noida");
    setPincode("");
    setPropertyType("flat");
    setRoomType("1 BHK Flat");
    setCustomRoomType("");
    setShowCustomRoomTypeInput(false);
    setRent("");
    setDeposit("");
    setFoodOption("Yes");
    setPreferredTenant("Anyone");
    setHouseRules("");
    setSelectedFacilities(["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
    setSelectedFurniture(["Bed", "Study Table", "Chair"]);
    setCustomFacilitiesList([]);
    setCustomFurnitureList([]);
    setCustomFacilityInput("");
    setCustomFurnitureInput("");
    setShowAddFacilityInput(false);
    setShowAddFurnitureInput(false);
    setPhotos([]);
    setFormErrors({});
  };

  // Check if owner profile is complete based on login method
  const getProfileCompletionStatus = () => {
    const loginMethod = typeof window !== "undefined" ? (localStorage.getItem("owner_login_method") || "") : "";
    const cleanPhone = (profilePhone || "").replace(/\D/g, "");
    const hasPhone = cleanPhone.length >= 10;
    const hasName = Boolean(profileName && profileName.trim().length > 0 && profileName.trim().toLowerCase() !== "landlord");
    const hasWhatsApp = Boolean(profileWhatsApp && profileWhatsApp.trim().replace(/\D/g, "").length >= 10);
    const hasEmail = Boolean(profileEmail && profileEmail.trim().includes("@"));

    // If owner logged in via Mobile Number, give 100% direct permission without any modal or block
    const isMobileLogin = loginMethod === "phone" || (!loginMethod && hasPhone && (!profileEmail || profileEmail.length === 0));

    if (isMobileLogin) {
      return { hasName: true, hasPhone: true, hasWhatsApp: true, hasEmail: true, isComplete: true, isMobileLogin: true };
    }

    // For Email ID / Google login users, check if contact details (Phone & Name) are filled
    const isComplete = Boolean(hasPhone && hasName);
    return { hasName, hasPhone, hasWhatsApp, hasEmail, isComplete, isMobileLogin: false };
  };

  // Start new listing creation (Mobile login directly permitted; Email login prompted if phone missing)
  const handleStartAddListing = () => {
    const status = getProfileCompletionStatus();
    if (!status.isComplete && !status.isMobileLogin) {
      setShowIncompleteProfileModal(true);
      return;
    }
    resetForm();
    setActiveScreen("step1");
  };

  // Edit existing listing
  const handleEditListing = (listing: Listing) => {
    setEditingListingId(listing.id);
    setTitle(listing.title);
    setDescription(listing.description || "");
    setAddress(listing.location);
    const parts = listing.location.split(",");
    setArea(parts[0]?.trim() || "");
    setCity(parts[1]?.trim() || "Noida");
    setRoomType(listing.sharing || "Single Room");
    setCustomRoomType("");
    setShowCustomRoomTypeInput(false);
    setRent(String(listing.rent));
    setDeposit(String(listing.deposit || listing.rent * 2));
    setPropertyType((listing.type as any) || "flat");
    setFoodOption((listing.foodOption as any) || "Yes");
    setPreferredTenant((listing.preferredTenant as any) || "Anyone");
    setHouseRules(listing.houseRules || "");
    setSelectedFacilities(listing.facilities && listing.facilities.length > 0 ? listing.facilities : ["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
    setSelectedFurniture(listing.furniture && listing.furniture.length > 0 ? listing.furniture : ["Bed", "Study Table", "Chair"]);
    setCustomFacilitiesList([]);
    setCustomFurnitureList([]);
    setPhotos(listing.image ? [listing.image] : []);
    setActiveScreen("step1");
  };

  // Submit Listing to MongoDB Backend
  const handleFinalSubmitListing = async () => {
    const finalImage = photos.length > 0 ? photos[0] : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80";
    const effectiveRoomType = customRoomType.trim() ? customRoomType.trim() : roomType;

    const payload = {
      title: title || `${effectiveRoomType} ${propertyType === "flat" ? "Flat" : propertyType.toUpperCase()}`,
      description: description || "Well-maintained accommodation with modern amenities.",
      rent: Number(rent) || 0,
      deposit: Number(deposit) || 0,
      type: propertyType,
      address: address || area,
      area: area || city,
      city: city,
      pincode: pincode || "201301",
      sharing: effectiveRoomType,
      amenities: [...selectedFacilities, ...selectedFurniture],
      tag: "Verified",
      furnishing: selectedFurniture.length >= 3 ? "Fully Furnished" : selectedFurniture.length > 0 ? "Semi-Furnished" : "Unfurnished",
      foodFacility: foodOption,
      rules: houseRules,
      genderPreference: preferredTenant,
      images: photos.length > 0 ? photos : [finalImage],
      image: finalImage
    };

    try {
      const url = editingListingId 
        ? getApiUrl(`/api/listings/${editingListingId}`)
        : getApiUrl("/api/listings");
      const method = editingListingId ? "PUT" : "POST";

      const res = await ownerFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingListingId ? "Listing updated successfully!" : "Listing published successfully! It will be verified within 1-2 hours.");
        await loadOwnerData();
        window.dispatchEvent(new Event("checkroomsPropertiesUpdated"));
      } else {
        const errData = await res.json();
        let errMsg = errData.message || "Failed to publish listing";
        if (errData.errors) {
          const keys = Object.keys(errData.errors).filter(k => k !== "_errors");
          if (keys.length > 0) {
            errMsg = `${keys[0]}: ${errData.errors[keys[0]]?._errors?.[0] || "Invalid"}`;
          }
        }
        alert(`Validation Error: ${errMsg}`);
        return;
      }
    } catch (e: any) {
      console.error("Failed to submit listing:", e);
      alert(`Error publishing listing: ${e.message || "Network issue"}`);
    }

    setActiveScreen("dashboard");
  };

  // Handle Logout (Completely wipe session & redirect)
  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out from CheckRooms Owner Dashboard?")) {
      try {
        await ownerFetch(getApiUrl("/api/auth/logout"), {
          method: "POST"
        });
      } catch (err) {}

      if (typeof window !== "undefined") {
        // Clear all owner session keys from localStorage
        localStorage.removeItem("owner_logged_in");
        localStorage.removeItem("owner_token");
        localStorage.removeItem("owner_name");
        localStorage.removeItem("owner_email");
        localStorage.removeItem("owner_phone");
        localStorage.removeItem("owner_whatsapp");
        localStorage.removeItem("owner_avatar");
        localStorage.removeItem("owner_login_method");
        localStorage.removeItem("checkrooms_owner_token");
        localStorage.removeItem("checkrooms_user_name");
        localStorage.removeItem("checkrooms_user_phone");
        localStorage.removeItem("checkrooms_owner_notifications");
        localStorage.removeItem("checkrooms_customer_leads");
        localStorage.removeItem("checkrooms_boost_history");
        localStorage.removeItem("checkrooms_properties");
      }

      // Reset component state completely
      setProfileName("");
      setProfileEmail("");
      setProfilePhone("");
      setProfileWhatsApp("");
      setProfileAvatar("");
      setListings([]);
      setInquiriesList([]);
      setCustomerLeads([]);
      setBoostHistory([]);
      setNotifications([]);

      router.push("/welcome");
    }
  };

  // Calculate dynamic stats
  const totalListingsCount = listings.length;
  const totalViewsCount = listings.reduce((acc, curr) => acc + (curr.views || 300), 0);
  const totalInquiriesCount = listings.reduce((acc, curr) => acc + (curr.inquiries || 20), 0);
  const totalBookingsCount = 24;

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex text-[#151538] select-none">
      
      {/* ========================================================================= */}
      {/* 1. LEFT FIXED SIDEBAR (DESKTOP) */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-[235px] bg-white border-r border-[#E8E8F0] fixed inset-y-0 left-0 z-30 justify-between p-4 overflow-y-auto no-scrollbar">
        
        {/* Top Section: Logo & Nav */}
        <div className="space-y-4 text-left">
          
          {/* Brand / Sidebar Header - Refined Balanced Size */}
          <Link href="/" className="flex items-center gap-2.5 px-1 pt-1 pb-2.5 group text-left shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white shadow-sm shadow-[#6C4CF1]/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Home className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="flex flex-col">
              <span className="inline-flex items-center font-poppins font-black text-xl tracking-tight select-none transform scale-y-[1.18] origin-left leading-none">
                <span className="text-[#1E2235]">Check</span>
                <span className="text-[#6C4CF1]">Rooms</span>
              </span>
              <span className="text-[9.5px] text-[#8C8CA1] font-medium tracking-tight mt-1">
                Simplifying Room Hunting
              </span>
            </div>
          </Link>

          {/* Navigation Items (Exact Order as specified) */}
          <nav className="space-y-1">
            
            {/* 1. Owner Profile (Active Selected Item) */}
            <button
              onClick={() => { setActiveNav("profile"); setActiveScreen("dashboard"); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeNav === "profile" && activeScreen === "dashboard"
                  ? "bg-[#5B2BE0] text-white shadow-sm shadow-[#5B2BE0]/20"
                  : "text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0]"
              }`}
            >
              <UserRound className="w-4.5 h-4.5 stroke-[2]" />
              <span>Owner Profile</span>
            </button>

            {/* 2. Dashboard */}
            <button
              onClick={() => { setActiveNav("dashboard"); setActiveScreen("dashboard"); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeNav === "dashboard"
                  ? "bg-[#5B2BE0] text-white shadow-sm"
                  : "text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0]"
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 stroke-[2]" />
              <span>Dashboard</span>
            </button>

            {/* 3. My Listings */}
            <button
              onClick={() => { setActiveNav("listings"); setActiveScreen("listings"); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeNav === "listings" && activeScreen === "listings"
                  ? "bg-[#5B2BE0] text-white shadow-sm shadow-[#5B2BE0]/20"
                  : "text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0]"
              }`}
            >
              <House className="w-4.5 h-4.5 stroke-[2]" />
              <span>My Listings</span>
            </button>

            {/* 4. Boost Listing */}
            <button
              onClick={() => openBoostModalForListing()}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] transition-all duration-150 cursor-pointer"
            >
              <Rocket className="w-4.5 h-4.5 stroke-[2]" />
              <span>Boost Listing</span>
            </button>

            {/* 5. Bookings */}
            <button
              onClick={() => { setActiveNav("bookings"); setActiveScreen("bookings"); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeNav === "bookings" && activeScreen === "bookings"
                  ? "bg-[#5B2BE0] text-white shadow-sm shadow-[#5B2BE0]/20"
                  : "text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0]"
              }`}
            >
              <CalendarDays className="w-4.5 h-4.5 stroke-[2]" />
              <span>Bookings</span>
            </button>

            {/* 7. Profile Settings */}
            <button
              onClick={() => { setActiveNav("settings"); setActiveScreen("profile"); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeNav === "settings" && activeScreen === "profile"
                  ? "bg-[#5B2BE0] text-white shadow-sm shadow-[#5B2BE0]/20"
                  : "text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0]"
              }`}
            >
              <Settings className="w-4.5 h-4.5 stroke-[2]" />
              <span>Profile Settings</span>
            </button>

            {/* 8. Help & Support */}
            <button
              onClick={() => { setActiveNav("help"); setActiveScreen("help"); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeNav === "help" && activeScreen === "help"
                  ? "bg-[#5B2BE0] text-white shadow-sm shadow-[#5B2BE0]/20"
                  : "text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0]"
              }`}
            >
              <CircleHelp className="w-4.5 h-4.5 stroke-[2]" />
              <span>Help & Support</span>
            </button>

            {/* 9. Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#151538] hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5 stroke-[2]" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Sidebar Boost Card (High-Impact Supercharge Widget) */}
          <div className="bg-gradient-to-br from-[#F8F4FF] via-[#FAF6FF] to-[#FFF5ED] border border-[#E9DCFF] rounded-2xl p-3.5 relative overflow-hidden text-left shadow-xs group hover:border-[#FF7A00]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                🔥 3X FASTER
              </span>
              <div className="w-6 h-6 rounded-full bg-[#EFE7FF] flex items-center justify-center text-[#5B2BE0] group-hover:scale-110 transition-transform">
                <Rocket className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>

            <h4 className="font-manrope font-bold text-xs text-[#151538] mt-2">
              Boost Your Listing
            </h4>
            <p className="text-[10px] text-[#666680] mt-0.5 leading-snug">
              Get top placement & find verified tenants in days.
            </p>

            <button
              onClick={() => openBoostModalForListing()}
              className="w-full bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-[10.5px] font-manrope font-extrabold py-2 px-3 rounded-full uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer mt-3 flex items-center justify-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>BOOST LISTING</span>
            </button>
          </div>

          {/* Sidebar "Your Listings" Preview */}
          <div className="space-y-2.5 pt-1">
            <h5 className="font-manrope font-bold text-xs text-[#151538] px-0.5">
              Your Listings
            </h5>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
              {listings.slice(0, 4).map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-[#E8E8F0] cursor-pointer"
                  onClick={() => router.push(`/${item.type === "flat" ? "flats" : item.type === "pg" ? "pg" : "rooms"}/${item.id}`)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#E8E8F0]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        item.status === "Active" 
                          ? "bg-[#EAF8EF] text-[#16A34A]" 
                          : "bg-[#F1F1F5] text-[#717182]"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="font-manrope font-bold text-[11px] text-[#151538] truncate mt-0.5">
                      {item.title}
                    </p>
                    <p className="text-[9.5px] text-[#666680] truncate">
                      {item.location}
                    </p>
                    <p className="text-[10px] font-extrabold text-[#151538] mt-0.5">
                      ₹{item.rent.toLocaleString()} <span className="text-[8.5px] font-normal text-[#8C8CA1]">/month</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Action: + Add New Listing Button */}
        <div className="pt-3">
          <button
            onClick={handleStartAddListing}
            className="w-full bg-white hover:bg-[#F3EEFF] border border-[#5B2BE0] text-[#5B2BE0] text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Listing</span>
          </button>
        </div>
      </aside>


      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT WRAPPER */}
      {/* ========================================================================= */}
      <div className="flex-1 ml-0 lg:ml-[235px] flex flex-col min-h-screen bg-[#FFFFFF]">
        
        {/* MAIN TOP HEADER BAR */}
        <header className="h-20 bg-white border-b border-[#E8E8F0] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 select-none">
          
          {/* Mobile Hamburger & Logo (Visible only on mobile) */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#151538] hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2 group text-left shrink-0">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white shadow-md shadow-[#6C4CF1]/20 shrink-0">
                <Home className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <span className="inline-flex items-center font-poppins font-black text-lg tracking-tight select-none transform scale-y-[1.18] origin-left">
                <span className="text-[#1E2235]">Check</span>
                <span className="text-[#6C4CF1]">Rooms</span>
              </span>
            </Link>
          </div>

          {/* Desktop spacer on left */}
          <div className="hidden lg:block"></div>

          {/* Right Area: Notification Bell & Profile Avatar */}
          <div className="flex items-center gap-5">
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer focus:outline-none"
              >
                <Bell className="w-5 h-5 text-[#151538] stroke-[1.8]" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#EF4444] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotificationsDropdown && (
                <>
                  {/* Backdrop to close when clicking/touching anywhere outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent" 
                    onClick={() => setShowNotificationsDropdown(false)} 
                  />
                  <div className="fixed left-3 right-3 top-16 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white border border-[#E8E8F0] rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3 max-h-[80vh] sm:max-h-96 flex flex-col">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-manrope font-bold text-xs text-[#151538]">Notifications</span>
                        <span className="bg-[#EFE7FF] text-[#5B2BE0] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {notifications.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {notifications.some(n => !n.read) && (
                          <button 
                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                            className="text-[10px] font-bold text-[#5B2BE0] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => setNotifications([])}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 pr-0.5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 space-y-1.5">
                          <Bell className="w-7 h-7 mx-auto text-slate-300 stroke-[1.5]" />
                          <p className="text-xs font-semibold text-slate-600">No notifications</p>
                          <p className="text-[10.5px] text-slate-400">All notifications have been cleared.</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))}
                            className={`p-2.5 rounded-xl text-xs space-y-1 transition-all group relative cursor-pointer ${
                              n.read ? "bg-slate-50 opacity-80 hover:opacity-100" : "bg-[#F7F4FF] border border-[#E9E0FD]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-slate-800 leading-tight pr-2">{n.message}</p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B2BE0] shrink-0" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteNotification(n.id, e)}
                                  className="w-5 h-5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete notification"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 block">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Owner Profile Block */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-all select-none"
              >
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={profileName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E8E8F0] shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B2BE0] to-[#8C52FF] text-white font-black text-sm flex items-center justify-center shadow-xs border border-[#E8DCFE] shrink-0">
                    {profileName.trim().charAt(0).toUpperCase() || "O"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-manrope font-bold text-xs text-[#151538] leading-tight">
                    {profileName}
                  </span>
                  <span className="text-[11px] text-[#666680] font-medium">
                    Owner
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#666680] hidden sm:block stroke-[2]" />
              </div>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <>
                  {/* Backdrop to close when clicking/touching anywhere outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent" 
                    onClick={() => setShowProfileDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8E8F0] rounded-2xl shadow-xl p-2 z-50 text-left space-y-1">
                    <button
                      onClick={() => { setActiveScreen("profile"); setShowProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => { router.push("/"); setShowProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Public Site</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>


        {/* MAIN BODY AREA */}
        <main className="p-3.5 sm:p-6 lg:p-8 max-w-[1240px] w-full mx-auto space-y-5 sm:space-y-6">
          
          {/* ========================================================================= */}
          {/* SCREEN: DASHBOARD (MAIN VIEW) */}
          {/* ========================================================================= */}
          {activeScreen === "dashboard" && (
            <>
              {/* 1. WELCOME HERO BANNER (Responsive: Compact single-row on mobile & spacious on desktop) */}
              <div className="bg-gradient-to-r from-[#4820B8] via-[#431CA8] to-[#36128E] rounded-[20px] sm:rounded-[22px] p-4 sm:p-7 text-white relative overflow-hidden shadow-lg shadow-[#4820B8]/15 flex flex-row items-center justify-between min-h-0 sm:min-h-[180px] text-left">
                
                {/* Left Text & Live Time Pill */}
                <div className="space-y-1 sm:space-y-2 relative z-10 max-w-[65%] sm:max-w-xl">
                  <h1 className="font-manrope font-extrabold text-base sm:text-2xl lg:text-3xl text-white tracking-tight leading-tight whitespace-nowrap flex items-center gap-1.5 overflow-hidden text-ellipsis">
                    <span>{dynamicGreeting.text}, {profileName.split(" ")[0]}!</span>
                    <span className="shrink-0 text-lg sm:text-2xl">🖐</span>
                  </h1>
                  <p className="text-[11px] sm:text-sm text-purple-200 font-medium line-clamp-1 sm:line-clamp-none">
                    Here's what's happening with your properties today.
                  </p>

                  {/* Time / Date Info inside transparent outlined pill */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-[11px] font-medium text-white mt-2.5 sm:mt-4 w-fit shadow-xs">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-200 shrink-0" />
                    <span>{currentTimeStr}</span>
                    <span className="text-white/40">|</span>
                    <span className="truncate">{currentDateStr}</span>
                  </div>
                </div>

                {/* Right Side Illustration - compact & side-by-side on mobile */}
                <div className="relative shrink-0 select-none pointer-events-none self-center sm:self-end">
                  <svg className="w-24 h-20 sm:w-56 sm:h-40" viewBox="0 0 240 160" fill="none">
                    {/* Window background with stars */}
                    <rect x="130" y="10" width="70" height="70" rx="12" fill="#31107C" />
                    <circle cx="170" cy="35" r="14" fill="#F59E0B" opacity="0.9" />
                    <circle cx="150" cy="50" r="3" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="185" cy="25" r="2" fill="#FFFFFF" opacity="0.8" />
                    
                    {/* Floor lamp */}
                    <path d="M45 40 L58 65 L32 65 Z" fill="#FDE68A" />
                    <line x1="45" y1="65" x2="45" y2="140" stroke="#E2E8F0" strokeWidth="2.5" />
                    <ellipse cx="45" cy="140" rx="14" ry="4" fill="#E2E8F0" />
                    <rect x="35" y="105" width="20" height="28" rx="4" fill="#E9D5FF" />
                    <rect x="37" y="107" width="16" height="5" rx="2" fill="#7C4DFF" />
                    
                    {/* Sofa */}
                    <rect x="80" y="85" width="115" height="45" rx="10" fill="#5826D4" />
                    <rect x="75" y="105" width="125" height="25" rx="8" fill="#6C38E8" />
                    <rect x="70" y="95" width="14" height="35" rx="6" fill="#7C4DFF" />
                    <rect x="190" y="95" width="14" height="35" rx="6" fill="#7C4DFF" />
                    {/* Cushions */}
                    <rect x="90" y="92" width="22" height="22" rx="5" fill="#A855F7" />
                    <rect x="160" y="92" width="22" height="22" rx="5" fill="#F59E0B" />
                    
                    {/* Potted Plant on right */}
                    <path d="M215 110 Q218 85 228 80 Q222 100 215 110" fill="#10B981" />
                    <path d="M213 110 Q205 90 200 85 Q210 100 213 110" fill="#059669" />
                    <path d="M214 110 Q214 75 220 70 Q218 95 214 110" fill="#34D399" />
                    <rect x="207" y="110" width="14" height="20" rx="3" fill="#D97706" />
                  </svg>
                </div>
              </div>


              {/* 2. TAB NAVIGATION */}
              <div className="flex items-center border-b border-[#E8E8F0] bg-white text-left px-1">
                {(["Listing", "Overview", "Inquiry"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === "Inquiry") {
                        setActiveNav("bookings");
                        setActiveScreen("bookings");
                      } else {
                        setDashboardTab(tab);
                      }
                    }}
                    className={`flex-1 sm:flex-initial text-xs sm:text-sm font-bold pb-2.5 sm:pb-3 px-3 sm:px-10 text-center transition-all relative cursor-pointer ${
                      dashboardTab === tab 
                        ? "text-[#5B2BE0]" 
                        : "text-[#666680] hover:text-[#151538]"
                    }`}
                  >
                    <span>{tab === "Inquiry" ? "Bookings" : tab}</span>
                    {dashboardTab === tab && (
                      <span className="absolute bottom-0 left-2 right-2 sm:left-0 sm:right-0 h-0.5 bg-[#5B2BE0] rounded-full" />
                    )}
                  </button>
                ))}
              </div>


              {/* 3. PRO STATISTICS CARDS (2 Cards: Total Listings & Total Inquiries) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                
                {/* Card 1: Total Listings */}
                <div 
                  onClick={() => { setActiveNav("listings"); setActiveScreen("listings"); }}
                  className="bg-white border border-[#E8E8F0] hover:border-[#5B2BE0] hover:shadow-md rounded-[20px] p-4 sm:p-5.5 shadow-xs text-left flex items-start justify-between cursor-pointer transition-all duration-200 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#666680] group-hover:text-[#5B2BE0] truncate transition-colors">Total Listings</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="font-manrope font-black text-2xl sm:text-[28px] text-[#151538] leading-none my-1.5">
                      {totalListingsCount}
                    </h3>
                    <p className="text-[11px] text-[#8C8CA1] font-semibold truncate flex items-center gap-1">
                      <span>Active Properties</span>
                      <span className="text-[#5B2BE0] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#F3EEFF] text-[#5B2BE0] group-hover:bg-[#5B2BE0] group-hover:text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#5B2BE0]/20 ml-2 transition-all">
                    <House className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2]" />
                  </div>
                </div>

                {/* Card 2: Total Inquiries */}
                <div 
                  onClick={() => { setActiveNav("bookings"); setActiveScreen("bookings"); }}
                  className="bg-white border border-[#E8E8F0] hover:border-[#5B2BE0] hover:shadow-md rounded-[20px] p-4 sm:p-5.5 shadow-xs text-left flex items-start justify-between cursor-pointer transition-all duration-200 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#666680] group-hover:text-[#5B2BE0] truncate transition-colors">Total Inquiries</span>
                      <span className="bg-[#EAF8EF] text-[#16A34A] text-[9.5px] font-black px-1.5 py-0.2 rounded-md">Live</span>
                    </div>
                    <h3 className="font-manrope font-black text-2xl sm:text-[28px] text-[#151538] leading-none my-1.5">
                      {customerLeads.length > 0 ? customerLeads.length : totalInquiriesCount}
                    </h3>
                    <p className="text-[11px] text-[#8C8CA1] font-semibold truncate flex items-center gap-1">
                      <span>Total Bookings & Leads</span>
                      <span className="text-[#5B2BE0] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white flex items-center justify-center shrink-0 ml-2 transition-all">
                    <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2]" />
                  </div>
                </div>

              </div>


              {/* 3.5 CLEAN CENTERED "ADD NEW ROOM" CARD */}
              <div className="bg-gradient-to-br from-[#F0FDF4] via-[#F8FFF9] to-white border border-[#DCFCE7] hover:border-[#10B981]/50 rounded-[22px] p-5 sm:p-6 shadow-xs text-center flex flex-col items-center justify-center gap-3.5 transition-all duration-200">
                <div className="space-y-1 max-w-lg mx-auto">
                  <h3 className="font-manrope font-black text-base sm:text-lg text-[#151538] leading-tight">
                    Have a Vacant Room or Property?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555570] font-medium leading-relaxed">
                    List for free in 2 minutes & get direct tenant inquiries on WhatsApp.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartAddListing}
                  className="w-full sm:w-auto min-w-[220px] sm:min-w-[260px] bg-[#10B981] hover:bg-[#059669] text-white font-manrope font-black text-sm sm:text-[15px] py-3.5 sm:py-4 px-8 rounded-xl shadow-md shadow-[#10B981]/25 hover:shadow-lg hover:shadow-[#10B981]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>+ Add Room Listing</span>
                </button>
              </div>


              {/* 4. MAIN TWO-COLUMN SECTION (Left: Recent Inquiries, Right: Boost Your Listing) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* LEFT: Recent Inquiries (40% / 5 cols) - Connected to Bookings */}
                <div className="lg:col-span-5 bg-white border border-[#E8E8F0] rounded-[20px] p-4.5 sm:p-5 shadow-xs text-left flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F2F5]">
                      <div className="flex items-center gap-2">
                        <h3 className="font-manrope font-bold text-sm text-[#151538]">
                          Recent Inquiries
                        </h3>
                        <span className="bg-[#EAF8EF] text-[#16A34A] text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                          {customerLeads.length} Bookings
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setActiveNav("bookings"); setActiveScreen("bookings"); }}
                        className="text-xs font-bold text-[#5B2BE0] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <span>→</span>
                      </button>
                    </div>

                    {/* Inquiry Rows from actual customerLeads */}
                    {customerLeads.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <MessageSquare className="w-7 h-7 mx-auto mb-1.5 opacity-30 text-[#5B2BE0]" />
                        <p className="text-xs font-bold text-slate-600">No Inquiries Yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">When tenants contact you, they will appear here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F8F9FA] mt-1">
                        {customerLeads.slice(0, 4).map((inq) => (
                          <div 
                            key={inq.id} 
                            onClick={() => { setActiveNav("bookings"); setActiveScreen("bookings"); }}
                            className="py-2.5 sm:py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-xl px-1.5 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full ${
                                inq.type === "whatsapp" 
                                  ? "bg-[#25D366] text-white" 
                                  : inq.type === "call" 
                                  ? "bg-[#3B82F6] text-white" 
                                  : "bg-[#5B2BE0] text-white"
                              } flex items-center justify-center text-xs font-bold shrink-0 shadow-xs`}>
                                {inq.userName?.charAt(0).toUpperCase() || (inq.type === "whatsapp" ? "W" : inq.type === "call" ? "C" : "B")}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <h4 className="font-manrope font-bold text-xs text-[#151538] leading-tight truncate group-hover:text-[#5B2BE0] transition-colors">
                                  {inq.userName || "Guest User"}
                                </h4>
                                <p className="text-[10.5px] sm:text-[11px] text-[#666680] truncate">
                                  {inq.propertyTitle} {inq.phone ? `• ${inq.phone}` : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                              <span className="text-[10px] text-[#8C8CA1] font-medium">
                                {inq.time}
                              </span>
                              {inq.type === "whatsapp" && (
                                <span className="bg-[#25D366]/10 text-[#128C7E] text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  💬 WhatsApp
                                </span>
                              )}
                              {inq.type === "call" && (
                                <span className="bg-blue-50 text-blue-600 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  📞 Call
                                </span>
                              )}
                              {inq.type === "booking" && (
                                <span className="bg-[#EFE7FF] text-[#5B2BE0] text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  ✨ Booking
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Outlined Button */}
                  <button
                    type="button"
                    onClick={() => { setActiveNav("bookings"); setActiveScreen("bookings"); }}
                    className="w-full bg-white hover:bg-[#F3EEFF] border border-[#5B2BE0] text-[#5B2BE0] text-xs font-bold py-2.5 rounded-xl transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View All Bookings & Inquiries</span>
                    <span>→</span>
                  </button>
                </div>


                {/* RIGHT: Boost Your Listing Card (60% / 7 cols) - High-Impact Supercharge UI */}
                <div className="lg:col-span-7 bg-gradient-to-br from-[#FAF6FF] via-[#F4EBFD] to-[#FFF4EC] border border-[#E4D4FF] rounded-[22px] p-4.5 sm:p-7 shadow-[0_4px_24px_rgba(91,43,224,0.06)] text-left relative overflow-hidden flex flex-col justify-between group">
                  
                  {/* Subtle top background glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#FF7A00]/10 via-[#5B2BE0]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    {/* Header + Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <span>⚡ 3X MORE LEADS</span>
                        </span>
                        <span className="bg-[#EFE7FF] text-[#5B2BE0] border border-[#DDCBFF] text-[9.5px] font-bold px-2.5 py-0.5 rounded-full">
                          Featured
                        </span>
                      </div>
                    </div>

                    <h3 className="font-manrope font-black text-lg sm:text-xl text-[#151538] tracking-tight mt-2.5">
                      Boost Your Listing
                    </h3>

                    <p className="text-[11.5px] sm:text-xs text-[#555570] font-medium mt-1 max-w-sm leading-relaxed">
                      Rank <span className="text-[#5B2BE0] font-bold">#1 on search results</span> and get genuine student inquiries on WhatsApp 3x faster.
                    </p>

                    {/* Value Props Grid (2x2 on mobile & desktop) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-md">
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#151538] bg-white/80 backdrop-blur-xs px-2.5 py-2 rounded-xl border border-white/80 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>Top position in search results</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#151538] bg-white/80 backdrop-blur-xs px-2.5 py-2 rounded-xl border border-white/80 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>Featured badge on listing</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#151538] bg-white/80 backdrop-blur-xs px-2.5 py-2 rounded-xl border border-white/80 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>3X More views & inquiries</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#151538] bg-white/80 backdrop-blur-xs px-2.5 py-2 rounded-xl border border-white/80 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>Priority customer support</span>
                      </div>
                    </div>
                  </div>

                  {/* High-Fidelity 3D Rocket Artwork */}
                  <div className="hidden sm:block absolute right-4 bottom-3 select-none pointer-events-none group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-36 h-40" viewBox="0 0 140 160" fill="none">
                      {/* Sparkles / Stars */}
                      <circle cx="20" cy="30" r="2.5" fill="#FFB800" opacity="0.8" />
                      <circle cx="125" cy="45" r="2" fill="#7C4DFF" opacity="0.9" />
                      <circle cx="110" cy="15" r="3" fill="#FF7A00" opacity="0.8" />
                      
                      {/* Smoke Clouds */}
                      <ellipse cx="70" cy="145" rx="42" ry="14" fill="#EDE4FF" opacity="0.8" />
                      <ellipse cx="45" cy="140" rx="24" ry="11" fill="#E4D5FF" opacity="0.9" />
                      <ellipse cx="95" cy="140" rx="24" ry="11" fill="#E4D5FF" opacity="0.9" />
                      
                      {/* Rocket Booster Flames */}
                      <path d="M60 105 Q70 138 70 145 Q70 138 80 105 Z" fill="#FF5500" />
                      <path d="M64 105 Q70 128 70 132 Q70 128 76 105 Z" fill="#FFB800" />
                      
                      {/* Rocket Body */}
                      <path d="M70 15 C50 38 50 82 54 105 L86 105 C90 82 90 38 70 15 Z" fill="#FFFFFF" stroke="#5B2BE0" strokeWidth="2.5" />
                      <path d="M70 15 C60 30 58 55 58 72 L82 72 C82 55 80 30 70 15 Z" fill="url(#rocketGrad)" />
                      
                      {/* Porcelein Window */}
                      <circle cx="70" cy="80" r="8.5" fill="#F0E8FF" stroke="#5B2BE0" strokeWidth="2.2" />
                      <circle cx="68" cy="78" r="3" fill="#FFFFFF" opacity="0.8" />
                      
                      {/* Fins / Wings */}
                      <path d="M54 75 L32 102 L54 98 Z" fill="#7C4DFF" stroke="#5B2BE0" strokeWidth="2" />
                      <path d="M86 75 L108 102 L86 98 Z" fill="#7C4DFF" stroke="#5B2BE0" strokeWidth="2" />

                      <defs>
                        <linearGradient id="rocketGrad" x1="58" y1="15" x2="82" y2="72" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#6C4CF1" />
                          <stop offset="1" stopColor="#5B2BE0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Main CTA: Glowing Orange Pill Button (Full width on mobile, auto on desktop) */}
                  <div className="mt-5 sm:mt-6 relative z-10">
                    <button
                      onClick={() => openBoostModalForListing()}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-xs sm:text-[13px] font-manrope font-extrabold py-3.5 px-8 rounded-full uppercase tracking-wider transition-all duration-300 shadow-[0_8px_22px_rgba(255,107,0,0.35)] hover:shadow-[0_12px_28px_rgba(255,107,0,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-4 h-4 text-white" />
                      <span>BOOST LISTING</span>
                    </button>
                  </div>

                </div>

              </div>


              {/* 5. YOUR LISTINGS OVERVIEW (Dual Mode: Native Cards on Mobile, Full Table on Desktop) */}
              <div className="bg-white border border-[#E8E8F0] rounded-[20px] p-4 sm:p-6 shadow-xs text-left space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-1 sm:pb-2">
                  <h3 className="font-manrope font-bold text-sm sm:text-base text-[#151538]">
                    Your Listings Overview
                  </h3>
                  <button
                    onClick={handleStartAddListing}
                    className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-[11px] sm:text-xs font-bold py-2 px-3 sm:px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-[#5B2BE0]/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Add New Listing</span>
                  </button>
                </div>

                {/* DESKTOP TABLE (Hidden on Mobile) */}
                <div className="hidden md:block overflow-visible min-h-[160px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#F0F2F5] text-[#8C8CA1] font-semibold text-[11px]">
                        <th className="py-3 px-3">Property</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Rent</th>
                        <th className="py-3 px-3">Views</th>
                        <th className="py-3 px-3">Inquiries</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F9FA]">
                      {listings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <House className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#5B2BE0]" />
                            <p className="text-sm font-bold text-slate-700">No properties listed yet</p>
                            <p className="text-xs text-slate-400 mt-0.5">Click &quot;+ Add New Listing&quot; above to publish your first property</p>
                          </td>
                        </tr>
                      ) : (
                        listings.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                            
                            {/* Property Thumbnail & ID */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-[#E8E8F0] shrink-0"
                                />
                                <div>
                                  <h4 className="font-manrope font-bold text-xs text-[#151538] leading-tight">
                                    {item.title}
                                  </h4>
                                  <span className="text-[10px] text-[#8C8CA1] font-medium">
                                    ID: {item.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Type Badge */}
                            <td className="py-3.5 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                                item.type === "pg" 
                                  ? "bg-[#EFF6FF] text-[#3B82F6]" 
                                  : "bg-[#F3EEFF] text-[#5B2BE0]"
                              }`}>
                                {item.type || "Flat"}
                              </span>
                            </td>

                            {/* Location */}
                            <td className="py-3.5 px-3 font-medium text-[#666680]">
                              {item.location}
                            </td>

                            {/* Rent */}
                            <td className="py-3.5 px-3 font-extrabold text-[#151538]">
                              ₹{item.rent.toLocaleString()}
                            </td>

                            {/* Views */}
                            <td className="py-3.5 px-3 font-medium text-[#666680]">
                              {item.views || 0}
                            </td>

                            {/* Inquiries */}
                            <td className="py-3.5 px-3 font-medium text-[#666680]">
                              {item.inquiries || 0}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === "Active"
                                  ? "bg-[#EAF8EF] text-[#16A34A]"
                                  : "bg-[#F1F1F5] text-[#717182]"
                              }`}>
                                {item.status}
                              </span>
                            </td>

                            {/* Actions (Clean 3-Dot Dropdown Menu) */}
                            <td className="py-3.5 px-3 text-right relative">
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === `overview_${item.id}` ? null : `overview_${item.id}`);
                                  }}
                                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#8C8CA1] hover:text-[#151538] transition-colors cursor-pointer"
                                  title="Actions"
                                >
                                  <MoreVertical className="w-4.5 h-4.5" />
                                </button>

                                {openMenuId === `overview_${item.id}` && (
                                  <>
                                    {/* Backdrop */}
                                    <div 
                                      className="fixed inset-0 z-40 bg-transparent" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                      }} 
                                    />
                                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#E8E8F0] rounded-2xl shadow-xl p-1.5 z-50 text-left space-y-0.5 animate-fadeIn">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          router.push(`/${item.type === "flat" ? "flats" : item.type === "pg" ? "pg" : "rooms"}/${item.id}`);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Eye className="w-4 h-4 text-[#5B2BE0]" />
                                        <span>View Listing</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          handleEditListing(item);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-4 h-4 text-[#5B2BE0]" />
                                        <span>Edit Listing</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          openBoostModalForListing(item);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-[#FF7A00] hover:bg-orange-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Rocket className="w-4 h-4 text-[#FF7A00]" />
                                        <span>Boost Listing</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          handleToggleStatus(item.id);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <span className={`w-2 h-2 rounded-full ${item.status === "Active" ? "bg-amber-500" : "bg-emerald-500"}`} />
                                        <span>{item.status === "Active" ? "Deactivate" : "Activate"}</span>
                                      </button>
                                      <div className="border-t border-slate-100 my-1" />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          handleDeleteListing(item.id);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE LISTING CARDS (Optimized for Mobile Screens) */}
                <div className="block md:hidden space-y-3">
                  {listings.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <House className="w-7 h-7 mx-auto mb-1.5 opacity-30 text-[#5B2BE0]" />
                      <p className="text-xs font-bold text-slate-700">No properties listed yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;+ Add New Listing&quot; to publish</p>
                    </div>
                  ) : (
                    listings.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-[#E8E8F0] space-y-2.5 relative"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-[#E8E8F0] shrink-0"
                        />
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              item.status === "Active" 
                                ? "bg-[#EAF8EF] text-[#16A34A]" 
                                : "bg-[#F1F1F5] text-[#717182]"
                            }`}>
                              {item.status}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md capitalize ${
                              item.type === "pg" 
                                ? "bg-[#EFF6FF] text-[#3B82F6]" 
                                : "bg-[#F3EEFF] text-[#5B2BE0]"
                            }`}>
                              {item.type || "Flat"}
                            </span>
                          </div>

                          <h4 className="font-manrope font-bold text-xs text-[#151538] truncate mt-1">
                            {item.title}
                          </h4>
                          <p className="text-[10.5px] text-[#666680] truncate">
                            {item.location}
                          </p>
                          <p className="text-xs font-black text-[#151538] mt-0.5">
                            ₹{item.rent.toLocaleString()} <span className="text-[9.5px] font-normal text-[#8C8CA1]">/month</span>
                          </p>
                        </div>

                        {/* Mobile Actions 3-dot */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === `mob_${item.id}` ? null : `mob_${item.id}`);
                            }}
                            className="w-8 h-8 rounded-lg bg-white border border-[#E8E8F0] text-[#666680] hover:text-[#151538] shadow-xs flex items-center justify-center cursor-pointer"
                            title="Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === `mob_${item.id}` && (
                            <>
                              <div 
                                className="fixed inset-0 z-40 bg-black/10" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }} 
                              />
                              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#E8E8F0] rounded-2xl shadow-2xl p-1.5 z-50 text-left space-y-0.5 animate-fadeIn">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    router.push(`/${item.type === "flat" ? "flats" : item.type === "pg" ? "pg" : "rooms"}/${item.id}`);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-[#5B2BE0]" />
                                  <span>View on Site</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleEditListing(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-[#5B2BE0]" />
                                  <span>Edit Listing</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    openBoostModalForListing(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-[#FF7A00] hover:bg-orange-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Rocket className="w-4 h-4 text-[#FF7A00]" />
                                  <span>Boost Listing</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleToggleStatus(item.id);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <span className={`w-2 h-2 rounded-full ${item.status === "Active" ? "bg-amber-500" : "bg-emerald-500"}`} />
                                  <span>{item.status === "Active" ? "Deactivate" : "Activate"}</span>
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleDeleteListing(item.id);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Clean footer in mobile card */}
                      <div className="flex items-center justify-between text-[10.5px] text-[#666680] font-medium pt-1.5 border-t border-[#E8E8F0]/70 px-0.5">
                        <span>Sharing: <b className="text-[#151538]">{item.sharing || "Single"}</b></span>
                        <span className="text-[#8C8CA1]">ID: {item.id}</span>
                      </div>
                    </div>
                  )))}
                </div>

                {/* Table Footer: View All Listings Button */}
                <div className="pt-2 text-center">
                  <button
                    onClick={() => { setActiveNav("listings"); setActiveScreen("listings"); }}
                    className="w-full sm:w-auto bg-white hover:bg-[#F3EEFF] border border-[#5B2BE0] text-[#5B2BE0] text-xs font-bold py-2.5 px-8 rounded-xl transition-all cursor-pointer inline-block"
                  >
                    View All Listings ({listings.length}) →
                  </button>
                </div>

              </div>

            </>
          )}




          {/* ========================================================================= */}
          {/* SCREEN: MY LISTINGS (DEDICATED OWNER PROPERTIES VIEW) */}
          {/* ========================================================================= */}
          {activeScreen === "listings" && (
            <div className="space-y-6 text-left">
              
              {/* 1. MY LISTINGS HERO / HEADER BAR */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E8E8F0] rounded-[22px] p-5 sm:p-7 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C8CA1] mb-1">
                    <button 
                      onClick={() => { setActiveNav("dashboard"); setActiveScreen("dashboard"); }}
                      className="hover:text-[#5B2BE0] cursor-pointer"
                    >
                      Dashboard
                    </button>
                    <span>/</span>
                    <span className="text-[#5B2BE0]">My Listings</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-manrope font-black text-2xl sm:text-3xl text-[#151538] tracking-tight">
                      My Properties & Listings
                    </h1>
                    <span className="bg-[#EFE7FF] text-[#5B2BE0] font-black text-xs px-2.5 py-1 rounded-full">
                      {listings.length} Total
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#666680] mt-1 max-w-xl font-medium">
                    Manage pricing, availability, boost placement, and track real-time tenant views across all your listed properties.
                  </p>
                </div>

                {/* Header CTA Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => openBoostModalForListing()}
                    className="bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-xs font-manrope font-extrabold py-3 px-5 rounded-full uppercase tracking-wider transition-all duration-200 shadow-[0_8px_20px_rgba(255,107,0,0.3)] hover:shadow-[0_12px_26px_rgba(255,107,0,0.4)] active:scale-98 cursor-pointer flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>BOOST A PROPERTY</span>
                  </button>

                  <button
                    onClick={handleStartAddListing}
                    className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-[#5B2BE0]/20 active:scale-98 cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Listing</span>
                  </button>
                </div>
              </div>


              {/* 2. MINI SUMMARY METRICS BAR */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-[#E8E8F0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#8C8CA1] uppercase tracking-wider">Total Properties</span>
                    <h4 className="font-manrope font-black text-2xl text-[#151538] mt-0.5">{listings.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#5B2BE0] flex items-center justify-center font-bold">
                    <House className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>

                <div className="bg-white border border-[#E8E8F0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#8C8CA1] uppercase tracking-wider">Active Online</span>
                    <h4 className="font-manrope font-black text-2xl text-[#16A34A] mt-0.5">
                      {listings.filter(l => l.status === "Active").length}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#EAF8EF] text-[#16A34A] flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-[#E8E8F0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#8C8CA1] uppercase tracking-wider">Boosted / Top #1</span>
                    <h4 className="font-manrope font-black text-2xl text-[#FF7A00] mt-0.5">
                      {listings.filter(l => l.isBoosted || (l.views && l.views > 350)).length}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4EC] text-[#FF7A00] flex items-center justify-center font-bold">
                    <Rocket className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-[#E8E8F0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#8C8CA1] uppercase tracking-wider">Total Inquiries</span>
                    <h4 className="font-manrope font-black text-2xl text-[#5B2BE0] mt-0.5">
                      {listings.reduce((acc, curr) => acc + (curr.inquiries || 15), 0)}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#F0F2F5] text-[#151538] flex items-center justify-center font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>


              {/* 3. TOOLBAR: SEARCH, CATEGORY TABS, STATUS FILTER, SORT & VIEW TOGGLE */}
              <div className="bg-white border border-[#E8E8F0] rounded-2xl p-4 shadow-xs space-y-3.5">
                
                {/* Search & Main Filter Controls Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#8C8CA1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by property title, area, locality or ID..."
                      value={listingSearchQuery}
                      onChange={(e) => setListingSearchQuery(e.target.value)}
                      className="w-full bg-[#F8F9FB] border border-[#E8E8F0] rounded-xl pl-9 pr-8 py-2.5 text-xs text-[#151538] placeholder:text-[#8C8CA1] focus:outline-none focus:border-[#5B2BE0] focus:bg-white transition-all font-medium"
                    />
                    {listingSearchQuery && (
                      <button 
                        onClick={() => setListingSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Right Controls: Status filter, Sort & View Mode Switcher */}
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                    
                    {/* Status Select */}
                    <select
                      value={listingStatusFilter}
                      onChange={(e) => setListingStatusFilter(e.target.value as any)}
                      className="bg-[#F8F9FB] border border-[#E8E8F0] text-[#151538] text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#5B2BE0] cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                      <option value="boosted">Boosted / Top #1</option>
                    </select>

                    {/* Sort Select */}
                    <select
                      value={listingSortBy}
                      onChange={(e) => setListingSortBy(e.target.value as any)}
                      className="bg-[#F8F9FB] border border-[#E8E8F0] text-[#151538] text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#5B2BE0] cursor-pointer"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="views">Most Views</option>
                    </select>

                    {/* Grid vs Table View Mode Switcher */}
                    <div className="flex items-center bg-[#F1F1F5] p-1 rounded-xl border border-[#E8E8F0] shrink-0">
                      <button
                        type="button"
                        onClick={() => setListingViewMode("grid")}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          listingViewMode === "grid" 
                            ? "bg-white text-[#5B2BE0] shadow-xs" 
                            : "text-[#8C8CA1] hover:text-[#151538]"
                        }`}
                        title="Grid View"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setListingViewMode("table")}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          listingViewMode === "table" 
                            ? "bg-white text-[#5B2BE0] shadow-xs" 
                            : "text-[#8C8CA1] hover:text-[#151538]"
                        }`}
                        title="Table View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Category Type Tabs Bar */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-[#F0F2F5]">
                  {[
                    { id: "all", label: "All Types", count: listings.length },
                    { id: "room", label: "Rooms", count: listings.filter(l => l.type === "room").length },
                    { id: "pg", label: "PGs", count: listings.filter(l => l.type === "pg").length },
                    { id: "flat", label: "Flats", count: listings.filter(l => l.type === "flat").length },
                    { id: "hostel", label: "Hostels", count: listings.filter(l => l.type === "hostel").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setListingTypeFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        listingTypeFilter === tab.id
                          ? "bg-[#5B2BE0] text-white shadow-xs shadow-[#5B2BE0]/20"
                          : "bg-[#F8F9FB] text-[#666680] hover:bg-[#F0EDFE] hover:text-[#5B2BE0] border border-[#E8E8F0]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        listingTypeFilter === tab.id ? "bg-white/20 text-white" : "bg-white text-[#666680]"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

              </div>


              {/* 4. LISTINGS DISPLAY: GRID VIEW OR TABLE VIEW */}
              {listings
                .filter((item) => {
                  if (listingSearchQuery.trim()) {
                    const q = listingSearchQuery.toLowerCase();
                    const matchTitle = item.title.toLowerCase().includes(q);
                    const matchLoc = item.location.toLowerCase().includes(q);
                    const matchId = item.id.toLowerCase().includes(q);
                    if (!matchTitle && !matchLoc && !matchId) return false;
                  }
                  if (listingTypeFilter !== "all" && item.type !== listingTypeFilter) return false;
                  if (listingStatusFilter === "active" && item.status !== "Active") return false;
                  if (listingStatusFilter === "inactive" && item.status !== "Inactive") return false;
                  if (listingStatusFilter === "boosted" && !item.isBoosted && (!item.views || item.views < 350)) return false;
                  return true;
                }).length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-[#E8E8F0] rounded-[22px] p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F3EEFF] text-[#5B2BE0] flex items-center justify-center mx-auto">
                    <Search className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-manrope font-bold text-lg text-[#151538]">No listings found</h3>
                    <p className="text-xs text-[#666680] mt-1 max-w-sm mx-auto">
                      {listingSearchQuery || listingTypeFilter !== "all" || listingStatusFilter !== "all"
                        ? "No properties match your current filter criteria. Try resetting filters."
                        : "You haven't added any listings yet. Start adding your first property!"}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {(listingSearchQuery || listingTypeFilter !== "all" || listingStatusFilter !== "all") && (
                      <button
                        onClick={() => { setListingSearchQuery(""); setListingTypeFilter("all"); setListingStatusFilter("all"); }}
                        className="px-4 py-2 bg-white border border-[#5B2BE0] text-[#5B2BE0] text-xs font-bold rounded-xl hover:bg-[#F3EEFF] cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                    <button
                      onClick={handleStartAddListing}
                      className="px-5 py-2 bg-[#5B2BE0] text-white text-xs font-bold rounded-xl hover:bg-[#4A20C0] shadow-md shadow-[#5B2BE0]/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Property</span>
                    </button>
                  </div>
                </div>
              ) : listingViewMode === "grid" ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listings
                    .filter((item) => {
                      if (listingSearchQuery.trim()) {
                        const q = listingSearchQuery.toLowerCase();
                        const matchTitle = item.title.toLowerCase().includes(q);
                        const matchLoc = item.location.toLowerCase().includes(q);
                        const matchId = item.id.toLowerCase().includes(q);
                        if (!matchTitle && !matchLoc && !matchId) return false;
                      }
                      if (listingTypeFilter !== "all" && item.type !== listingTypeFilter) return false;
                      if (listingStatusFilter === "active" && item.status !== "Active") return false;
                      if (listingStatusFilter === "inactive" && item.status !== "Inactive") return false;
                      if (listingStatusFilter === "boosted" && !item.isBoosted && (!item.views || item.views < 350)) return false;
                      return true;
                    })
                    .sort((a, b) => {
                      if (listingSortBy === "price_asc") return a.rent - b.rent;
                      if (listingSortBy === "price_desc") return b.rent - a.rent;
                      if (listingSortBy === "views") return (b.views || 0) - (a.views || 0);
                      return 0;
                    })
                    .map((item) => {
                      const isItemBoosted = item.isBoosted || (item.views && item.views > 350);
                      return (
                        <div 
                          key={item.id}
                          className="bg-white border border-[#E8E8F0] hover:border-[#5B2BE0]/50 rounded-[20px] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Image with badges */}
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                              {/* Top Badges */}
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${
                                  item.status === "Active" 
                                    ? "bg-[#16A34A]/90 text-white" 
                                    : "bg-slate-800/80 text-white/90"
                                }`}>
                                  {item.status}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {isItemBoosted && (
                                    <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                      <Rocket className="w-3 h-3" />
                                      <span>BOOSTED #1</span>
                                    </span>
                                  )}
                                  <span className="bg-white/90 backdrop-blur-md text-[#151538] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                                    {item.type}
                                  </span>
                                </div>
                              </div>

                              {/* Bottom info on image */}
                              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                                <span className="text-[11px] font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                                  {item.sharing || "Single / Private"}
                                </span>
                                <span className="text-[10px] font-bold text-white/90">ID: {item.id}</span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-manrope font-bold text-base text-[#151538] group-hover:text-[#5B2BE0] transition-colors line-clamp-1">
                                    {item.title}
                                  </h3>
                                </div>
                                <p className="text-xs text-[#666680] font-medium flex items-center gap-1.5 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#8C8CA1] shrink-0" />
                                  <span className="truncate">{item.location}</span>
                                </p>
                              </div>

                              {/* Facilities Pills */}
                              {item.facilities && item.facilities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {item.facilities.slice(0, 3).map((fac, idx) => (
                                    <span key={idx} className="bg-[#F5F2FC] text-[#5B2BE0] text-[10px] font-bold px-2 py-0.5 rounded-md">
                                      {fac}
                                    </span>
                                  ))}
                                  {item.facilities.length > 3 && (
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                      +{item.facilities.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Price Row (Views & Comments icons removed as requested) */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F5]">
                                <div>
                                  <span className="text-[10px] font-bold text-[#8C8CA1] uppercase tracking-wider block">Monthly Rent</span>
                                  <span className="font-manrope font-black text-xl text-[#151538]">
                                    ₹{item.rent.toLocaleString()}
                                    <span className="text-xs font-semibold text-[#8C8CA1]">/mo</span>
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#666680] bg-[#F8F9FB] border border-[#E8E8F0] px-2.5 py-1 rounded-lg">
                                  {item.sharing || "Single"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action Buttons Footer: Boost Button + 3-Dot Dropdown */}
                          <div className="p-3 bg-[#FAF8FE] border-t border-[#E8E8F0] flex items-center gap-2 relative">
                            <button
                              onClick={() => openBoostModalForListing(item)}
                              className="flex-1 bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-[11px] font-manrope font-extrabold py-2.5 px-4 rounded-full uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Rocket className="w-4 h-4" />
                              <span>BOOST LISTING</span>
                            </button>

                            {/* 3-Dot Dropdown Menu Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === `grid_${item.id}` ? null : `grid_${item.id}`);
                                }}
                                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-[#E8E8F0] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                title="More Options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openMenuId === `grid_${item.id}` && (
                                <>
                                  {/* Backdrop to close anywhere */}
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setOpenMenuId(null)} 
                                  />
                                  <div className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-[#E8E8F0] rounded-2xl shadow-2xl p-1.5 z-50 text-left space-y-0.5">
                                    <button
                                      onClick={() => { setOpenMenuId(null); handleEditListing(item); }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-[#5B2BE0]" />
                                      <span>Edit Listing</span>
                                    </button>

                                    <button
                                      onClick={() => { setOpenMenuId(null); handleToggleStatus(item.id); }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className={`w-2 h-2 rounded-full ${item.status === "Active" ? "bg-amber-500" : "bg-emerald-500"}`} />
                                      <span>{item.status === "Active" ? "Deactivate" : "Activate"}</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        router.push(`/${item.type === "flat" ? "flats" : item.type === "pg" ? "pg" : "rooms"}/${item.id}`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F3EEFF] hover:text-[#5B2BE0] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                      <span>View on Site</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-1" />

                                    <button
                                      onClick={() => { setOpenMenuId(null); handleDeleteListing(item.id); }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="bg-white border border-[#E8E8F0] rounded-[22px] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-[#E8E8F0] bg-[#F8F9FB] text-[11px] font-extrabold text-[#666680] uppercase tracking-wider">
                          <th className="py-3.5 px-4">Property</th>
                          <th className="py-3.5 px-4">Type & Sharing</th>
                          <th className="py-3.5 px-4">Location</th>
                          <th className="py-3.5 px-4">Rent</th>
                          <th className="py-3.5 px-4">Performance</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F2F5] text-xs">
                        {listings
                          .filter((item) => {
                            if (listingSearchQuery.trim()) {
                              const q = listingSearchQuery.toLowerCase();
                              const matchTitle = item.title.toLowerCase().includes(q);
                              const matchLoc = item.location.toLowerCase().includes(q);
                              const matchId = item.id.toLowerCase().includes(q);
                              if (!matchTitle && !matchLoc && !matchId) return false;
                            }
                            if (listingTypeFilter !== "all" && item.type !== listingTypeFilter) return false;
                            if (listingStatusFilter === "active" && item.status !== "Active") return false;
                            if (listingStatusFilter === "inactive" && item.status !== "Inactive") return false;
                            if (listingStatusFilter === "boosted" && !item.isBoosted && (!item.views || item.views < 350)) return false;
                            return true;
                          })
                          .sort((a, b) => {
                            if (listingSortBy === "price_asc") return a.rent - b.rent;
                            if (listingSortBy === "price_desc") return b.rent - a.rent;
                            if (listingSortBy === "views") return (b.views || 0) - (a.views || 0);
                            return 0;
                          })
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-12 h-12 rounded-xl object-cover border border-[#E8E8F0] shrink-0"
                                  />
                                  <div>
                                    <h4 className="font-manrope font-bold text-sm text-[#151538] group-hover:text-[#5B2BE0] transition-colors">
                                      {item.title}
                                    </h4>
                                    <span className="text-[10px] text-[#8C8CA1] font-semibold">ID: {item.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-[#151538] block uppercase text-[11px]">{item.type}</span>
                                <span className="text-[11px] text-[#666680]">{item.sharing || "Single"}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-slate-800 font-medium">{item.location}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-manrope font-black text-sm text-[#151538]">
                                  ₹{item.rent.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-[#8C8CA1] block">/month</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-[11px] text-[#666680] font-medium space-y-0.5">
                                  <div>Views: <b className="text-[#151538]">{item.views || 320}</b></div>
                                  <div>Inquiries: <b className="text-[#151538]">{item.inquiries || 18}</b></div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  item.status === "Active" 
                                    ? "bg-[#EAF8EF] text-[#16A34A]" 
                                    : "bg-[#F1F1F5] text-[#717182]"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openBoostModalForListing(item)}
                                    className="bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs cursor-pointer"
                                  >
                                    BOOST
                                  </button>
                                  <button
                                    onClick={() => handleEditListing(item)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-[#5B2BE0] cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(item.id)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer text-[10.5px] font-bold"
                                    title="Toggle Status"
                                  >
                                    {item.status === "Active" ? "Pause" : "Enable"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteListing(item.id)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}




          {/* ========================================================================= */}
          {/* SCREEN: CUSTOMER LEADS & BOOST PURCHASE HISTORY */}
          {/* ========================================================================= */}
          {activeScreen === "bookings" && (
            <div className="space-y-6 text-left max-w-4xl mx-auto">
              
              {/* 1. BOOKINGS & INQUIRIES CARD */}
              <div className="bg-white border border-[#E8E8F0] rounded-[24px] p-6 sm:p-8 shadow-xs text-left space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-manrope font-black text-2xl sm:text-3xl text-[#151538] tracking-tight">
                      Bookings & Inquiries
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#8C8CA1] font-medium">
                      Track tenant bookings, phone calls, and direct WhatsApp inquiries
                    </p>
                  </div>
                  <span className="bg-[#EAF8EF] text-[#16A34A] font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shrink-0">
                    {customerLeads.length} TOTAL
                  </span>
                </div>

                {/* List Items */}
                <div className="divide-y divide-[#F0F2F5] pt-1">
                  {customerLeads.map((lead) => (
                    <div key={lead.id} className="py-5 first:pt-2 last:pb-2 space-y-2">
                      
                      {/* Top Row: Property Title & Date/Time Stacked */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-manrope font-bold text-base sm:text-[17px] text-[#151538]">
                          {lead.propertyTitle}
                        </h3>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-500 block">{lead.date}</span>
                          <span className="text-[11px] font-medium text-slate-400 block">{lead.time}</span>
                        </div>
                      </div>

                      {/* Middle Row: User Icon + Name and Phone with Icon */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#151538]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#5B2BE0] fill-[#5B2BE0]" />
                          <span>{lead.userName || "Guest User"}</span>
                        </div>

                        {lead.phone && (
                          <a 
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1.5 text-slate-700 hover:text-[#5B2BE0] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>{lead.phone}</span>
                          </a>
                        )}
                      </div>

                      {/* Bottom Row: Type label & Badge */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs text-slate-400 font-medium">Type:</span>
                        
                        {lead.type === "whatsapp" && (
                          <span className="inline-flex items-center gap-1.5 bg-[#EAF8EF] text-[#16A34A] border border-[#A7F3D0]/60 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                            <MessageSquare className="w-3 h-3 text-[#16A34A]" />
                            <span>WHATSAPP</span>
                          </span>
                        )}

                        {lead.type === "call" && (
                          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                            <Phone className="w-3 h-3 text-[#2563EB]" />
                            <span>PHONE CALL</span>
                          </span>
                        )}

                        {lead.type === "booking" && (
                          <span className="inline-flex items-center gap-1.5 bg-[#FAF5FF] text-[#7C3AED] border border-[#E9D5FF]/60 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                            <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                            <span>BOOKING REQUEST</span>
                          </span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>


              {/* 2. BOOST PURCHASE HISTORY CARD */}
              <div className="bg-white border border-[#E8E8F0] rounded-[24px] p-6 sm:p-8 shadow-xs text-left space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-manrope font-black text-2xl sm:text-3xl text-[#151538] tracking-tight">
                      Boost Purchase History
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#8C8CA1] font-medium">
                      Track your listing promotions and VIP search rankings
                    </p>
                  </div>
                  <span className="bg-[#FFF7ED] text-[#FF7A00] font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shrink-0">
                    {boostHistory.length} TOTAL
                  </span>
                </div>

                {boostHistory.length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-xs text-[#8C8CA1]">No active or past boost purchases yet.</p>
                    <button
                      onClick={() => openBoostModalForListing()}
                      className="bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow-md shadow-orange-500/20"
                    >
                      Boost a Listing Now →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0F2F5] pt-1">
                    {boostHistory.map((item) => (
                      <div key={item.id} className="py-5 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.propertyImage}
                            alt={item.propertyTitle}
                            className="w-13 h-13 rounded-2xl object-cover border border-[#E8E8F0] shrink-0"
                          />
                          <div>
                            <h4 className="font-manrope font-bold text-sm text-[#151538]">{item.propertyTitle}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="bg-[#EFE7FF] text-[#5B2BE0] font-bold text-[10px] px-2 py-0.5 rounded-md">
                                ⚡ {item.plan}
                              </span>
                              <span className="text-xs font-black text-slate-800">₹{item.amount}</span>
                              <span className="text-[11px] text-slate-400">({item.startDate} — {item.expiryDate})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-center">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                            item.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-300/40" : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            ● {item.status === "Active" ? "Active Rank #1" : "Expired"}
                          </span>
                          <button
                            onClick={() => {
                              const matched = listings.find(l => l.id === item.propertyId) || listings[0];
                              openBoostModalForListing(matched);
                            }}
                            className="bg-white hover:bg-[#F3EEFF] border border-[#5B2BE0] text-[#5B2BE0] text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            <span>Boost Again</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>
          )}




          {/* ========================================================================= */}
          {/* SCREEN: STEP 1 TO 5 (ADD / EDIT LISTING WIZARD) */}
          {/* ========================================================================= */}
          {(activeScreen === "step1" || activeScreen === "step2" || activeScreen === "step3" || activeScreen === "step4" || activeScreen === "step5") && (
            <div className="bg-white border border-[#E8E8F0] rounded-[24px] p-5 sm:p-8 max-w-2xl mx-auto shadow-lg text-left space-y-6">
              
              {/* Wizard Header & Steps Progress */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#F3EEFF] text-[#5B2BE0] px-2.5 py-0.5 rounded-full">
                      Step {activeScreen === "step1" ? "1" : activeScreen === "step2" ? "2" : activeScreen === "step3" ? "3" : activeScreen === "step4" ? "4" : "5"} of 5
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• CheckRooms Property Lister</span>
                  </div>
                  <h2 className="font-manrope font-black text-lg sm:text-xl text-[#151538] mt-1">
                    {activeScreen === "step1" && "1. Basic Property Information"}
                    {activeScreen === "step2" && "2. Location & Address Details"}
                    {activeScreen === "step3" && "3. Pricing, Room Type & Tenant Preference"}
                    {activeScreen === "step4" && "4. Facilities, Furniture & House Rules"}
                    {activeScreen === "step5" && "5. Upload Photos & Publish"}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveScreen("dashboard")}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  title="Close wizard"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ===================================================================== */}
              {/* STEP 1: BASIC INFO */}
              {/* ===================================================================== */}
              {activeScreen === "step1" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151538]">
                      Property Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([
                        { key: "room", label: "Room", icon: "🚪" },
                        { key: "pg", label: "PG / Mess", icon: "🍱" },
                        { key: "hostel", label: "Hostel", icon: "🏢" },
                        { key: "flat", label: "Flat / Apartment", icon: "🏠" },
                      ] as const).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setPropertyType(cat.key);
                            clearFormError("propertyType");
                            // Auto-set default room type matching category
                            if (cat.key === "pg") setRoomType("Double Sharing");
                            else if (cat.key === "room") setRoomType("Single Room (Private)");
                            else if (cat.key === "flat") setRoomType("1 BHK Flat");
                            else if (cat.key === "hostel") setRoomType("Double Bed Sharing");
                          }}
                          className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            propertyType === cat.key 
                              ? "border-[#5B2BE0] bg-[#F3EEFF] text-[#5B2BE0] ring-2 ring-[#5B2BE0]/20 shadow-xs" 
                              : "border-[#E8E8F0] text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    {formErrors.propertyType && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.propertyType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151538]">
                      Property Title / Listing Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearFormError("title");
                      }}
                      placeholder="e.g. Luxury PG / 1BHK Flat near Metro Station & College"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        formErrors.title 
                          ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                          : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                      } outline-none text-xs font-medium transition-all`}
                    />
                    {formErrors.title && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151538]">
                      Property Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        clearFormError("description");
                      }}
                      placeholder="Provide helpful details about the room, surroundings, nearby colleges/companies, metro distance, etc..."
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        formErrors.description 
                          ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                          : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                      } outline-none text-xs font-medium transition-all`}
                    />
                    {formErrors.description && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => {
                        const errs: { [k: string]: string } = {};
                        if (!propertyType) errs.propertyType = "Please select a property category.";
                        if (!title.trim()) errs.title = "Property title / listing name is required.";
                        if (!description.trim()) errs.description = "Property description is required.";

                        if (Object.keys(errs).length > 0) {
                          setFormErrors(errs);
                          return;
                        }
                        setFormErrors({});
                        setActiveScreen("step2");
                      }}
                      className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs sm:text-sm font-bold py-3 px-7 rounded-xl transition-all shadow-md shadow-[#5B2BE0]/20 cursor-pointer"
                    >
                      Next: Location Details →
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* STEP 2: LOCATION DETAILS */}
              {/* ===================================================================== */}
              {activeScreen === "step2" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">City <span className="text-red-500">*</span></label>
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          clearFormError("city");
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border ${
                          formErrors.city 
                            ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                            : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                        } outline-none text-xs font-bold bg-white transition-all`}
                      >
                        <option value="Noida">Noida</option>
                        <option value="Greater Noida">Greater Noida</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gurugram">Gurugram</option>
                        <option value="Ghaziabad">Ghaziabad</option>
                        <option value="Faridabad">Faridabad</option>
                      </select>
                      {formErrors.city && (
                        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Area / Sector / Colony <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          clearFormError("area");
                        }}
                        placeholder="e.g. Sector 62 / Knowledge Park 3 / Alpha 1"
                        className={`w-full px-3.5 py-2.5 rounded-xl border ${
                          formErrors.area 
                            ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                            : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                        } outline-none text-xs font-medium transition-all`}
                      />
                      {formErrors.area && (
                        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                          {formErrors.area}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151538]">
                      Full Address & Nearby Landmark <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearFormError("address");
                      }}
                      placeholder="e.g. House #104, Block B, Near City Metro Station Gate #2"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        formErrors.address 
                          ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                          : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                      } outline-none text-xs font-medium transition-all`}
                    />
                    {formErrors.address && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151538]">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        clearFormError("pincode");
                      }}
                      placeholder="e.g. 201301"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        formErrors.pincode 
                          ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                          : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                      } outline-none text-xs font-medium transition-all`}
                    />
                    {formErrors.pincode && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.pincode}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setActiveScreen("step1")}
                      className="border border-[#E8E8F0] text-slate-600 text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        const errs: { [k: string]: string } = {};
                        if (!city.trim()) errs.city = "Please select a city.";
                        if (!area.trim()) errs.area = "Area / Sector is required.";
                        if (!address.trim()) errs.address = "Full address & landmark is required.";
                        if (!pincode.trim()) errs.pincode = "Pincode is required.";

                        if (Object.keys(errs).length > 0) {
                          setFormErrors(errs);
                          return;
                        }
                        setFormErrors({});
                        setActiveScreen("step3");
                      }}
                      className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs sm:text-sm font-bold py-3 px-7 rounded-xl transition-all shadow-md shadow-[#5B2BE0]/20 cursor-pointer"
                    >
                      Next: Pricing & Types →
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* STEP 3: PRICING, DYNAMIC ROOM TYPES, FOOD & PREFERRED TENANT */}
              {/* ===================================================================== */}
              {activeScreen === "step3" && (
                <div className="space-y-6">
                  
                  {/* Pricing Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Monthly Rent (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={rent}
                        onChange={(e) => {
                          setRent(e.target.value);
                          clearFormError("rent");
                        }}
                        placeholder="e.g. 8500"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          formErrors.rent 
                            ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                            : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                        } outline-none text-xs font-bold transition-all`}
                      />
                      {formErrors.rent && (
                        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                          {formErrors.rent}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Security Deposit (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={deposit}
                        onChange={(e) => {
                          setDeposit(e.target.value);
                          clearFormError("deposit");
                        }}
                        placeholder="e.g. 10000"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          formErrors.deposit 
                            ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                            : "border-[#E8E8F0] focus:ring-2 focus:ring-[#5B2BE0]/20 focus:border-[#5B2BE0]"
                        } outline-none text-xs font-bold transition-all`}
                      />
                      {formErrors.deposit && (
                        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                          {formErrors.deposit}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Room / Sharing Types based on Selected Category */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#151538]">
                        Room / Sharing Type for <span className="text-[#5B2BE0] uppercase font-black">{propertyType}</span> <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCustomRoomTypeInput(!showCustomRoomTypeInput)}
                        className="text-[11px] font-bold text-[#5B2BE0] hover:underline cursor-pointer"
                      >
                        {showCustomRoomTypeInput ? "Hide Custom" : "+ Add Custom Type"}
                      </button>
                    </div>

                    {/* Pre-defined options based on category */}
                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${formErrors.roomType ? "p-2 border-2 border-red-500/70 rounded-2xl bg-red-50/10" : ""}`}>
                      {/* PG Options */}
                      {propertyType === "pg" && [
                        "Single Room",
                        "Double Sharing",
                        "Triple Sharing",
                        "4th Sharing (4 Beds)",
                        "5+ Sharing / Dorm"
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setRoomType(t); setCustomRoomType(""); clearFormError("roomType"); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            roomType === t && !customRoomType
                              ? "border-[#5B2BE0] bg-[#F3EEFF] text-[#5B2BE0] ring-1 ring-[#5B2BE0]"
                              : "border-[#E8E8F0] text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}

                      {/* Room Options */}
                      {propertyType === "room" && [
                        "Single Room (Private)",
                        "Double Sharing Room",
                        "Triple Sharing Room",
                        "1 RK Room Set",
                        "Attached Washroom Room",
                        "Master Bedroom with Balcony"
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setRoomType(t); setCustomRoomType(""); clearFormError("roomType"); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            roomType === t && !customRoomType
                              ? "border-[#5B2BE0] bg-[#F3EEFF] text-[#5B2BE0] ring-1 ring-[#5B2BE0]"
                              : "border-[#E8E8F0] text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}

                      {/* Flat Options */}
                      {propertyType === "flat" && [
                        "1 BHK Flat",
                        "2 BHK Flat",
                        "3 BHK Flat",
                        "4 BHK Flat",
                        "1 RK Studio Apartment",
                        "Independent Apartment / Floor"
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setRoomType(t); setCustomRoomType(""); clearFormError("roomType"); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            roomType === t && !customRoomType
                              ? "border-[#5B2BE0] bg-[#F3EEFF] text-[#5B2BE0] ring-1 ring-[#5B2BE0]"
                              : "border-[#E8E8F0] text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}

                      {/* Hostel Options */}
                      {propertyType === "hostel" && [
                        "Single Bed Room",
                        "Double Bed Sharing (2 Beds)",
                        "Triple Bed Sharing (3 Beds)",
                        "4 Bed Sharing Room",
                        "Dormitory / Common Hall"
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setRoomType(t); setCustomRoomType(""); clearFormError("roomType"); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            roomType === t && !customRoomType
                              ? "border-[#5B2BE0] bg-[#F3EEFF] text-[#5B2BE0] ring-1 ring-[#5B2BE0]"
                              : "border-[#E8E8F0] text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Inline Custom Room Type Input */}
                    {showCustomRoomTypeInput && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={customRoomType}
                          onChange={(e) => {
                            setCustomRoomType(e.target.value);
                            clearFormError("roomType");
                          }}
                          placeholder="Type your custom room type (e.g. Deluxe Suite / 2RK)..."
                          className="flex-1 px-3.5 py-2 rounded-xl border border-[#5B2BE0] text-xs font-semibold outline-none bg-[#FBF9FF]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customRoomType.trim()) {
                              setRoomType(customRoomType.trim());
                              clearFormError("roomType");
                            }
                          }}
                          className="bg-[#5B2BE0] text-white text-xs font-bold px-4 py-2 rounded-xl"
                        >
                          Set
                        </button>
                      </div>
                    )}
                    {formErrors.roomType && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.roomType}
                      </p>
                    )}
                  </div>

                  {/* 1. FOOD FACILITY (Exactly matching screenshot) */}
                  <div className="space-y-2.5">
                    <label className="text-[11.5px] font-extrabold text-[#374151] tracking-wider uppercase block">
                      FOOD FACILITY <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex flex-wrap items-center gap-3 ${formErrors.foodOption ? "p-2 border-2 border-red-500/70 rounded-2xl bg-red-50/10" : ""}`}>
                      {(["Yes", "No", "Optional"] as const).map((opt) => {
                        const isSelected = foodOption === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setFoodOption(opt);
                              clearFormError("foodOption");
                            }}
                            className={`px-5 py-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 min-w-[110px] ${
                              isSelected
                                ? "border-2 border-[#6C4CF1] bg-[#FAF8FE] text-[#6C4CF1] font-bold shadow-xs"
                                : "border border-slate-200 bg-white text-[#151538] font-bold hover:bg-slate-50/80"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#6C4CF1]" : "border-slate-300"
                            }`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-[#6C4CF1]" />}
                            </span>
                            <span className="text-xs sm:text-sm">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {formErrors.foodOption && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.foodOption}
                      </p>
                    )}
                  </div>

                  {/* 2. PREFERRED TENANT / LIVING PREFERENCE * (Exactly matching screenshot) */}
                  <div className="space-y-2.5">
                    <label className="text-[11.5px] font-extrabold text-[#374151] tracking-wider uppercase block">
                      PREFERRED TENANT / LIVING PREFERENCE <span className="text-red-500">*</span>
                    </label>
                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${formErrors.preferredTenant ? "p-2 border-2 border-red-500/70 rounded-2xl bg-red-50/10" : ""}`}>
                      {(["Boys Only", "Girls Only", "Family / Couple", "Anyone"] as const).map((pref) => {
                        const isSelected = preferredTenant === pref;
                        return (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => {
                              setPreferredTenant(pref);
                              clearFormError("preferredTenant");
                            }}
                            className={`px-4 py-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2.5 text-center ${
                              isSelected
                                ? "border-2 border-[#6C4CF1] bg-[#FAF8FE] text-[#6C4CF1] font-bold shadow-xs"
                                : "border border-slate-200 bg-white text-[#151538] font-bold hover:bg-slate-50/80"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#6C4CF1]" : "border-slate-300"
                            }`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-[#6C4CF1]" />}
                            </span>
                            <span className="text-xs sm:text-sm">{pref}</span>
                          </button>
                        );
                      })}
                    </div>
                    {formErrors.preferredTenant && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.preferredTenant}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setActiveScreen("step2")}
                      className="border border-[#E8E8F0] text-slate-600 text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        const errs: { [k: string]: string } = {};
                        if (!rent.trim() || Number(rent) <= 0) errs.rent = "Please enter valid monthly rent (₹).";
                        if (!deposit.trim()) errs.deposit = "Security deposit (₹) is required.";
                        if (!roomType.trim()) errs.roomType = "Please select or type a room type.";
                        if (!foodOption) errs.foodOption = "Please select food facility option.";
                        if (!preferredTenant) errs.preferredTenant = "Please select living preference.";

                        if (Object.keys(errs).length > 0) {
                          setFormErrors(errs);
                          return;
                        }
                        setFormErrors({});
                        setActiveScreen("step4");
                      }}
                      className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs sm:text-sm font-bold py-3 px-7 rounded-xl transition-all shadow-md shadow-[#5B2BE0]/20 cursor-pointer"
                    >
                      Next: Facilities & Rules →
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* STEP 4: FACILITIES, FURNITURE & RULES (Exactly matching screenshot 2 & 3) */}
              {/* ===================================================================== */}
              {activeScreen === "step4" && (
                <div className="space-y-6">
                  
                  {/* 1. FACILITIES (Exactly matching screenshot 2) */}
                  <div className="space-y-2.5">
                    <label className="text-[11.5px] font-extrabold text-[#374151] tracking-wider uppercase block">
                      FACILITIES <span className="text-red-500">*</span>
                    </label>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${formErrors.facilities ? "p-2 border-2 border-red-500/70 rounded-2xl bg-red-50/10" : ""}`}>
                      {[
                        ...defaultBaseFacilities,
                        ...customFacilitiesList.filter((f) => !defaultBaseFacilities.includes(f))
                      ].map((fac) => {
                        const isSelected = selectedFacilities.includes(fac);
                        return (
                          <button
                            key={fac}
                            type="button"
                            onClick={() => {
                              clearFormError("facilities");
                              if (isSelected) {
                                setSelectedFacilities(selectedFacilities.filter((f) => f !== fac));
                              } else {
                                setSelectedFacilities([...selectedFacilities, fac]);
                              }
                            }}
                            className={`px-4 py-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2.5 text-center ${
                              isSelected
                                ? "border-2 border-[#6C4CF1] bg-[#FAF8FE] text-[#6C4CF1] font-bold shadow-xs"
                                : "border border-slate-200 bg-white text-[#151538] font-bold hover:bg-slate-50/80"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-[#6C4CF1] text-white" : "border-2 border-slate-300 bg-white"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="text-xs sm:text-sm">{fac}</span>
                          </button>
                        );
                      })}

                      {/* + Add Facility (Dashed Button) */}
                      <button
                        type="button"
                        onClick={() => setShowAddFacilityInput(true)}
                        className="px-4 py-3.5 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-[#6C4CF1] hover:text-[#6C4CF1] hover:bg-[#FAF8FE] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                      >
                        <span>+ Add Facility</span>
                      </button>
                    </div>

                    {/* Inline Add Facility Input */}
                    {showAddFacilityInput && (
                      <div className="flex items-center gap-2 pt-1.5">
                        <input
                          type="text"
                          value={customFacilityInput}
                          onChange={(e) => setCustomFacilityInput(e.target.value)}
                          placeholder="Enter facility name (e.g. Gym, Swimming Pool)..."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-[#6C4CF1] text-xs font-semibold outline-none bg-[#FAF8FE]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customFacilityInput.trim()) {
                              e.preventDefault();
                              const val = customFacilityInput.trim();
                              if (!customFacilitiesList.includes(val)) {
                                setCustomFacilitiesList((prev) => [...prev, val]);
                              }
                              if (!selectedFacilities.includes(val)) {
                                setSelectedFacilities((prev) => [...prev, val]);
                              }
                              clearFormError("facilities");
                              setCustomFacilityInput("");
                              setShowAddFacilityInput(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customFacilityInput.trim()) {
                              const val = customFacilityInput.trim();
                              if (!customFacilitiesList.includes(val)) {
                                setCustomFacilitiesList((prev) => [...prev, val]);
                              }
                              if (!selectedFacilities.includes(val)) {
                                setSelectedFacilities((prev) => [...prev, val]);
                              }
                              clearFormError("facilities");
                              setCustomFacilityInput("");
                              setShowAddFacilityInput(false);
                            }
                          }}
                          className="bg-[#6C4CF1] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddFacilityInput(false)}
                          className="text-slate-400 hover:text-slate-600 px-2 py-2 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {formErrors.facilities && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.facilities}
                      </p>
                    )}
                  </div>

                  {/* 2. FURNITURE INCLUDED (IN ROOM) (Exactly matching screenshot 2) */}
                  <div className="space-y-2.5 pt-2">
                    <label className="text-[11.5px] font-extrabold text-[#374151] tracking-wider uppercase block">
                      FURNITURE INCLUDED (IN ROOM) <span className="text-red-500">*</span>
                    </label>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${formErrors.furniture ? "p-2 border-2 border-red-500/70 rounded-2xl bg-red-50/10" : ""}`}>
                      {[
                        ...defaultBaseFurniture,
                        ...customFurnitureList.filter((f) => !defaultBaseFurniture.includes(f))
                      ].map((furn) => {
                        const isSelected = selectedFurniture.includes(furn);
                        return (
                          <button
                            key={furn}
                            type="button"
                            onClick={() => {
                              clearFormError("furniture");
                              if (isSelected) {
                                setSelectedFurniture(selectedFurniture.filter((f) => f !== furn));
                              } else {
                                setSelectedFurniture([...selectedFurniture, furn]);
                              }
                            }}
                            className={`px-4 py-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2.5 text-center ${
                              isSelected
                                ? "border-2 border-[#6C4CF1] bg-[#FAF8FE] text-[#6C4CF1] font-bold shadow-xs"
                                : "border border-slate-200 bg-white text-[#151538] font-bold hover:bg-slate-50/80"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-[#6C4CF1] text-white" : "border-2 border-slate-300 bg-white"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="text-xs sm:text-sm">{furn}</span>
                          </button>
                        );
                      })}

                      {/* + Add Furniture (Dashed Button) */}
                      <button
                        type="button"
                        onClick={() => setShowAddFurnitureInput(true)}
                        className="px-4 py-3.5 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-[#6C4CF1] hover:text-[#6C4CF1] hover:bg-[#FAF8FE] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                      >
                        <span>+ Add Furniture</span>
                      </button>
                    </div>

                    {/* Inline Add Furniture Input */}
                    {showAddFurnitureInput && (
                      <div className="flex items-center gap-2 pt-1.5">
                        <input
                          type="text"
                          value={customFurnitureInput}
                          onChange={(e) => setCustomFurnitureInput(e.target.value)}
                          placeholder="Enter furniture name (e.g. Bookshelf, Sofa)..."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-[#6C4CF1] text-xs font-semibold outline-none bg-[#FAF8FE]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customFurnitureInput.trim()) {
                              e.preventDefault();
                              const val = customFurnitureInput.trim();
                              if (!customFurnitureList.includes(val)) {
                                setCustomFurnitureList((prev) => [...prev, val]);
                              }
                              if (!selectedFurniture.includes(val)) {
                                setSelectedFurniture((prev) => [...prev, val]);
                              }
                              clearFormError("furniture");
                              setCustomFurnitureInput("");
                              setShowAddFurnitureInput(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customFurnitureInput.trim()) {
                              const val = customFurnitureInput.trim();
                              if (!customFurnitureList.includes(val)) {
                                setCustomFurnitureList((prev) => [...prev, val]);
                              }
                              if (!selectedFurniture.includes(val)) {
                                setSelectedFurniture((prev) => [...prev, val]);
                              }
                              clearFormError("furniture");
                              setCustomFurnitureInput("");
                              setShowAddFurnitureInput(false);
                            }
                          }}
                          className="bg-[#6C4CF1] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddFurnitureInput(false)}
                          className="text-slate-400 hover:text-slate-600 px-2 py-2 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {formErrors.furniture && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.furniture}
                      </p>
                    )}
                  </div>

                  {/* 3. RULES * (Exactly matching screenshot 3, made required) */}
                  <div className="space-y-2.5 pt-2">
                    <label className="text-[11.5px] font-extrabold text-[#374151] tracking-wider uppercase block">
                      RULES <span className="text-red-500">*</span>
                    </label>
                    <div className={`rounded-[22px] border ${
                      formErrors.houseRules 
                        ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" 
                        : "border-slate-200 bg-[#F9FAFB]/50 focus-within:border-[#6C4CF1] focus-within:ring-2 focus-within:ring-[#6C4CF1]/20"
                    } p-1 transition-all`}>
                      <textarea
                        rows={4}
                        value={houseRules}
                        onChange={(e) => {
                          setHouseRules(e.target.value);
                          clearFormError("houseRules");
                        }}
                        placeholder="e.g. No smoking, No pets, Visiting hours etc."
                        className="w-full px-4 py-3 bg-transparent outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 font-medium resize-none"
                      />
                    </div>
                    {formErrors.houseRules && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.houseRules}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setActiveScreen("step3")}
                      className="border border-[#E8E8F0] text-slate-600 text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        const errs: { [k: string]: string } = {};
                        if (selectedFacilities.length === 0) errs.facilities = "Please select at least 1 facility.";
                        if (selectedFurniture.length === 0) errs.furniture = "Please select at least 1 furniture item.";
                        if (!houseRules.trim()) errs.houseRules = "Please enter rules & guidelines for the property.";

                        if (Object.keys(errs).length > 0) {
                          setFormErrors(errs);
                          return;
                        }
                        setFormErrors({});
                        setActiveScreen("step5");
                      }}
                      className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs sm:text-sm font-bold py-3 px-7 rounded-xl transition-all shadow-md shadow-[#5B2BE0]/20 cursor-pointer"
                    >
                      Next: Upload Photos →
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* STEP 5: PHOTOS & PUBLISH */}
              {/* ===================================================================== */}
              {activeScreen === "step5" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#151538]">
                      Property Photos <span className="text-red-500">*</span> (Add room, washroom & property pictures)
                    </label>
                    
                    <label className={`border-2 border-dashed ${
                      formErrors.photos ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" : "border-[#5B2BE0]/30 hover:border-[#5B2BE0] bg-[#F8F5FE]"
                    } rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors`}>
                      <Camera className={`w-8 h-8 ${formErrors.photos ? "text-red-500" : "text-[#5B2BE0]"}`} />
                      <span className={`text-xs font-bold ${formErrors.photos ? "text-red-600" : "text-[#5B2BE0]"}`}>
                        {isUploading ? "Uploading photo..." : "Click to select or drag property photos"}
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, JPEG or WEBP (Max 5MB each)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          clearFormError("photos");
                          handlePhotoUpload(e);
                        }}
                        className="hidden"
                      />
                    </label>
                    {formErrors.photos && (
                      <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {formErrors.photos}
                      </p>
                    )}

                    {photos.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {photos.map((p, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E8E8F0] shadow-xs">
                            <img src={p} alt="Upload preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setActiveScreen("step4")}
                      className="border border-[#E8E8F0] text-slate-600 text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (photos.length === 0) {
                          setFormErrors({ photos: "Please upload at least 1 property photo before publishing." });
                          return;
                        }
                        handleFinalSubmitListing();
                      }}
                      className="bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-xs sm:text-sm font-extrabold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Listing 🎉</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}


          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* SCREEN 1: PROFILE SETTINGS */}
          {/* ========================================================================= */}
          {activeScreen === "profile" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              
              {/* ===================================================================== */}
              {/* VIEW MODE: PRE-SAVED PROFILE DETAILS */}
              {/* ===================================================================== */}
              {!isEditingProfile ? (
                <div className="bg-white border border-[#E8E8F0] rounded-[24px] p-6 sm:p-8 shadow-xs text-left space-y-6">
                  
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#F0F2F5]">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-manrope font-black text-xl sm:text-2xl text-[#151538] leading-tight">
                          Owner Profile
                        </h2>
                        <span className="bg-[#EAF8EF] text-[#16A34A] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#A7F3D0] shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Saved & Verified</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-[#666680] font-medium leading-relaxed">
                        Your verified landlord credentials and public contact info
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 shrink-0">
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs sm:text-[13px] font-bold py-2.5 px-4.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-[#5B2BE0]/20 transition-all cursor-pointer active:scale-98"
                      >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Edit Profile</span>
                      </button>
                      <button 
                        onClick={() => setActiveScreen("dashboard")} 
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Back to Dashboard"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Landlord Profile Banner */}
                  <div className="bg-gradient-to-br from-[#F8F4FF] via-[#FAF7FF] to-[#F3EEFF] border border-[#E9DCFF] rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative shrink-0">
                      {profileAvatar ? (
                        <img
                          src={profileAvatar}
                          alt={profileName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shadow-[#5B2BE0]/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5B2BE0] to-[#8C52FF] text-white text-2xl font-black flex items-center justify-center shadow-md shadow-[#5B2BE0]/20">
                          {profileName.trim().charAt(0).toUpperCase() || "O"}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#16A34A] text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left flex-1 min-w-0">
                      <h3 className="font-manrope font-black text-lg text-[#151538] truncate">{profileName}</h3>
                      <p className="text-xs text-[#5B2BE0] font-bold">CheckRooms Verified Property Partner</p>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                        <span className="text-[10px] font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-[#E8E8F0] shadow-2xs inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                          <span>ID & Contact Verified</span>
                        </span>
                        <span className="text-[10px] font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-[#E8E8F0] shadow-2xs inline-flex items-center gap-1">
                          <House className="w-3 h-3 text-[#5B2BE0]" />
                          <span>{listings.length} Properties Active</span>
                        </span>
                        <span className="text-[10px] font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-[#E8E8F0] shadow-2xs inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>100% Fast Response</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Saved Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Full Name */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8E8F0] space-y-1">
                      <div className="flex items-center justify-between text-[#8C8CA1]">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider">Full Name</span>
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="font-manrope font-bold text-sm text-[#151538]">{profileName}</p>
                    </div>

                    {/* Phone Number */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8E8F0] space-y-1">
                      <div className="flex items-center justify-between text-[#8C8CA1]">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider">Phone Number</span>
                        <span className="text-[9.5px] font-bold text-[#16A34A] bg-[#EAF8EF] px-1.5 py-0.5 rounded">Calls Active</span>
                      </div>
                      <p className="font-manrope font-bold text-sm text-[#151538] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#5B2BE0]" />
                        <span>{profilePhone}</span>
                      </p>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8E8F0] space-y-1">
                      <div className="flex items-center justify-between text-[#8C8CA1]">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider">WhatsApp Number</span>
                        <span className="text-[9.5px] font-bold text-[#128C7E] bg-[#25D366]/10 px-1.5 py-0.5 rounded">Tenant Leads</span>
                      </div>
                      <p className="font-manrope font-bold text-sm text-[#151538] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>{profileWhatsApp}</span>
                      </p>
                    </div>

                    {/* Email Address */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8E8F0] space-y-1">
                      <div className="flex items-center justify-between text-[#8C8CA1]">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider">Email Address</span>
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="font-manrope font-bold text-sm text-[#151538] truncate">{profileEmail}</p>
                    </div>

                  </div>

                  {/* Info Note Banner */}
                  <div className="p-3.5 bg-[#FAF8FE] border border-[#E9DCFF] rounded-xl flex items-start gap-2.5 text-xs text-[#666680]">
                    <Sparkles className="w-4 h-4 text-[#5B2BE0] shrink-0 mt-0.5" />
                    <p>
                      These contact details are shown on your room listings. Whenever a tenant clicks <b>Call</b> or <b>WhatsApp</b>, they connect directly with you on this phone number.
                    </p>
                  </div>

                </div>
              ) : (
                /* ===================================================================== */
                /* EDIT MODE: UPDATE PROFILE DETAILS */
                /* ===================================================================== */
                <div className="bg-white border border-[#E8E8F0] rounded-[24px] p-6 sm:p-8 shadow-xs text-left space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F5]">
                    <div>
                      <h2 className="font-manrope font-black text-xl text-[#151538]">Edit Profile Settings</h2>
                      <p className="text-xs text-[#666680] mt-0.5">Update your landlord contact details and business info</p>
                    </div>
                    <button 
                      onClick={() => setIsEditingProfile(false)} 
                      className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (typeof window !== "undefined") {
                        localStorage.setItem("owner_name", profileName);
                        localStorage.setItem("owner_phone", profilePhone);
                        localStorage.setItem("owner_whatsapp", profileWhatsApp);
                        localStorage.setItem("owner_email", profileEmail);
                        localStorage.setItem("checkrooms_user_name", profileName);
                        localStorage.setItem("checkrooms_user_phone", profilePhone);
                        if (profileAvatar) localStorage.setItem("owner_avatar", profileAvatar);
                      }

                      try {
                        await ownerFetch(getApiUrl("/api/auth/profile"), {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            fullName: profileName,
                            mobile: profilePhone,
                            email: profileEmail,
                            avatar: profileAvatar
                          })
                        });
                      } catch (err) {
                        console.error("Failed to update profile on server:", err);
                      }
                      
                      setNotifications((prev) => [
                        {
                          id: `notif_${Date.now()}`,
                          message: "Profile settings updated successfully!",
                          time: "Just now",
                          read: false
                        },
                        ...prev
                      ]);

                      setIsEditingProfile(false);
                      alert("Profile updated successfully!");
                    }}
                    className="space-y-4"
                  >
                    {/* Profile Photo Upload */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Profile Photo</label>
                      <div className="flex items-center gap-3">
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="Avatar preview"
                            className="w-12 h-12 rounded-full object-cover border border-[#E8E8F0] shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#5B2BE0] text-white font-bold text-base flex items-center justify-center shadow-xs">
                            {profileName.trim().charAt(0).toUpperCase() || "O"}
                          </div>
                        )}
                        <label className="px-3.5 py-2 rounded-xl border border-[#E8E8F0] bg-slate-50 hover:bg-[#F3EEFF] text-xs font-bold text-[#5B2BE0] cursor-pointer transition-colors flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{profileAvatar ? "Change Photo" : "Upload Photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setProfileAvatar(url);
                                if (typeof window !== "undefined") {
                                  localStorage.setItem("owner_avatar", url);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {profileAvatar && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileAvatar("");
                              if (typeof window !== "undefined") {
                                localStorage.removeItem("owner_avatar");
                              }
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8F0] text-xs font-semibold outline-none focus:border-[#5B2BE0] focus:ring-2 focus:ring-[#5B2BE0]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Phone Number (for Calling)</label>
                      <input
                        type="text"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8F0] text-xs font-semibold outline-none focus:border-[#5B2BE0] focus:ring-2 focus:ring-[#5B2BE0]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">WhatsApp Number (for Tenant Inquiries)</label>
                      <input
                        type="text"
                        required
                        value={profileWhatsApp}
                        onChange={(e) => setProfileWhatsApp(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8F0] text-xs font-semibold outline-none focus:border-[#5B2BE0] focus:ring-2 focus:ring-[#5B2BE0]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#151538]">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8F0] text-xs font-semibold outline-none focus:border-[#5B2BE0] focus:ring-2 focus:ring-[#5B2BE0]/20"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-5 py-2.5 rounded-xl border border-[#E8E8F0] text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#5B2BE0] text-white text-xs font-bold hover:bg-[#4A20C0] transition-all shadow-md shadow-[#5B2BE0]/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* DANGER ZONE: DELETE ACCOUNT CARD */}
              <div className="bg-red-50/40 border border-red-200/80 rounded-[24px] p-6 sm:p-7 shadow-xs text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-manrope font-black text-base text-red-600">
                        Delete Account & Data
                      </h4>
                    </div>
                    <p className="text-xs text-[#666680] leading-relaxed max-w-md">
                      Permanently delete your CheckRooms landlord account, published room listings ({listings.length} live), and customer lead history. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmText("");
                      setShowDeleteAccountModal(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all shadow-sm shadow-red-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>

            </div>
          )}


          {/* ========================================================================= */}
          {/* SCREEN 2: HELP & SUPPORT (CONTACT ADMIN WITH BOOST ISSUES) */}
          {/* ========================================================================= */}
          {activeScreen === "help" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              
              {/* HELP & SUPPORT / CONTACT ADMIN CARD (MATCHING USER SCREENSHOT EXACTLY) */}
              <div className="bg-white border border-[#E8E8F0] rounded-[24px] overflow-hidden shadow-xs text-left">
                
                {/* Header bar */}
                <div className="p-5 sm:p-6 pb-4 border-b border-[#F0F2F5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE7FF] text-[#5B2BE0] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-manrope font-black text-xl text-[#151538]">
                        Help & Support
                      </h3>
                      <p className="text-xs text-[#8C8CA1] font-medium">Get assistance with listings, boosts, and payments</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveScreen("dashboard")} 
                    className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-5">
                  
                  {/* Subheader with vertical purple bar */}
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-10 bg-[#5B2BE0] rounded-full shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-manrope font-black text-base text-[#151538] flex items-center gap-2">
                        <span>Contact Admin</span>
                        <span>💬</span>
                      </h4>
                      <p className="text-xs text-[#8C8CA1] font-medium">
                        Send a message directly to the website administrator
                      </p>
                    </div>
                  </div>

                  {helpSubmittedSuccess ? (
                    <div className="bg-[#EAF8EF] border border-[#A7F3D0] rounded-2xl p-6 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h5 className="font-manrope font-bold text-sm text-[#151538]">
                        Message Sent to Administrator!
                      </h5>
                      <p className="text-xs text-emerald-800 max-w-md mx-auto">
                        Your request regarding <b>{helpSubject}</b> has been received. Our support team will review and resolve it promptly.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setHelpSubmittedSuccess(false);
                          setHelpMessage("");
                        }}
                        className="mt-2 text-xs font-bold text-[#5B2BE0] hover:underline cursor-pointer"
                      >
                        Send another message →
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!helpMessage.trim()) return;
                        setIsSubmittingHelp(true);

                        try {
                          await ownerFetch(getApiUrl("/api/listings/support/report"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              subject: helpSubject,
                              message: helpMessage,
                              userEmail: profileEmail,
                              userName: profileName
                            })
                          });
                        } catch (err) {}

                        setNotifications((prev) => [
                          {
                            id: `notif_${Date.now()}`,
                            message: `Support ticket submitted: "${helpSubject}". Admin team will respond shortly.`,
                            time: "Just now",
                            read: false
                          },
                          ...prev
                        ]);

                        setIsSubmittingHelp(false);
                        setHelpSubmittedSuccess(true);
                      }}
                      className="space-y-4 text-left"
                    >
                      {/* SELECT SUBJECT */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C8CA1] block">
                          SELECT SUBJECT
                        </label>
                        <div className="relative">
                          <select
                            value={helpSubject}
                            onChange={(e) => setHelpSubject(e.target.value)}
                            className="w-full bg-white border border-[#E8E8F0] text-[#151538] font-bold text-sm px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#5B2BE0] focus:ring-2 focus:ring-[#5B2BE0]/20 transition-all cursor-pointer appearance-none"
                          >
                            <option value="General Help & Query">General Help & Query</option>
                            <option value="⚡ Listing Boost & Ranking Issue">⚡ Listing Boost & Ranking Issue</option>
                            <option value="⚡ Boost Payment & Verification Pending">⚡ Boost Payment & Verification Pending</option>
                            <option value="Listing/Room Approval Issue">Listing/Room Approval Issue</option>
                            <option value="Billing & Premium Payments">Billing & Premium Payments</option>
                            <option value="Technical Bug Report">Technical Bug Report</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* YOUR MESSAGE */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C8CA1] block">
                          YOUR MESSAGE
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          placeholder="Describe your issue or request..."
                          className="w-full bg-white border border-[#E8E8F0] text-[#151538] text-xs font-semibold p-4 rounded-2xl focus:outline-none focus:border-[#5B2BE0] focus:ring-2 focus:ring-[#5B2BE0]/20 transition-all resize-none"
                        />
                      </div>

                      {/* Send Message Button */}
                      <button
                        type="submit"
                        disabled={isSubmittingHelp || !helpMessage.trim()}
                        className="w-full bg-[#5B2BE0] hover:bg-[#4A20C0] disabled:opacity-50 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-md shadow-[#5B2BE0]/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingHelp ? "Sending Message..." : "Send Message"}
                      </button>
                    </form>
                  )}

                  {/* Quick WhatsApp & Call Support Links */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
                    <span>Need urgent assistance?</span>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://wa.me/919876543210?text=Hello%20CheckRooms%20Support%2C%20I%20need%20help%20with%20my%20owner%20dashboard."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        <span>WhatsApp Admin</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </main>


        {/* ========================================================================= */}
        {/* 6. FOOTER */}
        {/* ========================================================================= */}
        <footer className="mt-auto py-5 px-6 sm:px-8 border-t border-[#E8E8F0] bg-white text-xs text-[#8C8CA1] flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
          <div>
            © 2025 CheckRooms. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/privacy-policy" className="hover:text-[#5B2BE0] transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-[#5B2BE0] transition-colors">Terms & Conditions</Link>
          </div>
        </footer>

      </div>


      {/* ========================================================================= */}
      {/* 7. BOOST LISTING MODAL (PREMIUM POPUP) */}
      {/* ========================================================================= */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E8E8F0] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {checkoutStep !== "success" && (
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EFE7FF] text-[#5B2BE0] flex items-center justify-center">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h3 className="font-manrope font-bold text-base text-[#151538]">
                    Boost Your Listing
                  </h3>
                </div>
                <button 
                  onClick={() => setShowBoostModal(false)} 
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: SELECT PROPERTY TO BOOST */}
            {/* ========================================================================= */}
            {checkoutStep === "select_listing" && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#5B2BE0] text-white text-[10px] font-black flex items-center justify-center">1</span>
                    <h4 className="font-manrope font-bold text-sm text-[#151538]">
                      Select Property to Boost
                    </h4>
                  </div>
                  <p className="text-xs text-[#666680] mt-1 leading-relaxed">
                    Select a listing to rank at #1 position. Properties that are already boosted cannot be selected again until their plan expires.
                  </p>
                </div>

                {/* List of properties to pick */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-0.5">
                  {listings.map((item) => {
                    const isItemBoosted = Boolean(item.isBoosted || (item.views && item.views > 350));
                    const isSelected = boostingListing?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isItemBoosted) return;
                          setBoostingListing(item);
                        }}
                        className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                          isItemBoosted
                            ? "bg-slate-50/80 border-slate-200 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "border-[#5B2BE0] bg-gradient-to-r from-[#F8F4FF] via-white to-white shadow-xs ring-2 ring-[#5B2BE0]/20 cursor-pointer"
                            : "border-[#E8E8F0] hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-13 h-13 rounded-xl object-cover shrink-0 border border-[#E8E8F0]"
                          />
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-[#EFE7FF] text-[#5B2BE0] text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase">
                                {item.type || "Room"}
                              </span>
                              {isItemBoosted ? (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300/50 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                  ⚡ ALREADY BOOSTED
                                </span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 text-[8.5px] font-bold px-1.5 py-0.2 rounded-full">
                                  Available
                                </span>
                              )}
                            </div>
                            <h5 className="font-manrope font-bold text-xs text-[#151538] truncate mt-1">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-[#666680] truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#8C8CA1] shrink-0" />
                              <span>{item.location}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-manrope font-black text-xs text-[#151538] block">
                            ₹{item.rent.toLocaleString()}
                          </span>
                          <span className="text-[9.5px] text-[#8C8CA1] block">/month</span>
                          <div className="mt-1 flex items-center justify-end">
                            {isItemBoosted ? (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                Active #1
                              </span>
                            ) : (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-[#5B2BE0] border-[#5B2BE0] text-white"
                                  : "border-slate-300 bg-white"
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Fixed Action Button (Without 'NEXT' text) */}
                <div className="pt-3 border-t border-[#F0F2F5] sticky bottom-0 bg-white">
                  <button
                    disabled={!boostingListing || Boolean(boostingListing.isBoosted || (boostingListing.views && boostingListing.views > 350))}
                    onClick={() => {
                      if (boostingListing && !Boolean(boostingListing.isBoosted || (boostingListing.views && boostingListing.views > 350))) {
                        setCheckoutStep("plans");
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-extrabold py-3 px-5 rounded-xl transition-all duration-200 shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                  </button>
                  {boostingListing && Boolean(boostingListing.isBoosted || (boostingListing.views && boostingListing.views > 350)) && (
                    <p className="text-[11px] text-amber-600 font-semibold text-center mt-1.5">
                      ⚠️ Selected listing is already boosted. Please select another property from above.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: CHOOSE BOOST PLAN */}
            {/* ========================================================================= */}
            {checkoutStep === "plans" && (
              <div className="space-y-4">
                {/* Selected Property Preview Banner */}
                {boostingListing && (
                  <div className="bg-[#FAF8FE] border border-[#E9DCFF] rounded-2xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={boostingListing.image}
                        alt={boostingListing.title}
                        className="w-11 h-11 rounded-xl object-cover border border-[#E8E8F0] shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] font-extrabold text-[#5B2BE0] uppercase tracking-wider block">Selected Property</span>
                        <h5 className="font-manrope font-bold text-xs text-[#151538] truncate">{boostingListing.title}</h5>
                        <p className="text-[10.5px] text-[#666680] truncate">{boostingListing.location} • ₹{boostingListing.rent.toLocaleString()}/mo</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("select_listing")}
                      className="text-[11px] font-bold text-[#5B2BE0] hover:underline shrink-0 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#E9DCFF]"
                    >
                      Change
                    </button>
                  </div>
                )}

                <p className="text-xs text-[#666680] leading-relaxed">
                  Choose a promotion plan to feature your selected property at the top of search results and attract 3x more tenants.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setSelectedPlan("basic")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === "basic" 
                        ? "border-[#5B2BE0] bg-gradient-to-br from-[#F8F4FF] to-white ring-2 ring-[#5B2BE0]/20 shadow-xs" 
                        : "border-[#E8E8F0] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-[#5B2BE0] uppercase tracking-wider">⚡ Standard Boost</span>
                      <span className="bg-[#EFE7FF] text-[#5B2BE0] text-[8.5px] font-extrabold px-2 py-0.5 rounded-full">7 DAYS</span>
                    </div>
                    <h4 className="font-manrope font-black text-xl text-[#151538] mt-1.5">₹19</h4>
                    <p className="text-[11px] text-[#666680] mt-1 leading-snug">7 Days Priority #1 Listing on Homepage & Category Search</p>
                  </div>

                  <div 
                    onClick={() => setSelectedPlan("premium")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedPlan === "premium" 
                        ? "border-[#FF7A00] bg-gradient-to-br from-[#FFF8F3] to-[#FBF6FF] ring-2 ring-[#FF7A00]/25 shadow-sm" 
                        : "border-[#E8E8F0] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-[#FF7A00] uppercase tracking-wider">🚀 Ultra Boost</span>
                      <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">1 MONTH (30 DAYS)</span>
                    </div>
                    <h4 className="font-manrope font-black text-xl text-[#151538] mt-1.5">₹49</h4>
                    <p className="text-[11px] text-[#666680] mt-1 leading-snug">1 Full Month (30 Days) Top Rank + Golden Badge + Instant Alerts</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("select_listing")}
                    className="w-24 sm:w-28 py-3 rounded-xl bg-[#F4EFFF] border border-[#6C4CF1]/30 hover:bg-[#6C4CF1] hover:text-white text-[#6C4CF1] text-xs sm:text-sm font-bold transition-all active:scale-98 cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("payment")}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white text-xs sm:text-sm font-extrabold transition-all duration-200 shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer text-center"
                  >
                    Payment ₹{selectedPlan === "basic" ? "19" : "49"}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: PAYMENT MODE & SCREENSHOT PROOF */}
            {/* ========================================================================= */}
            {checkoutStep === "payment" && (
              <div className="space-y-4 text-center">
                {/* Summary banner */}
                {boostingListing && (
                  <div className="bg-[#FAF8FE] border border-[#E9DCFF] rounded-2xl p-2.5 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={boostingListing.image}
                        alt={boostingListing.title}
                        className="w-10 h-10 rounded-lg object-cover border border-[#E8E8F0] shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="font-manrope font-bold text-xs text-[#151538] truncate">{boostingListing.title}</h5>
                        <span className="text-[10px] font-extrabold text-[#5B2BE0]">
                          {selectedPlan === "basic" ? "Standard Boost (₹19 - 7 Days)" : "Ultra Boost (₹49 - 1 Month)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#666680]">
                  Scan the UPI QR Code to pay <b>{selectedPlan === "basic" ? "₹19 (7 Days Plan)" : "₹49 (1 Month Plan)"}</b> and upload screenshot for instant verification.
                </p>

                {/* QR Code */}
                <div className="p-3.5 bg-slate-50 border border-[#E8E8F0] rounded-2xl w-52 mx-auto flex flex-col items-center relative group">
                  <div className="relative">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                        `upi://pay?pa=manish12643@okhdfcbank&pn=CheckRooms&am=${selectedPlan === "basic" ? "19" : "49"}&cu=INR`
                      )}`}
                      alt="UPI QR Code"
                      className="w-36 h-36 rounded-xl bg-white p-1.5 border border-slate-200 shadow-xs"
                    />
                    {/* Small Download Icon Button on corner */}
                    <button
                      type="button"
                      onClick={async () => {
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                          `upi://pay?pa=manish12643@okhdfcbank&pn=CheckRooms&am=${selectedPlan === "basic" ? "19" : "49"}&cu=INR`
                        )}`;
                        try {
                          const res = await fetch(qrUrl);
                          const blob = await res.blob();
                          const blobUrl = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = blobUrl;
                          a.download = `CheckRooms_QR_${selectedPlan === "basic" ? "19" : "49"}.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(blobUrl);
                        } catch (e) {
                          window.open(qrUrl, "_blank");
                        }
                      }}
                      title="Download QR Code"
                      className="absolute -bottom-2 -right-2 bg-[#5B2BE0] hover:bg-[#4A20C0] text-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-600 mt-2.5">UPI: manish12643@okhdfcbank</span>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                        `upi://pay?pa=manish12643@okhdfcbank&pn=CheckRooms&am=${selectedPlan === "basic" ? "19" : "49"}&cu=INR`
                      )}`;
                      try {
                        const res = await fetch(qrUrl);
                        const blob = await res.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = `CheckRooms_QR_${selectedPlan === "basic" ? "19" : "49"}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(blobUrl);
                      } catch (e) {
                        window.open(qrUrl, "_blank");
                      }
                    }}
                    className="mt-1 text-[10px] font-bold text-[#5B2BE0] hover:text-[#4A20C0] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download QR</span>
                  </button>
                </div>

                {/* Upload screenshot (Strictly Mandatory) */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#151538] flex items-center gap-1">
                      <span>Upload Payment Receipt</span>
                      <span className="text-red-500 font-black">* (Required)</span>
                    </label>
                    {receiptFile && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Receipt Ready</span>
                      </span>
                    )}
                  </div>

                  {receiptFile ? (
                    <div className="bg-[#FAF9FE] border border-[#E8DCFE] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#5B2BE0] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-manrope font-bold text-xs sm:text-[13px] text-[#151538] truncate">
                            {receiptFile.name}
                          </h5>
                          <p className="text-[10.5px] text-[#8C8CA1] font-medium">
                            {receiptFile.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptFile(null);
                            setScreenshotUrl("");
                          }}
                          className="text-[11px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer ml-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#5B2BE0]/35 hover:border-[#5B2BE0] bg-[#FAF8FE] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#F5EFFF]/50">
                      <div className="w-10 h-10 rounded-xl bg-[#5B2BE0]/10 text-[#5B2BE0] flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-[13px] font-bold text-[#5B2BE0]">
                          Click to upload payment screenshot / receipt
                        </p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, JPEG (Required for verification)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const sizeInKB = Math.round(file.size / 1024);
                            const sizeStr = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;
                            const url = URL.createObjectURL(file);
                            setScreenshotUrl(url);
                            setReceiptFile({
                              name: file.name,
                              size: sizeStr,
                              url: url
                            });
                            setReceiptError(null);
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  )}

                  {receiptError && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1.5 justify-center bg-red-50 border border-red-200 py-2 px-3 rounded-xl mt-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{receiptError}</span>
                    </p>
                  )}

                  {!receiptFile && !receiptError && (
                    <p className="text-[10.5px] text-amber-600 font-semibold flex items-center gap-1">
                      <span>⚠️ Please upload payment proof before submitting.</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("plans")}
                    className="w-24 sm:w-28 py-3 rounded-xl bg-[#F4EFFF] border border-[#6C4CF1]/30 hover:bg-[#6C4CF1] hover:text-white text-[#6C4CF1] text-xs sm:text-sm font-bold transition-all active:scale-98 cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!receiptFile || !screenshotUrl || isSubmittingBoost}
                    onClick={async () => {
                      if (!receiptFile || !screenshotUrl) {
                        setReceiptError("Payment receipt / screenshot upload karna zaroori hai!");
                        return;
                      }

                      setIsSubmittingBoost(true);
                      const targetListing = boostingListing || listings[0];
                      const planName = selectedPlan === "basic" ? "Standard Boost (₹19 - 7 Days)" : "Ultra Boost (₹49 - 1 Month)";
                      const planAmount = selectedPlan === "basic" ? 19 : 49;

                      try {
                        if (targetListing?.id) {
                          const res = await ownerFetch(getApiUrl(`/api/listings/${targetListing.id}/boost`), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              plan: planName,
                              amount: planAmount,
                              screenshot: screenshotUrl
                            })
                          });
                          if (res.ok) {
                            await loadOwnerData();
                          }
                        }
                      } catch (err) {}

                      const newBoostRecord: BoostHistoryRecord = {
                        id: `bh_${Date.now()}`,
                        propertyId: targetListing?.id || "1",
                        propertyTitle: targetListing?.title || "Property",
                        propertyImage: targetListing?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
                        plan: selectedPlan === "basic" ? "Standard Boost (7 Days)" : "Ultra Boost (1 Month / 30 Days)",
                        amount: planAmount,
                        startDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                        expiryDate: new Date(Date.now() + (selectedPlan === "basic" ? 7 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                        status: "Active"
                      };

                      setBoostHistory((prev) => [newBoostRecord, ...prev]);

                      setNotifications((prev) => [
                        {
                          id: `notif_${Date.now()}`,
                          message: `Boost request submitted for ${targetListing?.title || "Property"} (${planName}). Verification will be completed within 1-2 hours!`,
                          time: "Just now",
                          read: false
                        },
                        ...prev
                      ]);

                      setIsSubmittingBoost(false);
                      setCheckoutStep("success");
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 text-center ${
                      !receiptFile || !screenshotUrl
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                        : "bg-gradient-to-r from-[#FF7A00] via-[#FF6600] to-[#FF4D00] hover:from-[#FF6600] hover:to-[#E63900] text-white shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer"
                    }`}
                  >
                    {isSubmittingBoost ? "Submitting..." : "Submit Receipt"}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: SUCCESS (EXACT MATCH TO REFERENCE DESIGN) */}
            {/* ========================================================================= */}
            {checkoutStep === "success" && (
              <div className="relative text-center py-2 space-y-4 animate-fadeIn">
                
                {/* Top-Right Close Button */}
                <button 
                  type="button"
                  onClick={() => setShowBoostModal(false)} 
                  className="absolute -top-3 sm:-top-4 -right-2 sm:-right-4 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* 1. Green Checkmark with Floating Confetti Diamonds */}
                <div className="relative mx-auto w-28 h-24 flex items-center justify-center select-none pt-1">
                  {/* Confetti Particles */}
                  <span className="absolute top-2 left-6 w-2 h-2 rounded-[2px] bg-[#F59E0B] rotate-45 animate-pulse" />
                  <span className="absolute top-1 right-8 w-2 h-2 rounded-[2px] bg-[#8B5CF6] rotate-45" />
                  <span className="absolute top-12 -right-1 w-2.5 h-2.5 rounded-[2px] bg-[#EC4899] rotate-45" />
                  <span className="absolute top-9 left-2 w-2 h-2 rounded-[2px] bg-[#06B6D4] rotate-45" />
                  <span className="absolute top-6 right-3 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="absolute bottom-2 left-5 w-2 h-2 rounded-[2px] bg-[#F97316] rotate-45" />
                  <span className="absolute bottom-3 right-6 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />

                  {/* Green Circle with Animated Draw Checkmark */}
                  <div className="w-20 h-20 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shadow-xs">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-10 h-10 text-[#16A34A] animate-check-draw" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M4.5 12.5L9.5 17.5L19.5 6.5" />
                    </svg>
                  </div>
                </div>

                {/* 2. Main Title & Subtitle */}
                <div className="space-y-1 text-center">
                  <h3 className="font-manrope font-bold text-2xl text-[#1E2235] tracking-tight">
                    Payment Submitted!
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#666680] leading-relaxed">
                    Your payment receipt has been submitted successfully.<br />
                    We will verify your payment within 1-2 hours.
                  </p>
                </div>

                {/* 3. Three-Step Horizontal Progress Stepper */}
                <div className="relative py-2 my-2">
                  {/* Connecting Line */}
                  <div className="absolute left-12 right-12 top-6.5 h-[1.5px] bg-[#E8E8F0] -z-0" />

                  <div className="grid grid-cols-3 gap-2 relative z-10 text-center">
                    {/* Step 1: Payment Submitted */}
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h5 className="font-manrope font-bold text-[11px] sm:text-xs text-[#1E2235] mt-2">
                        1. Payment Submitted
                      </h5>
                      <p className="text-[9.5px] sm:text-[10px] text-[#8C8CA1] mt-0.5 leading-tight">
                        Receipt submitted<br />successfully
                      </p>
                    </div>

                    {/* Step 2: Under Verification */}
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-[#5B2BE0] text-white flex items-center justify-center shadow-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h5 className="font-manrope font-bold text-[11px] sm:text-xs text-[#1E2235] mt-2">
                        2. Under Verification
                      </h5>
                      <p className="text-[9.5px] sm:text-[10px] text-[#8C8CA1] mt-0.5 leading-tight">
                        We verify within<br />1-2 hours
                      </p>
                    </div>

                    {/* Step 3: Boost Live */}
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-[#E8E8F0] text-[#8C8CA1] flex items-center justify-center">
                        <Rocket className="w-4 h-4" />
                      </div>
                      <h5 className="font-manrope font-bold text-[11px] sm:text-xs text-[#1E2235] mt-2">
                        3. Boost Live
                      </h5>
                      <p className="text-[9.5px] sm:text-[10px] text-[#8C8CA1] mt-0.5 leading-tight">
                        Your listing goes<br />live after approval
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Info Callout Banner */}
                <div className="bg-[#F3EEFF] border border-[#E8DCFE]/60 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-[#5B2BE0] text-white flex items-center justify-center shrink-0 text-xs font-serif font-bold">
                    i
                  </div>
                  <p className="text-xs sm:text-[12.5px] text-[#4A4A68] font-medium leading-relaxed">
                    You will receive a notification once your payment is verified and your listing is boosted.
                  </p>
                </div>

                {/* 5. Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBoostModal(false)}
                    className="w-full bg-[#5B2BE0] hover:bg-[#4D22C4] text-white font-manrope font-bold text-sm py-3.5 px-6 rounded-2xl cursor-pointer shadow-md shadow-[#5B2BE0]/20 active:scale-98 transition-all"
                  >
                    Okay, Got It
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 7.4 INCOMPLETE PROFILE MODAL (Requires full owner info before listing) */}
      {/* ========================================================================= */}
      {showIncompleteProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            onClick={() => setShowIncompleteProfileModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl z-10 text-left space-y-5 border border-[#E8E8F0]">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F3EEFF] text-[#5B2BE0] flex items-center justify-center shrink-0 shadow-sm shadow-[#5B2BE0]/20">
                  <UserRound className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-manrope font-black text-lg text-[#151538] leading-tight">
                    Complete Your Profile First
                  </h3>
                  <p className="text-xs text-[#8C8CA1] font-semibold mt-0.5">
                    Required to post & manage room listings
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowIncompleteProfileModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation */}
            <p className="text-xs sm:text-[13px] text-[#555570] leading-relaxed">
              When tenants browse your listing, they connect with you directly via <b>Phone Call</b> and <b>WhatsApp</b>. Please fill in your complete landlord contact details to continue.
            </p>

            {/* Field Status Checklist */}
            {(() => {
              const status = getProfileCompletionStatus();
              return (
                <div className="bg-[#FAF8FE] border border-[#E9DCFF] rounded-2xl p-4 space-y-2.5 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B2BE0] block mb-1">
                    Profile Checklist
                  </span>

                  {/* Name */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name</span>
                    </span>
                    {status.hasName ? (
                      <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Complete ({profileName})
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        ✗ Missing Name
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Calling Number</span>
                    </span>
                    {status.hasPhone ? (
                      <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Complete ({profilePhone})
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        ✗ Missing Phone
                      </span>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>WhatsApp Number</span>
                    </span>
                    {status.hasWhatsApp ? (
                      <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Complete ({profileWhatsApp})
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        ✗ Missing WhatsApp
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                    </span>
                    {status.hasEmail ? (
                      <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Complete
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        ✗ Missing Email
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIncompleteProfileModal(false)}
                className="w-24 sm:w-28 py-3 rounded-xl border border-[#E8E8F0] hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-bold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteProfileModal(false);
                  setActiveScreen("profile");
                  setIsEditingProfile(true);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#5B2BE0] hover:bg-[#4D22C4] text-white text-xs sm:text-sm font-extrabold transition-all duration-200 shadow-md shadow-[#5B2BE0]/20 active:scale-98 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>Complete Profile Now</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7.5 DELETE ACCOUNT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowDeleteAccountModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-manrope font-black text-lg text-[#151538]">Delete Account?</h3>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Permanent Action</span>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteAccountModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl space-y-1.5 text-xs text-red-900">
                <p className="font-bold flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Warning: This cannot be undone!</span>
                </p>
                <p className="text-[11.5px] text-red-800 leading-relaxed">
                  All your active room listings (<b>{listings.length} live</b>), lead inquiries, boost records, and host profile data will be permanently wiped from the database.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#151538]">
                  Type <span className="text-red-600 font-black">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] text-xs font-bold uppercase tracking-wider outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#E8E8F0] text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeletingAccount}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 8. MOBILE DRAWER SIDEBAR */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative w-[280px] bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto no-scrollbar z-10 text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F2F5]">
                <Link href="/" className="flex items-center gap-2.5 group text-left shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white shadow-sm shadow-[#6C4CF1]/20 shrink-0">
                    <Home className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="inline-flex items-center font-poppins font-black text-xl tracking-tight select-none transform scale-y-[1.18] origin-left leading-none">
                      <span className="text-[#1E2235]">Check</span>
                      <span className="text-[#6C4CF1]">Rooms</span>
                    </span>
                    <span className="text-[9.5px] text-[#8C8CA1] font-medium tracking-tight mt-1">
                      Simplifying Room Hunting
                    </span>
                  </div>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Owner Profile", icon: UserRound },
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "listings", label: "My Listings", icon: House },
                  { id: "boost", label: "Boost Listing", icon: Rocket },
                  { id: "bookings", label: "Bookings", icon: CalendarDays },
                  { id: "settings", label: "Profile Settings", icon: Settings },
                  { id: "help", label: "Help & Support", icon: CircleHelp },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id as any);
                        if (item.id === "boost") {
                          openBoostModalForListing();
                        } else if (item.id === "settings") {
                          setActiveScreen("profile");
                        } else if (item.id === "help") {
                          setActiveScreen("help");
                        } else if (item.id === "listings") {
                          setActiveScreen("listings");
                        } else if (item.id === "bookings") {
                          setActiveScreen("bookings");
                        } else {
                          setActiveScreen("dashboard");
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#151538] hover:bg-[#F3EEFF] cursor-pointer"
                    >
                      <Icon className="w-4.5 h-4.5 text-[#5B2BE0]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
