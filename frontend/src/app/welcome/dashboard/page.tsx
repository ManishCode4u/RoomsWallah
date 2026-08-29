"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, 
  Plus, 
  ListTodo, 
  MessageSquare, 
  User, 
  Bell, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Camera,
  MapPin,
  Check,
  X,
  Eye,
  Edit3,
  Power,
  Lightbulb,
  Sparkles,
  MoreVertical,
  Phone,
  Mail,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { getApiUrl, getImageUrl } from "@/data/api";

interface Listing {
  id: string;
  title: string;
  location: string;
  sharing: string;
  rent: number;
  facilities: string[];
  status: "Active" | "Inactive";
  date: string;
  image: string;
  type?: "room" | "pg" | "hostel";
}

export default function HostDashboard() {
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

  const [activeScreen, setActiveScreen] = useState<"dashboard" | "step1" | "step2" | "step3" | "step4" | "step5" | "listings" | "profile" | "inquiries">("dashboard");
  const [listingTab, setListingTab] = useState<"all" | "active" | "inactive">("active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<{
    title: string;
    description: string;
    videoUrl: string;
  } | null>(null);

  // Notifications states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Profile settings states
  const [profileName, setProfileName] = useState("Manish Kumar");
  const [profileEmail, setProfileEmail] = useState("manish.kumar@roomswallah.com");
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210");
  const [profileWhatsApp, setProfileWhatsApp] = useState("+91 98765 43210");
  const [supportSubject, setSupportSubject] = useState("General Help");
  const [supportMessage, setSupportMessage] = useState("");
  const [showSupportForm, setShowSupportForm] = useState(false);

  // Boosting & Manual Payment Verification States
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostRequests, setBoostRequests] = useState<any[]>([]);
  const [promotedListingIds, setPromotedListingIds] = useState<string[]>([]);
  const [boostingListing, setBoostingListing] = useState<Listing | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"list" | "plans" | "payment" | "submitting" | "success">("list");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("basic");
  const [screenshotFileUrl, setScreenshotFileUrl] = useState<string>("");
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  const getGreetingMessage = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 17) return "Good afternoon";
    return "Good evening";
  };

  const getProfileStrength = () => {
    let score = 0;
    if (profileName && profileName.trim() && profileName !== "Owner" && profileName !== "Manish Kumar") score += 25;
    else if (profileName && profileName.trim()) score += 15;
    
    if (profileEmail && profileEmail.trim() && profileEmail !== "manish.kumar@roomswallah.com") score += 25;
    else if (profileEmail && profileEmail.trim()) score += 15;
    
    if (profilePhone && profilePhone.trim() && profilePhone !== "+91 98765 43210") score += 25;
    else if (profilePhone && profilePhone.trim()) score += 10;
    
    if (profileWhatsApp && profileWhatsApp.trim() && profileWhatsApp !== "+91 98765 43210") score += 25;
    else if (profileWhatsApp && profileWhatsApp.trim()) score += 10;
    
    return Math.min(score, 100);
  };

  const fetchNotifications = async () => {
    try {
      const res = await ownerFetch(getApiUrl("/api/notifications"), {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const res = await ownerFetch(getApiUrl(`/api/notifications/${id}/read`), {
        method: "PATCH",
        credentials: "include"
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const res = await ownerFetch(getApiUrl("/api/notifications"), {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const fetchBoostData = async () => {
    try {
      const [resSlots, resMyRequests] = await Promise.all([
        ownerFetch(getApiUrl("/api/promotions/slots")),
        ownerFetch(getApiUrl("/api/listings/boost-requests/my-requests"), { credentials: "include" })
      ]);

      if (resSlots.ok) {
        const slots = await resSlots.json();
        if (Array.isArray(slots)) {
          const activeIds = slots
            .filter((slot: any) => slot.status === "Active" && slot.listingId)
            .map((slot: any) => slot.listingId);
          setPromotedListingIds(activeIds);
        }
      }

      if (resMyRequests.ok) {
        const reqs = await resMyRequests.json();
        if (Array.isArray(reqs)) {
          setBoostRequests(reqs);
        }
      }
    } catch (err) {
      console.error("Error fetching boost data on dashboard:", err);
    }
  };

  const fetchOwnerInquiries = async () => {
    try {
      const res = await ownerFetch(getApiUrl("/api/listings/inquiries/my-inquiries"), {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setInquiries(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch inquiries for dashboard from backend:", err);
    }
  };

  useEffect(() => {
    // Capture Google login credentials from URL parameters if redirected
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");
      if (urlToken) {
        localStorage.setItem("owner_token", urlToken);
        localStorage.setItem("owner_logged_in", "true");
        
        const urlName = urlParams.get("owner_name");
        if (urlName) {
          localStorage.setItem("owner_name", decodeURIComponent(urlName));
          setProfileName(decodeURIComponent(urlName));
        }
        
        const urlEmail = urlParams.get("owner_email");
        if (urlEmail) {
          localStorage.setItem("owner_email", decodeURIComponent(urlEmail));
          setProfileEmail(decodeURIComponent(urlEmail));
        }
        
        const urlPhone = urlParams.get("owner_phone");
        if (urlPhone) {
          localStorage.setItem("owner_phone", decodeURIComponent(urlPhone));
          localStorage.setItem("owner_whatsapp", decodeURIComponent(urlPhone));
          setProfilePhone(decodeURIComponent(urlPhone));
          setProfileWhatsApp(decodeURIComponent(urlPhone));
        }

        // Clean URL parameters from display
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const checkAuth = async () => {
      try {
        const res = await ownerFetch(getApiUrl("/api/auth/me"), {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.owner) {
            const owner = data.owner;
            setProfileName(owner.fullName);
            setProfileEmail(owner.email || "");
            if (owner.mobile) setProfilePhone(owner.mobile);
            if (owner.mobile) setProfileWhatsApp(owner.mobile);
            
            localStorage.setItem("owner_logged_in", "true");
            localStorage.setItem("owner_name", owner.fullName);
            localStorage.setItem("owner_email", owner.email || "");
            if (owner.mobile) localStorage.setItem("owner_phone", owner.mobile);
            if (owner.mobile) localStorage.setItem("owner_whatsapp", owner.mobile);
          }
        } else {
          // If not authenticated, clear local storage and redirect to login
          localStorage.removeItem("owner_logged_in");
          router.push("/welcome");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // Fallback to local storage if API is temporarily unavailable
        const isLoggedIn = localStorage.getItem("owner_logged_in");
        if (!isLoggedIn) {
          router.push("/welcome");
        }
      }
    };

    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("owner_name");
      if (savedName) setProfileName(savedName);
      const savedEmail = localStorage.getItem("owner_email");
      if (savedEmail) setProfileEmail(savedEmail);
      const savedPhone = localStorage.getItem("owner_phone");
      if (savedPhone) setProfilePhone(savedPhone);
      const savedWhatsApp = localStorage.getItem("owner_whatsapp");
      if (savedWhatsApp) setProfileWhatsApp(savedWhatsApp);
    }

    checkAuth();

    const fetchOwnerListings = async () => {
      let apiOwnerListings: Listing[] = [];
      try {
        const res = await ownerFetch(getApiUrl("/api/listings/my-listings"), {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            apiOwnerListings = data.map((item: any) => ({
              id: item._id || item.id,
              title: item.title,
              location: `${item.area || ""}, ${item.city || ""}`,
              sharing: item.sharing || "Single Room",
              rent: item.rent,
              facilities: item.amenities || [],
              status: item.listingStatus === "active" ? "Active" : "Inactive",
              date: item.createdAt ? `Listed on ${new Date(item.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}` : "Listed on Just Now",
              image: item.image,
              type: item.type
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch listings for dashboard from backend:", err);
      }

      let localOwnerListings: Listing[] = [];
      if (typeof window !== "undefined") {
        try {
          const localProps = JSON.parse(localStorage.getItem("roomswallah_properties") || "[]");
          if (Array.isArray(localProps)) {
            localOwnerListings = localProps.map((item: any) => ({
              id: item.id || item._id,
              title: item.title,
              location: `${item.area || ""}, ${item.city || ""}`,
              sharing: item.sharing || "Single Room",
              rent: item.rent || 0,
              facilities: item.amenities || item.facilities || [],
              status: "Active",
              date: "Listed on Just Now",
              image: item.image || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80",
              type: item.type
            }));
          }
        } catch (e) {}
      }

      const apiIds = new Set(apiOwnerListings.map((p) => p.id));
      const combinedListings = [...apiOwnerListings, ...localOwnerListings.filter((p) => !apiIds.has(p.id))];

      setListings(combinedListings);
    };
    fetchOwnerListings();
    fetchNotifications();

      fetchBoostData();
      fetchOwnerInquiries();

    const fetchGuide = async () => {
      try {
        const res = await ownerFetch(getApiUrl("/api/admin/guide"));
        if (res.ok) {
          const data = await res.json();
          if (data && data.videoUrl) {
            setGuideData(data);
          }
        }
      } catch (e) {
        console.error("Error fetching guide settings on dashboard:", e);
      }
    };
    fetchGuide();
  }, [router]);

  // Close 3-dot menu and notifications dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openMenuId && !target.closest(".actions-panel-container")) {
        setOpenMenuId(null);
      }
      if (showNotificationsDropdown && !target.closest(".notifications-bell-container")) {
        setShowNotificationsDropdown(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openMenuId, showNotificationsDropdown]);

  const [hostType, setHostType] = useState("Owner"); // Owner, Broker, Manager
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid screenshot image file.");
        return;
      }
      setIsUploadingScreenshot(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await ownerFetch(getApiUrl("/api/upload"), {
          method: "POST",
          credentials: "include",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.imageUrl) {
            setScreenshotFileUrl(getApiUrl(data.imageUrl));
          }
        } else {
          const errData = await res.json();
          alert(errData.message || "Failed to upload screenshot.");
        }
      } catch (err) {
        console.error("Error uploading screenshot:", err);
        alert("Error connecting to backend server.");
      } finally {
        setIsUploadingScreenshot(false);
        e.target.value = "";
      }
    }
  };

  const handleVerifySubmit = async () => {
    if (!boostingListing) return;
    if (!screenshotFileUrl) {
      alert("Please upload your payment screenshot first!");
      return;
    }

    setCheckoutStep("submitting");

    try {
      const planName = selectedPlan === "basic" ? "Quick Boost (₹19)" : "Ultra Boost (₹49)";
      const planAmt = selectedPlan === "basic" ? 19 : 49;

      const res = await ownerFetch(getApiUrl(`/api/listings/${boostingListing.id}/boost`), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan: planName,
          amount: planAmt,
          screenshot: screenshotFileUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh boost requests
        const resRequests = await ownerFetch(getApiUrl("/api/listings/boost-requests/my-requests"), { credentials: "include" });
        if (resRequests.ok) {
          const reqs = await resRequests.json();
          setBoostRequests(reqs);
        }
        setScreenshotFileUrl("");
        setCheckoutStep("success");
      } else {
        alert(data.message || "Failed to submit verification request.");
        setCheckoutStep("payment");
      }
    } catch (err) {
      console.error("Failed to submit verification screenshot:", err);
      alert("Error submitting request. Please try again.");
      setCheckoutStep("payment");
    }
  };

  // Form states
  const [propertyType, setPropertyType] = useState<"room" | "pg" | "hostel">("room");
  const [pgName, setPgName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [roomType, setRoomType] = useState("Single");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [foodFacility, setFoodFacility] = useState("Yes");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
  const [customFacilities, setCustomFacilities] = useState<string[]>([]);
  const [showFacilityInput, setShowFacilityInput] = useState(false);
  const [facilityValue, setFacilityValue] = useState("");

  const [selectedFurniture, setSelectedFurniture] = useState<string[]>(["Bed", "Study Table", "Chair"]);
  const [customFurniture, setCustomFurniture] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const toggleFurnitureItem = (item: string) => {
    if (selectedFurniture.includes(item)) {
      setSelectedFurniture(selectedFurniture.filter((x) => x !== item));
    } else {
      setSelectedFurniture([...selectedFurniture, item]);
    }
  };

  const handleAddCustomFurniture = () => {
    if (customValue.trim()) {
      const item = customValue.trim();
      if (!customFurniture.includes(item)) {
        setCustomFurniture([...customFurniture, item]);
      }
      if (!selectedFurniture.includes(item)) {
        setSelectedFurniture([...selectedFurniture, item]);
      }
      setCustomValue("");
      setShowCustomInput(false);
    }
  };

  const handleAddCustomFacility = () => {
    if (facilityValue.trim()) {
      const item = facilityValue.trim();
      if (!customFacilities.includes(item)) {
        setCustomFacilities([...customFacilities, item]);
      }
      if (!selectedFacilities.includes(item)) {
        setSelectedFacilities([...selectedFacilities, item]);
      }
      setFacilityValue("");
      setShowFacilityInput(false);
    }
  };

  const [rules, setRules] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size is too large (max 5MB).");
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await ownerFetch(getApiUrl("/api/upload"), {
          method: "POST",
          credentials: "include",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.imageUrl) {
            // Prepend hostname so frontend loads it from backend
            const fullUrl = getApiUrl(data.imageUrl);
            setPhotos((prev) => [...prev, fullUrl]);
          }
        } else {
          const errData = await res.json();
          alert(errData.message || "Failed to upload image.");
        }
      } catch (err) {
        console.error("Error uploading photo:", err);
        alert("Error connecting to backend server.");
      } finally {
        setIsUploading(false);
        // Reset file input value so same file can be uploaded again if deleted
        e.target.value = "";
      }
    }
  };

  // Initial listings (empty by default, loaded from backend)
  const [listings, setListings] = useState<Listing[]>([]);

  // Map step index for indicator
  const getStepIndex = () => {
    if (activeScreen === "step1") return 1;
    if (activeScreen === "step2") return 2;
    if (activeScreen === "step3") return 3;
    if (activeScreen === "step4") return 4;
    if (activeScreen === "step5") return 5;
    return 0;
  };

  const currentStepIndex = getStepIndex();

  // Toggle facilities
  const toggleFacility = (facility: string) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((x) => x !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  // Handle list status toggle
  const toggleListStatus = async (id: string) => {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;

    const nextStatus = listing.status === "Active" ? "Inactive" : "Active";
    const apiStatus = nextStatus === "Active" ? "active" : "hidden";

    try {
      const res = await ownerFetch(getApiUrl(`/api/listings/${id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: apiStatus }),
        credentials: "include"
      });

      if (res.ok) {
        setListings(listings.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status: nextStatus
            };
          }
          return item;
        }));
        alert(`Listing is now ${nextStatus === "Active" ? "Activated" : "Deactivated"}!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to update listing status.");
      }
    } catch (err) {
      console.error("Error updating listing status:", err);
      alert("Error connecting to backend database.");
    }
  };

  // Handle delete listing from database & local storage
  const handleDeleteListing = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await ownerFetch(getApiUrl(`/api/listings/${id}`), {
          method: "DELETE",
          credentials: "include"
        });
      } catch (err) {
        console.error("Error deleting listing from backend:", err);
      }

      setListings((prev) => prev.filter((item) => item.id !== id));

      if (typeof window !== "undefined") {
        try {
          const localProps = JSON.parse(localStorage.getItem("roomswallah_properties") || "[]");
          const updated = localProps.filter((p: any) => p.id !== id && p._id !== id);
          localStorage.setItem("roomswallah_properties", JSON.stringify(updated));
          window.dispatchEvent(new Event("roomswallahPropertiesUpdated"));
        } catch (e) {}
      }

      alert("Listing deleted successfully!");
    }
  };

  // Helper to sync created property to local storage
  const syncToLocalStorage = (propertyItem: any) => {
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("roomswallah_properties") || "[]");
        const updated = [propertyItem, ...existing.filter((p: any) => p.id !== propertyItem.id)];
        localStorage.setItem("roomswallah_properties", JSON.stringify(updated));
        window.dispatchEvent(new Event("roomswallahPropertiesUpdated"));
      } catch (err) {
        console.error("Error saving property to localStorage:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingListingId(null);
    setPgName("");
    setDescription("");
    setAddress("");
    setArea("");
    setCity("");
    setPincode("");
    setRoomType("Single");
    setRent("");
    setDeposit("");
    setFoodFacility("Yes");
    setSelectedFacilities(["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
    setCustomFacilities([]);
    setSelectedFurniture(["Bed", "Study Table", "Chair"]);
    setCustomFurniture([]);
    setRules("");
    setPhotos([]);
  };

  // Helper to start editing a listing
  const startEditingListing = async (id: string) => {
    let itemToEdit: any = listings.find((x) => x.id === id);

    if (typeof window !== "undefined") {
      try {
        const localProps = JSON.parse(localStorage.getItem("roomswallah_properties") || "[]");
        const foundLocal = localProps.find((p: any) => p.id === id);
        if (foundLocal) {
          itemToEdit = { ...itemToEdit, ...foundLocal };
        }
      } catch (e) {}
    }

    try {
      const res = await ownerFetch(getApiUrl(`/api/listings/${id}`));
      if (res.ok) {
        const apiData = await res.json();
        if (apiData) {
          itemToEdit = { ...itemToEdit, ...apiData };
        }
      }
    } catch (e) {}

    if (!itemToEdit) {
      alert("Unable to load listing details for editing.");
      return;
    }

    setEditingListingId(id);
    setPropertyType(itemToEdit.type || "room");
    setPgName(itemToEdit.title || "");
    setRent(itemToEdit.rent ? String(itemToEdit.rent) : "");
    setDescription(itemToEdit.description || "");
    setCity(itemToEdit.city || (itemToEdit.location ? itemToEdit.location.split(",")[1]?.trim() : ""));
    setArea(itemToEdit.area || (itemToEdit.location ? itemToEdit.location.split(",")[0]?.trim() : ""));
    setAddress(itemToEdit.address || "");
    setPincode(itemToEdit.pincode || "");
    setDeposit(itemToEdit.deposit ? String(itemToEdit.deposit) : "");
    setFoodFacility(itemToEdit.foodFacility || "Yes");
    setRules(itemToEdit.rules || "");

    if (itemToEdit.sharing) {
      const cleanSharing = itemToEdit.sharing.replace(" Room", "").replace(" Sharing", "");
      setRoomType(cleanSharing || "Single");
    }

    if (itemToEdit.amenities && Array.isArray(itemToEdit.amenities) && itemToEdit.amenities.length > 0) {
      setSelectedFacilities(itemToEdit.amenities);
    } else if (itemToEdit.facilities && Array.isArray(itemToEdit.facilities)) {
      setSelectedFacilities(itemToEdit.facilities);
    }

    if (itemToEdit.images && Array.isArray(itemToEdit.images) && itemToEdit.images.length > 0) {
      setPhotos(itemToEdit.images);
    } else if (itemToEdit.image) {
      setPhotos([itemToEdit.image]);
    }

    setActiveScreen("step1");
  };

  // Submit / Update Listing wizard
  const handleSubmitListing = async () => {
    const rawDescription = description.trim();
    const finalDescription = rawDescription.length >= 10
      ? rawDescription
      : rawDescription.length > 0
      ? `${rawDescription} - Comfortable and clean place available.`
      : "Cozy and well-maintained property available for rent with all modern amenities.";

    const rawPincode = pincode.trim();
    const finalPincode = /^\d{6}$/.test(rawPincode) ? rawPincode : "";

    const payload = {
      title: pgName || "Cozy Student PG",
      type: propertyType,
      rent: parseInt(rent) || 5000,
      city: city || "Greater Noida",
      area: area || "Knowledge Park 3",
      image: photos[0] || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80",
      images: photos,
      description: finalDescription,
      amenities: [...selectedFacilities, ...selectedFurniture],
      ownerName: profileName || "Owner",
      ownerPhone: profilePhone || "9876543210",
      ownerWhatsApp: profileWhatsApp || profilePhone || "9876543210",
      tag: hostType === "Owner" ? "Boys Only" : hostType === "Broker" ? "Girls Only" : "Family",
      furnishing: selectedFurniture.length > 0 ? "Semi Furnished" : "Unfurnished",
      sharing: `${roomType} Room`,
      address: address,
      pincode: finalPincode,
      deposit: parseInt(deposit) || 0,
      foodFacility: foodFacility,
      rules: rules
    };

    // EDIT/UPDATE existing listing
    if (editingListingId) {
      let isUpdatedInDB = false;
      try {
        const res = await ownerFetch(getApiUrl(`/api/listings/${editingListingId}`), {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          isUpdatedInDB = true;
          alert("Listing updated successfully!");
        } else {
          console.warn("Backend update error:", await res.text());
        }
      } catch (err) {
        console.error("Error updating listing in backend:", err);
      }

      const updatedFullProperty = {
        id: editingListingId,
        title: payload.title,
        type: payload.type,
        rent: payload.rent,
        city: payload.city,
        area: payload.area,
        image: payload.image,
        images: payload.images,
        description: payload.description,
        amenities: payload.amenities,
        ownerName: payload.ownerName,
        ownerPhone: payload.ownerPhone,
        ownerWhatsApp: payload.ownerWhatsApp,
        tag: payload.tag,
        rating: 4.8,
        furnishing: payload.furnishing,
        sharing: payload.sharing,
        deposit: payload.deposit,
        address: payload.address,
        pincode: payload.pincode,
        foodFacility: payload.foodFacility,
        rules: payload.rules
      };

      setListings(listings.map((item) => {
        if (item.id === editingListingId) {
          return {
            ...item,
            title: payload.title,
            location: `${payload.area}, ${payload.city}`,
            sharing: payload.sharing,
            rent: payload.rent,
            facilities: payload.amenities,
            image: payload.image,
            type: payload.type
          };
        }
        return item;
      }));

      syncToLocalStorage(updatedFullProperty);

      if (!isUpdatedInDB) {
        alert("Listing updated successfully!");
      }

      setEditingListingId(null);
      setActiveScreen("listings");

      // Clear inputs
      setPgName("");
      setDescription("");
      setAddress("");
      setArea("");
      setCity("");
      setPincode("");
      setRoomType("Single");
      setRent("");
      setDeposit("");
      setFoodFacility("Yes");
      setSelectedFacilities(["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
      setCustomFacilities([]);
      setSelectedFurniture(["Bed", "Study Table", "Chair"]);
      setCustomFurniture([]);
      setRules("");
      setPhotos([]);
      return;
    }

    // CREATE NEW LISTING
    let createdId = `lst_${Date.now()}`;
    let isSavedToDB = false;

    try {
      const res = await ownerFetch(getApiUrl("/api/listings"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedListing = await res.json();
        createdId = savedListing._id || savedListing.id || createdId;
        isSavedToDB = true;
        alert("Listing published successfully and live on website!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        let errorMsg = errorData.message || "Failed to save listing to backend database.";
        if (errorData.errors) {
          const errorsStr = Object.entries(errorData.errors)
            .map(([field, err]: [string, any]) => {
              const messages = err._errors ? err._errors.join(", ") : JSON.stringify(err);
              return `- ${field}: ${messages}`;
            })
            .join("\n");
          errorMsg += `\n\nValidation Details:\n${errorsStr}`;
        }
        console.warn("Backend save warning:", errorMsg);
      }
    } catch (err) {
      console.error("Error submitting listing to backend:", err);
    }

    // Always create full property object for local state & storage sync
    const fullProperty = {
      id: createdId,
      title: payload.title,
      type: payload.type,
      rent: payload.rent,
      city: payload.city,
      area: payload.area,
      image: payload.image,
      images: payload.images,
      description: payload.description,
      amenities: payload.amenities,
      ownerName: payload.ownerName,
      ownerPhone: payload.ownerPhone,
      ownerWhatsApp: payload.ownerWhatsApp,
      tag: payload.tag,
      rating: 4.8,
      furnishing: payload.furnishing,
      sharing: payload.sharing,
      deposit: payload.deposit,
      address: payload.address,
      pincode: payload.pincode,
      foodFacility: payload.foodFacility,
      rules: payload.rules
    };

    const newListingItem: Listing = {
      id: createdId,
      title: payload.title,
      location: `${payload.area}, ${payload.city}`,
      sharing: payload.sharing,
      rent: payload.rent,
      facilities: payload.amenities,
      status: "Active",
      date: "Listed on Just Now",
      image: payload.image,
      type: payload.type
    };

    setListings([newListingItem, ...listings]);
    syncToLocalStorage(fullProperty);

    if (!isSavedToDB) {
      alert("Listing published successfully on your website!");
    }

    setActiveScreen("listings");
    
    // Clear inputs
    setPgName("");
    setDescription("");
    setAddress("");
    setArea("");
    setCity("");
    setPincode("");
    setRoomType("Single");
    setRent("");
    setDeposit("");
    setFoodFacility("Yes");
    setSelectedFacilities(["Wi-Fi", "AC", "Food", "Geyser", "RO Water"]);
    setCustomFacilities([]);
    setSelectedFurniture(["Bed", "Study Table", "Chair"]);
    setCustomFurniture([]);
    setRules("");
    setPhotos([]);
  };

  // Filter listings based on listingTab
  const filteredListings = listings.filter((item) => {
    if (listingTab === "active") return item.status === "Active";
    if (listingTab === "inactive") return item.status === "Inactive";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans pb-24 text-sm">
      
      {/* ========================================================================= */}
      {/* APP HEADER BAR */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-[#F0F2F5] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center text-left">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9.5 h-9.5 rounded-xl bg-[#6C4CF1] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Home className="w-5 h-5" />
              </div>
              <span className="relative inline-flex items-center font-poppins font-bold text-xl tracking-tight select-none">
                <span className="relative inline-block text-[#1E2235]">
                  R
                  <svg 
                    className="absolute -bottom-[5px] left-[1px] w-[2.2em] h-[0.4em] text-[#1E2235]" 
                    viewBox="0 0 100 20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  >
                    <path d="M 5 2 C 10 18, 70 18, 95 2" />
                  </svg>
                </span>
                <span className="text-[#1E2235]">ooms</span>
                <span className="text-blue-600">Wallah</span>
              </span>
            </Link>
          </div>
          <div className="relative notifications-bell-container">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative cursor-pointer w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-[#F0F2F5] hover:bg-slate-100/50 active:scale-95 transition-all focus:outline-none"
            >
              <Bell className="w-5.5 h-5.5 text-[#1E2235]" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-[#ECECEC] rounded-[24px] shadow-[0px_8px_32px_rgba(0,0,0,0.08)] overflow-hidden z-50 text-left">
                <div className="p-4.5 border-b border-[#F0F2F5] flex items-center justify-between bg-slate-50/50">
                  <h4 className="font-poppins font-bold text-sm text-[#1E2235]">Notifications</h4>
                  <div className="flex space-x-2">
                    {notifications.some((n) => !n.read) && (
                      <button
                        onClick={async () => {
                          const unreads = notifications.filter((n) => !n.read);
                          await Promise.all(
                            unreads.map((n) => markNotificationAsRead(n._id || n.id))
                          );
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline focus:outline-none"
                      >
                        Read All
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] font-bold text-red-600 hover:underline focus:outline-none"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F0F2F5]">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id || n.id}
                        onClick={() => !n.read && markNotificationAsRead(n._id || n.id)}
                        className={`p-4 transition-colors cursor-pointer text-left ${
                          !n.read ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${
                            n.type === "error" ? "bg-red-500" :
                            n.type === "warning" ? "bg-amber-500" :
                            n.type === "success" ? "bg-emerald-500" : "bg-blue-600"
                          }`} />
                          <div className="space-y-1 min-w-0 flex-1">
                            <h5 className={`text-xs font-semibold leading-snug truncate ${
                              !n.read ? "text-[#1E2235]" : "text-slate-500"
                            }`}>
                              {n.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 leading-snug break-words">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-[#94A3B8] font-bold block pt-1">
                              {new Date(n.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 font-bold">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body Grid (Responsive desktop layout container) */}
      <div className="max-w-[1280px] mx-auto w-full px-6 pt-8 flex-grow flex flex-col justify-start">
        
        {/* ========================================================================= */}
        {/* SCREEN: HOST DASHBOARD (DESKTOP GRID / MOBILE STACKED) */}
        {/* ========================================================================= */}
        {activeScreen === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full text-left">
            
            {/* Left Column (8 Cols): Welcome & Main Actions */}
            <div className="lg:col-span-8 space-y-7">
              
              {/* User welcome panel */}
              <div className="flex bg-white p-6 sm:p-7 rounded-[28px] border border-[#ECECEC] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] items-center justify-between">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] sm:text-xs font-black uppercase text-primary tracking-widest block mb-0.5">Host Panel</span>
                  <h1 className="font-poppins font-bold text-xl sm:text-2xl text-[#1E2235] tracking-tight leading-tight">
                    {getGreetingMessage()}, {profileName} 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-[#94A3B8] font-semibold">
                    What would you like to do today?
                  </p>
                </div>
                
                {/* Profile Avatar Icon with Circular Progress */}
                <div 
                  onClick={() => setActiveScreen("profile")}
                  className="relative shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center w-16 h-16 animate-fade-in"
                >
                  {(() => {
                    const strength = getProfileStrength();
                    const radius = 24;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (strength / 100) * circumference;
                    return (
                      <>
                        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                          {/* Track circle */}
                          <circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            className="stroke-[#F0EDFF] fill-none" 
                            strokeWidth="3.5" 
                          />
                          {/* Progress circle */}
                          <circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            className="stroke-primary fill-none transition-all duration-500 ease-out" 
                            strokeWidth="3.5" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Inner Avatar */}
                        <div className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold font-poppins text-base shadow-inner">
                          {profileName.charAt(0)}
                        </div>
                        {/* Tiny completion percentage badge overlay */}
                        <span className="absolute -bottom-0.5 -right-0.5 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white leading-none shadow-xs">
                          {strength}%
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* List Room Primary CTA (Brand Theme Gradient) */}
              <button 
                onClick={() => {
                  resetForm();
                  setActiveScreen("step1");
                }}
                className="w-full bg-gradient-to-r from-primary via-violet-600 to-indigo-600 text-white p-6 sm:p-8 rounded-[28px] flex items-center space-x-5 shadow-[0px_12px_28px_rgba(108,76,241,0.15)] hover:shadow-[0px_16px_36px_rgba(108,76,241,0.25)] hover:-translate-y-0.5 active:scale-99 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Plus className="w-7 h-7 text-white stroke-[2.5]" />
                </div>
                <div className="text-left space-y-1 flex-1">
                  <span className="block font-poppins font-bold text-base sm:text-lg text-white">List Your PG / Hostel / Room</span>
                  <span className="text-xs sm:text-sm text-white/80 font-semibold block">Reach thousands of students instantly</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform animate-pulse" />
              </button>

              {/* Overview & Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Overview counts block */}
                <div className="bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-poppins font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">Overview</h3>
                    <span className="text-[10px] bg-slate-50 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-100">Real-time</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Listings card */}
                    <div 
                      onClick={() => setActiveScreen("listings")}
                      className="bg-[#F8FAFC] border border-[#F0F2F5] p-4 rounded-[20px] flex items-center space-x-3.5 cursor-pointer hover:bg-slate-100/50 hover:border-slate-300/40 transition-all duration-200"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <Home className="w-5.5 h-5.5 text-primary stroke-[2]" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-lg sm:text-2xl text-[#1E2235] leading-none">{listings.length}</span>
                        <span className="text-[10px] sm:text-xs text-[#94A3B8] font-bold block mt-1.5 uppercase leading-none">Listings</span>
                      </div>
                    </div>

                    {/* Inquiries card */}
                    <div 
                      onClick={() => setActiveScreen("inquiries")}
                      className="bg-[#F8FAFC] border border-[#F0F2F5] p-4 rounded-[20px] flex items-center space-x-3.5 hover:bg-slate-100/50 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5.5 h-5.5 stroke-[2]" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-lg sm:text-2xl text-[#1E2235] leading-none">
                          {inquiries.length}
                        </span>
                        <span className="text-[10px] sm:text-xs text-[#94A3B8] font-bold block mt-1.5 uppercase leading-none">Inquiries</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Actions block */}
                <div className="bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="font-poppins font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveScreen("listings")}
                      className="bg-[#F8FAFC] hover:bg-[#F0EDFF]/30 border border-[#F0F2F5] hover:border-primary/20 p-4 rounded-[20px] flex items-center justify-between text-left transition-all duration-200 cursor-pointer w-full group"
                    >
                      <div className="space-y-1.5 text-left">
                        <span className="block text-xs sm:text-sm font-semibold text-[#1E2235] group-hover:text-primary transition-colors">My Listings</span>
                        <span className="text-[10px] sm:text-xs text-[#94A3B8] font-normal block leading-none">Manage properties</span>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-[#94A3B8] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button 
                      onClick={() => setActiveScreen("inquiries")}
                      className="bg-[#F8FAFC] hover:bg-[#F0EDFF]/30 border border-[#F0F2F5] hover:border-primary/20 p-4 rounded-[20px] flex items-center justify-between text-left transition-all duration-200 cursor-pointer w-full group"
                    >
                      <div className="space-y-1.5 text-left">
                        <span className="block text-xs sm:text-sm font-semibold text-[#1E2235] group-hover:text-primary transition-colors">Inquiries</span>
                        <span className="text-[10px] sm:text-xs text-[#94A3B8] font-normal block leading-none">View & reply</span>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-[#94A3B8] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column (4 Cols): Side Banners & Mini List Preview */}
            <div className="lg:col-span-4 space-y-7">
              
              {/* Boost Inquiries Banner (Amber/Gold Premium style) */}
              <div className="bg-gradient-to-br from-[#FAF8FF] to-[#F1EEFF] border border-[#E0D8FF] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between h-[230px] relative overflow-hidden shadow-sm">
                <div className="space-y-3 z-10 text-left">
                  <span className="inline-flex items-center space-x-1.5 bg-white border border-[#E0D8FF] text-primary text-[10px] sm:text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Featured host</span>
                  </span>
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1E2235] leading-snug">
                    Want more inquiries?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] font-normal leading-normal">
                    Boost your listing to rank higher in student searches and get faster bookings.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setCheckoutStep("list");
                    setBoostingListing(null);
                    setShowBoostModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-500/20 active:scale-98 transition-all cursor-pointer uppercase tracking-wider mt-4"
                >
                  Boost Listing
                </button>
              </div>

              {/* Active Listings Preview (Desktop only) */}
              <div className="hidden lg:block bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F2F5]">
                  <h3 className="font-poppins font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">Your Listings</h3>
                  <button 
                    onClick={() => setActiveScreen("listings")}
                    className="text-xs sm:text-sm font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {listings.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] font-semibold py-3 text-center">No listings posted yet.</p>
                  ) : (
                    listings.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 group cursor-pointer" onClick={() => setActiveScreen("listings")}>
                        <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 bg-muted border border-[#ECECEC] relative">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className={`absolute top-1 left-1 px-1 rounded-[4px] text-[8px] font-black uppercase text-white shadow-2xs ${
                            item.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5 text-left">
                          <span className="block text-xs sm:text-sm font-semibold text-[#1E2235] truncate group-hover:text-primary transition-colors">{item.title}</span>
                          <span className="text-[10.5px] sm:text-xs text-[#94A3B8] font-normal block truncate">{item.location}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEPPER WIZARD LAYOUT (1 to 5) (DESKTOP SIDEBAR + Spacing) */}
        {/* ========================================================================= */}
        {activeScreen.startsWith("step") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full text-left">
            
            {/* Desktop Left Stepper (4 Cols) */}
            <aside className="hidden lg:block lg:col-span-4 bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.02)] space-y-6 sticky top-28">
              <h3 className="font-poppins font-bold text-sm sm:text-base text-[#1E2235] pb-3.5 border-b border-[#F0F2F5] uppercase tracking-wide">
                Listing Progress
              </h3>
              <div className="space-y-5 pt-1">
                {[
                  { step: 1, name: "Property Details", desc: "Basic information & description" },
                  { step: 2, name: "Add Photos", desc: "Upload high-quality images" },
                  { step: 3, name: "Location", desc: "Address and pin verification" },
                  { step: 4, name: "Price & Room Type", desc: "Rent, deposit, and meals options" },
                  { step: 5, name: "Facilities & Rules", desc: "Select amenities and rules" }
                ].map((s) => {
                  const isCompleted = currentStepIndex > s.step;
                  const isActive = currentStepIndex === s.step;
                  return (
                    <div key={s.step} className="flex items-start space-x-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs sm:text-sm border transition-all duration-200 ${
                        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                        isActive ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105" :
                        "bg-white border-[#ECECEC] text-[#94A3B8]"
                      }`}>
                        {isCompleted ? "✓" : s.step}
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className={`block text-xs sm:text-sm font-bold leading-none ${isActive ? "text-blue-600" : "text-[#1E2235]"}`}>
                          {s.name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-[#94A3B8] font-medium block">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Column (8 Cols on Desktop, Full Width on Mobile): Form Wizard */}
            <div className="lg:col-span-8 bg-white border border-[#ECECEC] rounded-[28px] p-6 sm:p-8 shadow-[0px_4px_16px_rgba(0,0,0,0.02)] space-y-6">
              
              {/* Mobile Header Progress */}
              <div className="lg:hidden space-y-3.5">
                <div className="flex items-center justify-between">
                  <button onClick={() => {
                    if (currentStepIndex === 1) setActiveScreen("dashboard");
                    else setActiveScreen(`step${currentStepIndex - 1}` as any);
                  }} className="text-[#1E2235] cursor-pointer">
                    <ChevronLeft className="w-5.5 h-5.5" />
                  </button>
                  <span className="text-xs sm:text-sm font-bold text-[#1E2235]">Step {currentStepIndex} of 5</span>
                  <span className="w-5"></span>
                </div>
                {/* Mobile Progress dots */}
                <div className="flex items-center justify-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span 
                      key={s} 
                      className={`rounded-full transition-all duration-200 ${
                        currentStepIndex === s ? "w-2.5 h-2.5 bg-blue-600" : "w-1.5 h-1.5 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Step Forms */}
              {activeScreen === "step1" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1E2235]">
                      {editingListingId ? "Edit Property Details" : "Property Details"}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">
                      {editingListingId ? "Update details for your PG, Room or Hostel" : "Add basic information about your PG, Room or Hostel"}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        PG / Room / Hostel Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sunshine PG / Room / Hostel for Rent"
                        value={pgName}
                        onChange={(e) => setPgName(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Property Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as any)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200 cursor-pointer"
                      >
                        <option value="room">Room</option>
                        <option value="pg">PG</option>
                        <option value="hostel">Hostel</option>
                        <option value="flat">Flat</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Describe your property (PG, Room, or Hostel), facilities, environment, rules etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200 resize-none"
                      />
                      <span className="text-xs text-[#94A3B8] font-medium text-right block">
                        {description.length}/500
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!pgName || !description) {
                        alert("Please enter Property Name and Description.");
                        return;
                      }
                      setActiveScreen("step2");
                    }}
                    className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#7C5DF8] hover:from-[#5B3FE6] hover:to-[#6C4CF1] text-white py-4 rounded-2xl text-sm font-poppins font-semibold tracking-wide transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg hover:shadow-[#6C4CF1]/20 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {activeScreen === "step2" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1E2235]">Add Photos</h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">Upload photos of your PG, Room, or Hostel</p>
                    <span className="text-xs text-[#94A3B8] font-semibold block">You can upload up to 5 photos (optional)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-[#ECECEC] shadow-sm">
                        <img src={photo} alt={`room-${idx}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setPhotos(photo => photo.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer active:scale-90"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {photos.length < 5 && (
                      <div 
                        onClick={() => !isUploading && document.getElementById("photo-upload-input")?.click()}
                        className="border-2 border-dashed border-[#6C4CF1]/30 rounded-2xl aspect-square flex flex-col items-center justify-center text-center space-y-1.5 bg-[#F8F9FC] cursor-pointer hover:bg-slate-100/50 transition-colors"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center space-y-1">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6C4CF1]" />
                            <span className="text-[10px] text-[#6C4CF1] font-bold">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-6.5 h-6.5 text-[#6C4CF1]" />
                            <span className="text-xs font-semibold text-[#1E2235]">Add Photo</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    id="photo-upload-input"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                  <div className="bg-[#F3F4FD] border border-[#E8E2FF] rounded-2xl p-4 flex items-start space-x-2.5 text-xs sm:text-sm text-[#6B7280] font-medium leading-normal text-left">
                    <Lightbulb className="w-5 h-5 text-[#6C4CF1] shrink-0 mt-0.5" />
                    <span>Good photos get more inquiries</span>
                  </div>

                  <div className="flex gap-3.5">
                    <button 
                      onClick={() => setActiveScreen("step1")}
                      className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-4 rounded-2xl text-sm tracking-wide transition-all active:scale-98 cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setActiveScreen("step3")}
                      className="flex-[1.5] bg-gradient-to-r from-[#6C4CF1] to-[#7C5DF8] hover:from-[#5B3FE6] hover:to-[#6C4CF1] text-white py-4 rounded-2xl text-sm font-poppins font-semibold tracking-wide transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg hover:shadow-[#6C4CF1]/20 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "step3" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1E2235]">Location</h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">Add the location of your property</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Full Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                          Area / Locality <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sector 62 / Lalpur"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Noida / Ranchi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3.5">
                    <button 
                      onClick={() => setActiveScreen("step2")}
                      className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-4 rounded-2xl text-sm tracking-wide transition-all active:scale-98 cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!address || !area || !city || !pincode) {
                          alert("Please fill all location fields.");
                          return;
                        }
                        setActiveScreen("step4");
                      }}
                      className="flex-[1.5] bg-gradient-to-r from-[#6C4CF1] to-[#7C5DF8] hover:from-[#5B3FE6] hover:to-[#6C4CF1] text-white py-4 rounded-2xl text-sm font-poppins font-semibold tracking-wide transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg hover:shadow-[#6C4CF1]/20 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "step4" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1E2235]">Price & Room Type</h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">Set price and room details</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Room Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5 pt-1.5">
                        {["Single", "Double", "Triple", "Sharing"].map((type) => {
                          const isSelected = roomType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setRoomType(type)}
                              className={`px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center space-x-2.5 cursor-pointer ${
                                isSelected 
                                  ? "bg-[#6C4CF1]/5 text-[#6C4CF1] border-[#6C4CF1] shadow-[0_0_0_1px_#6C4CF1]" 
                                  : "bg-white border-[#E2E8F0] text-[#1E2235] hover:border-[#6C4CF1]/30 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center stroke-2 shrink-0 ${isSelected ? "border-[#6C4CF1]" : "border-slate-300"}`}>
                                {isSelected && <span className="w-2 h-2 bg-[#6C4CF1] rounded-full"></span>}
                              </span>
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                          {propertyType === "hostel" ? "Yearly Rent / Fee (₹)" : "Monthly Rent (₹)"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder={propertyType === "hostel" ? "Enter yearly fee amount (e.g. 80000)" : "Enter monthly rent amount (e.g. 6000)"}
                          value={rent}
                          onChange={(e) => setRent(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                          Security Deposit (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Enter deposit (optional)"
                          value={deposit}
                          onChange={(e) => setDeposit(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Food Facility
                      </label>
                      <div className="flex gap-2.5 pt-1.5">
                        {["Yes", "No", "Optional"].map((facility) => {
                          const isSelected = foodFacility === facility;
                          return (
                            <button
                              key={facility}
                              type="button"
                              onClick={() => setFoodFacility(facility)}
                              className={`px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center space-x-2.5 cursor-pointer ${
                                isSelected 
                                  ? "bg-[#6C4CF1]/5 text-[#6C4CF1] border-[#6C4CF1] shadow-[0_0_0_1px_#6C4CF1]" 
                                  : "bg-white border-[#E2E8F0] text-[#1E2235] hover:border-[#6C4CF1]/30 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center stroke-2 shrink-0 ${isSelected ? "border-[#6C4CF1]" : "border-slate-300"}`}>
                                {isSelected && <span className="w-2 h-2 bg-[#6C4CF1] rounded-full"></span>}
                              </span>
                              <span>{facility}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3.5 pt-2">
                    <button 
                      onClick={() => setActiveScreen("step3")}
                      className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-4 rounded-2xl text-sm tracking-wide transition-all active:scale-98 cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!rent) {
                          alert("Please enter Monthly Rent.");
                          return;
                        }
                        setActiveScreen("step5");
                      }}
                      className="flex-[1.5] bg-gradient-to-r from-[#6C4CF1] to-[#7C5DF8] hover:from-[#5B3FE6] hover:to-[#6C4CF1] text-white py-4 rounded-2xl text-sm font-poppins font-semibold tracking-wide transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg hover:shadow-[#6C4CF1]/20 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "step5" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1E2235]">Facilities & Rules</h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">Select facilities available in your property</p>
                  </div>

                  <div className="space-y-6">
                    {/* Facilities Checklist */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Facilities
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1.5">
                        {["Wi-Fi", "AC", "Laundry", "Food", "TV", "Geyser", "Parking", "RO Water"].concat(customFacilities).map((facility) => {
                          const isChecked = selectedFacilities.includes(facility);
                          return (
                            <button
                              key={facility}
                              type="button"
                              onClick={() => toggleFacility(facility)}
                              className={`px-3 py-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center space-x-2.5 cursor-pointer ${
                                isChecked 
                                  ? "bg-[#6C4CF1]/5 text-[#6C4CF1] border-[#6C4CF1] shadow-[0_0_0_1px_#6C4CF1]" 
                                  : "bg-white border-[#E2E8F0] text-[#1E2235] hover:border-[#6C4CF1]/30 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isChecked ? "border-[#6C4CF1] bg-[#6C4CF1] text-white" : "border-slate-300"}`}>
                                {isChecked && <Check className="w-3 h-3" />}
                              </span>
                              <span className="truncate">{facility}</span>
                            </button>
                          );
                        })}
                        {showFacilityInput ? (
                          <div className="flex items-center border border-[#6C4CF1] rounded-xl overflow-hidden bg-white px-2.5 py-1.5 col-span-2 sm:col-span-1">
                            <input 
                              type="text"
                              value={facilityValue}
                              onChange={(e) => setFacilityValue(e.target.value)}
                              placeholder="Type facility..."
                              className="w-full bg-transparent text-xs sm:text-sm text-[#1E2235] focus:outline-none font-medium px-1 placeholder-slate-400"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomFacility();
                                }
                              }}
                            />
                            <button 
                              type="button" 
                              onClick={handleAddCustomFacility}
                              className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg active:scale-95 transition-transform"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => setShowFacilityInput(true)}
                            className="border border-dashed border-slate-300 rounded-xl px-3 py-3.5 text-xs sm:text-sm font-semibold text-slate-400 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            + Add Facility
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Furniture / Provided Items Included */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Furniture Included (In Room)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1.5">
                        {["Bed", "Study Table", "Chair", "Mattress (Gadda)", "Almirah / Wardrobe"].concat(customFurniture).map((furniture) => {
                          const isChecked = selectedFurniture.includes(furniture);
                          return (
                            <button
                              key={furniture}
                              type="button"
                              onClick={() => toggleFurnitureItem(furniture)}
                              className={`px-3 py-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center space-x-2.5 cursor-pointer ${
                                isChecked 
                                  ? "bg-[#6C4CF1]/5 text-[#6C4CF1] border-[#6C4CF1] shadow-[0_0_0_1px_#6C4CF1]" 
                                  : "bg-white border-[#E2E8F0] text-[#1E2235] hover:border-[#6C4CF1]/30 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isChecked ? "border-[#6C4CF1] bg-[#6C4CF1] text-white" : "border-slate-300"}`}>
                                {isChecked && <Check className="w-3 h-3" />}
                              </span>
                              <span className="truncate">{furniture}</span>
                            </button>
                          );
                        })}
                        {showCustomInput ? (
                          <div className="flex items-center border border-[#6C4CF1] rounded-xl overflow-hidden bg-white px-2.5 py-1.5 col-span-2 sm:col-span-1">
                            <input 
                              type="text"
                              value={customValue}
                              onChange={(e) => setCustomValue(e.target.value)}
                              placeholder="Type item..."
                              className="w-full bg-transparent text-xs sm:text-sm text-[#1E2235] focus:outline-none font-medium px-1 placeholder-slate-400"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomFurniture();
                                }
                              }}
                            />
                            <button 
                              type="button" 
                              onClick={handleAddCustomFurniture}
                              className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg active:scale-95 transition-transform"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => setShowCustomInput(true)}
                            className="border border-dashed border-slate-300 rounded-xl px-3 py-3.5 text-xs sm:text-sm font-semibold text-slate-400 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            + Add Furniture
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rules section */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs sm:text-sm font-semibold uppercase text-slate-600 tracking-wide block">
                        Rules (Optional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. No smoking, No pets, Visiting hours etc."
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3.5 pt-4">
                    <button 
                      onClick={() => setActiveScreen("step4")}
                      className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-4 rounded-2xl text-sm tracking-wide transition-all active:scale-98 cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSubmitListing}
                      className="flex-[1.5] bg-gradient-to-r from-[#6C4CF1] to-[#7C5DF8] hover:from-[#5B3FE6] hover:to-[#6C4CF1] text-white py-4 rounded-2xl text-sm font-poppins font-semibold tracking-wide transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg hover:shadow-[#6C4CF1]/20 flex items-center justify-center space-x-2 cursor-pointer text-center"
                    >
                      {editingListingId ? "Save & Update Listing" : "Submit Listing"}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN: MY LISTINGS (RESPONSIVE GRID IN DESKTOP VIEW) */}
        {/* ========================================================================= */}
        {activeScreen === "listings" && (
          <div className="space-y-7 w-full text-left">
            
            {/* Header section with back button */}
            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-5">
              <div className="flex items-center space-x-4 text-left">
                <button 
                  onClick={() => setActiveScreen("dashboard")} 
                  className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#1E2235] hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  <ChevronLeft className="w-5.5 h-5.5" />
                </button>
                <div>
                  <h2 className="font-poppins font-black text-lg sm:text-xl text-[#1E2235] leading-none">
                    My Listings
                  </h2>
                  <span className="text-xs text-[#94A3B8] font-bold mt-1.5 block uppercase tracking-wide">
                    Manage all your listed properties
                  </span>
                </div>
              </div>

              {/* Quick Add Button (Desktop only) */}
              <button 
                onClick={() => {
                  resetForm();
                  setActiveScreen("step1");
                }}
                className="hidden md:flex items-center space-x-2 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wide cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add Property</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-[#F0F2F5] pb-0.5 max-w-lg">
              <button
                onClick={() => setListingTab("all")}
                className={`flex-1 text-center font-black text-xs sm:text-sm uppercase tracking-wider pb-3 transition-colors cursor-pointer ${
                  listingTab === "all" 
                    ? "text-[#6C4CF1] border-b-2 border-[#6C4CF1]" 
                    : "text-[#94A3B8] hover:text-[#1E2235]"
                }`}
              >
                All ({listings.length})
              </button>
              <button
                onClick={() => setListingTab("active")}
                className={`flex-1 text-center font-black text-xs sm:text-sm uppercase tracking-wider pb-3 transition-colors cursor-pointer ${
                  listingTab === "active" 
                    ? "text-[#6C4CF1] border-b-2 border-[#6C4CF1]" 
                    : "text-[#94A3B8] hover:text-[#1E2235]"
                }`}
              >
                Active ({listings.filter(x => x.status === "Active").length})
              </button>
              <button
                onClick={() => setListingTab("inactive")}
                className={`flex-1 text-center font-black text-xs sm:text-sm uppercase tracking-wider pb-3 transition-colors cursor-pointer ${
                  listingTab === "inactive" 
                    ? "text-[#6C4CF1] border-b-2 border-[#6C4CF1]" 
                    : "text-[#94A3B8] hover:text-[#1E2235]"
                }`}
              >
                Inactive ({listings.filter(x => x.status === "Inactive").length})
              </button>
            </div>

            {/* Listings Grid (Responsive multi-columns on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
              {filteredListings.length > 0 ? (
                filteredListings.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-[24px] border border-[#ECECEC] p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] flex flex-row md:flex-col gap-4 text-left relative hover:shadow-soft transition-shadow duration-300 pr-12 md:pr-4"
                  >
                    {/* Image block (Left on Mobile, Top on Desktop) */}
                    <div className="w-[32%] md:w-full aspect-square md:aspect-[16/10] relative rounded-[16px] overflow-hidden bg-muted shrink-0 shadow-xs">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                      <span className={`absolute bottom-3 left-3 text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded shadow-sm z-10 ${
                        item.status === "Active" 
                          ? "bg-[#ECFDF5] text-[#10B981] border border-[#DEF7EC]" 
                          : "bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]"
                      }`}>
                        {item.status}
                      </span>
                      {item.type && (
                        <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded shadow-sm bg-[#F0EDFF] text-[#6C4CF1] border border-[#ECECEC] z-10">
                          {item.type}
                        </span>
                      )}
                      {promotedListingIds.includes(item.id) && (
                        <span className="absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white border border-amber-400 z-10 flex items-center space-x-1 shadow-sm">
                          <Sparkles className="w-3 h-3 text-white fill-white/20" />
                          <span>Boosted</span>
                        </span>
                      )}
                      {!promotedListingIds.includes(item.id) && boostRequests.some((r: any) => (r.listing?._id === item.id || r.listing === item.id) && r.status === "Pending") && (
                        <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-500 text-white border border-slate-400 z-10 flex items-center space-x-1 shadow-sm">
                          <span>Pending SS</span>
                        </span>
                      )}
                    </div>

                    {/* Content Details Block */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                      
                      <div className="space-y-1.5">
                        <h4 className="font-poppins font-black text-base sm:text-lg text-[#1E2235] line-clamp-1 leading-snug">
                          {item.title}
                        </h4>
                        
                        <p className="text-xs sm:text-sm text-[#94A3B8] font-bold flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4 text-[#94A3B8] shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>

                        <div className="text-xs sm:text-sm text-[#1E2235] font-black pt-1">
                          <span>{item.sharing}</span>
                          <span className="text-[#94A3B8] font-bold"> &bull; </span>
                          <span className="text-[#6C4CF1]">₹{item.rent.toLocaleString("en-IN")}/{item.type === "hostel" ? "year" : "month"}</span>
                        </div>

                        {/* Facilities badges list */}
                        <div className="flex flex-wrap gap-1.5 text-[9.5px] sm:text-xs font-black uppercase pt-2">
                          {item.facilities.slice(0, 3).map((fac) => (
                            <span key={fac} className="bg-[#F0EDFF] text-[#6C4CF1] px-2.5 py-0.5 rounded-md">
                              {fac.replace(" Available", "")}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Date Row */}
                      <div className="text-[10px] sm:text-xs text-[#94A3B8] font-bold border-t border-[#F0F2F5] pt-3 mt-3.5 uppercase tracking-wide">
                        {item.date}
                      </div>

                    </div>

                    {/* Actions Panel (Top Right Three-Dots Dropdown) */}
                    <div className="absolute right-3.5 top-3.5 z-10 actions-panel-container">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-[#ECECEC] flex items-center justify-center text-[#1E2235] cursor-pointer active:scale-95 transition-all shadow-xs"
                      >
                        <MoreVertical className="w-4 h-4 text-[#1E2235]" />
                      </button>

                       {openMenuId === item.id && (
                        <div className="absolute right-0 mt-1.5 w-32 bg-white border border-[#ECECEC] rounded-xl shadow-lg py-1.5 z-20 text-left">
                          {/* 1. Toggle Status */}
                          <button 
                            onClick={() => {
                              toggleListStatus(item.id);
                              setOpenMenuId(null);
                            }}
                            className={`w-full px-3 py-2 text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
                              item.status === "Active" ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span>{item.status === "Active" ? "Deactivate" : "Activate"}</span>
                          </button>

                          {/* 2. Edit */}
                          <button 
                            onClick={() => {
                              startEditingListing(item.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-xs font-bold text-[#1E2235] hover:bg-slate-50 flex items-center space-x-2 cursor-pointer transition-colors border-t border-[#F0F2F5]"
                          >
                            <Edit3 className="w-4 h-4 text-[#94A3B8]" />
                            <span>Edit</span>
                          </button>

                          {/* 3. Boost Listing */}
                          <button 
                            onClick={() => {
                              const fullListing = listings.find(l => l.id === item.id);
                              if (fullListing) {
                                setBoostingListing(fullListing);
                                setCheckoutStep("plans");
                                setShowBoostModal(true);
                              }
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center space-x-2 cursor-pointer transition-colors border-t border-[#F0F2F5]"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                            <span>Boost Listing</span>
                          </button>

                          {/* 4. Delete */}
                          <button 
                            onClick={() => {
                              handleDeleteListing(item.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer transition-colors border-t border-[#F0F2F5]"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-sm col-span-full">
                  <p className="text-xs sm:text-sm text-[#94A3B8] font-bold">
                    No listed properties in this tab. Add a room to get started!
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN: HOST PROFILE */}
        {/* ========================================================================= */}
        {activeScreen === "profile" && (
          <div className="w-full text-center max-w-xl mx-auto pb-24 relative">
            
            {/* Soft Blue Gradient Header Background (Blinkit style in Light Blue) */}
            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-screen h-[320px] bg-gradient-to-b from-[#7DD3FC]/45 via-[#E0F2FE]/15 to-[#F8F9FC] z-0 pointer-events-none" />
            
            {/* Header section with back button (circular white icon, top-left aligned) */}
            <div className="relative z-10 flex items-center px-0 pt-6 pb-2 text-left">
              <button 
                onClick={() => setActiveScreen("dashboard")} 
                className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#1E2235] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-5.5 h-5.5 stroke-[2]" />
              </button>
              <span className="font-poppins font-extrabold text-sm uppercase tracking-wider text-slate-400/80 ml-4">
                Profile
              </span>
            </div>

            {/* Profile Avatar Card mockup (Centering circle, Owner Name, Mobile Number) */}
            <div className="relative z-10 flex flex-col items-center pt-3 pb-6 px-0">
              
              {/* Circular Avatar Container with white border and drop shadow (Blinkit style) */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-[0_12px_28px_rgba(0,0,0,0.06)] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#E2E8F0]/70 flex items-center justify-center text-[#475569]">
                    <User className="w-12 h-12 text-[#475569] stroke-[1.2] fill-[#475569]/85" />
                  </div>
                </div>
                
                {/* Camera upload icon button */}
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-primary shadow-md hover:scale-105 active:scale-90 transition-transform cursor-pointer">
                  <Camera className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Account Info Details */}
              <div className="mt-4 space-y-1">
                <h3 className="font-poppins font-black text-xl text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
                  <span>{profileName}</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-500/10 stroke-[2]" />
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">
                  {profilePhone}
                </p>
              </div>

            </div>

            {/* Wrapper for the rest of the profile fields */}
            <div className="relative z-10 space-y-6 px-0">

            {/* Quick Action Columns (3 Cards) */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setActiveScreen("listings")}
                className="bg-white border border-[#E2E8F0] hover:border-primary/20 rounded-[18px] p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50/50 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                  <ListTodo className="w-5 h-5 text-primary stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  My listings
                </span>
              </button>

              <button 
                onClick={() => {
                  resetForm();
                  setActiveScreen("step1");
                }}
                className="bg-white border border-[#E2E8F0] hover:border-primary/20 rounded-[18px] p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50/50 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                  <Plus className="w-5 h-5 text-primary stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  Add Property
                </span>
              </button>

              <button 
                onClick={() => {
                  setShowSupportForm(true);
                  setTimeout(() => {
                    const element = document.getElementById("support-accordion-group");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }}
                className="bg-white border border-[#E2E8F0] hover:border-primary/20 rounded-[18px] p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50/50 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 active:scale-98 cursor-pointer w-full"
              >
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                  <MessageSquare className="w-5 h-5 text-primary stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  Need help?
                </span>
              </button>
            </div>

            {/* Group 1: Your Information */}
            <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.015)]">
              {isEditingProfile ? (
                <div className="p-6 space-y-5">
                  <div className="px-1 border-l-3 border-primary pl-2">
                    <h3 className="font-poppins font-bold text-base text-[#1E2235] text-left">
                      Edit details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase text-slate-600 tracking-wide block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase text-slate-600 tracking-wide block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                          placeholder="Email address (optional)"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase text-slate-600 tracking-wide block">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase text-slate-600 tracking-wide block">
                          WhatsApp Number
                        </label>
                        <input
                          type="text"
                          value={profileWhatsApp}
                          onChange={(e) => setProfileWhatsApp(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-base md:text-sm font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3.5 pt-2">
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-4 rounded-2xl text-sm tracking-wide transition-all active:scale-98 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const res = await ownerFetch(getApiUrl("/api/auth/profile"), {
                            method: "PUT",
                            credentials: "include",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              fullName: profileName,
                              email: profileEmail,
                              mobile: profilePhone,
                              alternateMobile: profileWhatsApp
                            })
                          });

                          if (res.ok) {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("owner_name", profileName);
                              localStorage.setItem("owner_email", profileEmail);
                              localStorage.setItem("owner_phone", profilePhone);
                              localStorage.setItem("owner_whatsapp", profileWhatsApp);
                            }
                            alert("Profile settings saved successfully!");
                            setIsEditingProfile(false);
                          } else {
                            const errData = await res.json();
                            alert(`Failed to save profile: ${errData.message || "Unknown error"}`);
                          }
                        } catch (err) {
                          console.error("Profile update failed:", err);
                          alert("Failed to update profile due to connection error.");
                        }
                      }}
                      className="flex-[1.5] bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white py-4 rounded-2xl text-sm font-poppins font-semibold tracking-wide transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center space-x-2 cursor-pointer text-center"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-5 pt-5 pb-3 border-l-3 border-primary ml-5 mt-2 text-left">
                    <h3 className="font-poppins font-bold text-base text-[#1E2235]">
                      Your Information
                    </h3>
                  </div>
                  
                  <div className="flex flex-col">
                    {[
                      { label: "Full Name", value: profileName, icon: User },
                      { label: "Email Address", value: profileEmail, icon: Mail },
                      { label: "Phone Number", value: profilePhone, icon: Phone },
                      { label: "WhatsApp Number", value: profileWhatsApp, icon: MessageSquare },
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div 
                          key={field.label} 
                          className="px-5 py-4 flex items-center justify-between bg-white border-t border-[#F0F2F5] hover:bg-slate-50/40 transition-colors"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0 text-left">
                            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
                              <Icon className="w-4.5 h-4.5 text-primary stroke-[1.8]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{field.label}</span>
                              <span className="text-sm font-semibold text-slate-800 truncate leading-snug">
                                {field.value || "Not configured"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Edit Details Trigger row */}
                    <div 
                      onClick={() => setIsEditingProfile(true)}
                      className="px-5 py-4 flex items-center justify-between bg-[#F0EDFF]/30 hover:bg-[#F0EDFF]/60 transition-colors border-t border-[#F0F2F5] cursor-pointer"
                    >
                      <div className="flex items-center space-x-3.5 text-left">
                        <div className="w-8 h-8 rounded-lg bg-primary-light/50 flex items-center justify-center text-primary shrink-0">
                          <Edit3 className="w-4.5 h-4.5 text-primary stroke-[1.8]" />
                        </div>
                        <span className="text-sm font-bold text-primary">
                          Edit Profile Details
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-primary stroke-[1.8]" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Group 2: My Listings */}
            <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.015)]">
              <div className="px-5 pt-5 pb-3 border-l-3 border-slate-700 ml-5 mt-2 text-left">
                <h3 className="font-poppins font-bold text-base text-[#1E2235]">
                  My Listings
                </h3>
              </div>
              
              <div className="flex flex-col">
                <div 
                  onClick={() => setActiveScreen("listings")}
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-[#F0F2F5] cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                      <ListTodo className="w-4.5 h-4.5 text-slate-600 stroke-[1.8]" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-slate-800">
                        Manage Listings
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                </div>

                <div 
                  onClick={() => {
                    resetForm();
                    setActiveScreen("step1");
                  }}
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-[#F0F2F5] cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                      <Plus className="w-4.5 h-4.5 text-slate-600 stroke-[1.8]" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-slate-800">
                        Add Property
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                </div>
              </div>
            </div>

            {/* Group: Help & Support (Collapsible Accordion) */}
            <div id="support-accordion-group" className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.015)]">
              <div 
                onClick={() => setShowSupportForm(!showSupportForm)}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
                    <MessageSquare className="w-4.5 h-4.5 text-primary stroke-[1.8]" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Help & Support
                  </span>
                </div>
                {showSupportForm ? (
                  <ChevronDown className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                )}
              </div>

              {showSupportForm && (
                <div className="border-t border-[#F0F2F5] p-5 text-left space-y-4 bg-slate-50/30">
                  <div className="border-l-3 border-[#6C4CF1] pl-3 mb-2">
                    <h4 className="font-poppins font-bold text-sm text-[#1E2235]">
                      Contact Admin 💬
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Send a message directly to the website administrator
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                        Select Subject
                      </label>
                      <select
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E2235] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition-all duration-200"
                      >
                        <option value="General Help">General Help & Query</option>
                        <option value="Listing Issue">Listing/Room Approval Issue</option>
                        <option value="Billing/Payments">Billing & Premium Payments</option>
                        <option value="Bug Report">Technical Bug Report</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                        Your Message
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Describe your issue or request..."
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E2235] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition-all duration-200 resize-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!supportMessage.trim()) {
                          alert("Please type a message before sending.");
                          return;
                        }
                        try {
                          const msgs = localStorage.getItem("roomswallah_messages") || "[]";
                          let parsedMsgs = JSON.parse(msgs);
                          const newMsg = {
                            id: Math.random().toString(36).substring(2, 9),
                            name: profileName,
                            email: profileEmail || "owner@gmail.com",
                            phone: profilePhone,
                            subject: `[Owner Support] ${supportSubject}`,
                            message: supportMessage,
                            date: new Date().toLocaleDateString("en-IN"),
                            replied: false
                          };
                          parsedMsgs.unshift(newMsg);
                          localStorage.setItem("roomswallah_messages", JSON.stringify(parsedMsgs));
                          
                          alert("Your message has been sent successfully to the Admin! We will reply shortly.");
                          setSupportMessage("");
                          setShowSupportForm(false);
                        } catch (e) {
                          console.error("Failed to send message:", e);
                          alert("Error sending message.");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white py-3 rounded-xl text-xs font-poppins font-bold tracking-wide transition-all duration-300 active:scale-98 shadow-sm flex items-center justify-center space-x-2 cursor-pointer text-center"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Group 3: Account Actions */}
            <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.015)]">
              <div className="px-5 pt-5 pb-3 border-l-3 border-slate-700 ml-5 mt-2 text-left">
                <h3 className="font-poppins font-bold text-base text-[#1E2235]">
                  Account Actions
                </h3>
              </div>
              
              <div className="flex flex-col">
                <div 
                  onClick={async () => {
                    if (confirm("Are you sure you want to log out?")) {
                      try {
                        await ownerFetch(getApiUrl("/api/auth/logout"), {
                          method: "POST",
                          credentials: "include"
                        });
                      } catch (err) {
                        console.error("Logout API failed:", err);
                      }
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("owner_logged_in");
                        localStorage.clear();
                      }
                      router.push("/welcome");
                    }
                  }}
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-[#F0F2F5] cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                      <Power className="w-4.5 h-4.5 text-slate-600 stroke-[1.8]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Log Out
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                </div>

                <div 
                  onClick={async () => {
                    if (confirm("WARNING: Are you sure you want to delete your host account? All your listings and uploaded images will be permanently lost from the database.")) {
                      if (confirm("CONFIRMATION REQUIRED: Please confirm once more to delete your account forever.")) {
                        try {
                          const res = await ownerFetch(getApiUrl("/api/auth/delete-account"), {
                            method: "DELETE",
                            credentials: "include"
                          });
                          if (res.ok) {
                            if (typeof window !== "undefined") {
                              localStorage.clear();
                            }
                            alert("Your host account has been successfully deleted from our database.");
                            router.push("/welcome");
                          } else {
                            const errData = await res.json().catch(() => ({}));
                            alert(errData.message || "Failed to delete account.");
                          }
                        } catch (err) {
                          console.error("Account deletion failed:", err);
                          alert("Failed to delete account due to connection error.");
                        }
                      }
                    }
                  }}
                  className="px-5 py-4 flex items-center justify-between hover:bg-red-50/30 transition-colors border-t border-[#F0F2F5] cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0 group-hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4.5 h-4.5 text-red-500 stroke-[1.8]" />
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      Delete Account Forever
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-500 stroke-[1.5]" />
                </div>
              </div>
            </div>
          </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN: HOST INQUIRIES */}
        {/* ========================================================================= */}
        {activeScreen === "inquiries" && (
          <div className="w-full text-center max-w-xl mx-auto pb-24 relative overflow-visible">
            
            {/* Soft Blue Gradient Header Background */}
            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-screen h-[320px] bg-gradient-to-b from-[#7DD3FC]/45 via-[#E0F2FE]/15 to-[#F8F9FC] z-0 pointer-events-none" />
            
            {/* Header section with back button */}
            <div className="relative z-10 flex items-center px-0 pt-6 pb-2 text-left">
              <button 
                onClick={() => setActiveScreen("dashboard")} 
                className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#1E2235] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-5.5 h-5.5 stroke-[2]" />
              </button>
              <span className="font-poppins font-extrabold text-sm uppercase tracking-wider text-slate-400/80 ml-4">
                Inquiries
              </span>
            </div>

            {/* Inquiries list content */}
            <div className="relative z-10 space-y-6 pt-4 text-left">
              <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.015)] p-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F5]">
                  <div>
                    <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                      Customer Leads
                    </h3>
                    <p className="text-xs text-[#94A3B8] font-semibold mt-0.5">
                      Track clicks on your phone and WhatsApp contact nodes
                    </p>
                  </div>
                  <span className="bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-[#DEF7EC]">
                    {inquiries.length} Total
                  </span>
                </div>

                <div className="divide-y divide-[#F0F2F5]">
                  {inquiries.length > 0 ? (
                    inquiries.map((inq: any) => (
                      <div key={inq._id || inq.id} className="py-4 flex items-start justify-between gap-3 border-b border-[#F0F2F5] last:border-b-0">
                        <div className="min-w-0 flex-1 space-y-1.5 text-left">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {inq.listingId?.title || "Unknown Listing"}
                          </h4>
                          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center text-slate-700 font-bold">
                              👤 {inq.name || "Guest User"}
                            </span>
                            {inq.phone && inq.phone !== "Not Provided" && (
                              <span className="flex items-center text-slate-500">
                                📞 {inq.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-semibold">
                            <span>Type:</span>
                            {inq.type === "whatsapp" ? (
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-emerald-500 fill-emerald-500/10" />
                                WhatsApp
                              </span>
                            ) : inq.type === "book" ? (
                              <span className="bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1 animate-pulse">
                                <Sparkles className="w-3 h-3 text-purple-500 fill-purple-500/10" />
                                Booking Request
                              </span>
                            ) : (
                              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-blue-500" />
                                Phone Call
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[#94A3B8] font-bold block">
                            {new Date(inq.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                          <span className="text-[9px] text-[#94A3B8] font-semibold block mt-0.5">
                            {new Date(inq.createdAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2.5 stroke-[1.5]" />
                      <p className="text-xs text-slate-400 font-bold">
                        No customer inquiries registered yet.
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5 max-w-[280px] mx-auto leading-normal">
                        When users click on WhatsApp or Call buttons of your active properties, they will show up here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* BOOST VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {showBoostModal && (
        <div className="fixed inset-0 bg-[#1E2235]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full max-h-[85vh] overflow-y-auto border border-[#ECECEC] shadow-2xl p-6 sm:p-7 relative space-y-6">
            
            {/* Close Button */}
            {checkoutStep !== "submitting" && checkoutStep !== "success" && (
              <button 
                onClick={() => {
                  setShowBoostModal(false);
                  setBoostingListing(null);
                  setCheckoutStep("list");
                  setScreenshotFileUrl("");
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-[#ECECEC] flex items-center justify-center text-[#1E2235] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Step 1: Select Property to Boost */}
            {checkoutStep === "list" && (
              <div className="space-y-4 text-left animate-fade-in">
                <div className="space-y-1">
                  <h3 className="font-poppins font-black text-xl text-[#1E2235] flex items-center gap-2">
                    <Sparkles className="w-5.5 h-5.5 text-amber-500 fill-amber-500/20 animate-pulse" />
                    <span>Boost Your Listings</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wide">
                    Select a listing to promote to the top
                  </p>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {listings.length === 0 ? (
                    <p className="text-xs text-slate-500 font-semibold py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      No listings available to boost. Add a listing first.
                    </p>
                  ) : (
                    listings.map((item) => {
                      const isBoosted = promotedListingIds.includes(item.id);
                      const isPending = boostRequests.some((r: any) => (r.listing?._id === item.id || r.listing === item.id) && r.status === "Pending");
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100/40 transition-colors">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 text-left">
                              <span className="block text-sm font-bold text-[#1E2235] truncate">{item.title}</span>
                              <span className="text-[11px] text-[#94A3B8] font-bold block truncate">{item.location}</span>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isBoosted ? (
                              <span className="inline-flex items-center space-x-1 bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg shadow-sm">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span>Boosted</span>
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center space-x-1 bg-slate-500 text-white text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg">
                                <span>Pending Approval</span>
                              </span>
                            ) : (
                              <button 
                                onClick={() => {
                                  const fullListing = listings.find(l => l.id === item.id);
                                  if (fullListing) setBoostingListing(fullListing);
                                  setCheckoutStep("plans");
                                }}
                                className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-[10px] font-black uppercase px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-2xs"
                              >
                                Boost Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Compare Pricing Plans */}
            {checkoutStep === "plans" && boostingListing && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="space-y-1">
                  <h3 className="font-poppins font-black text-xl text-[#1E2235] tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5.5 h-5.5 text-amber-500 fill-amber-500/20" />
                    <span>Select Pricing Plan</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5 truncate">
                    Boosting: {boostingListing.title}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Plan 1: Standard Boost */}
                  <div 
                    onClick={() => setSelectedPlan("basic")}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                      selectedPlan === "basic" 
                        ? "border-[#6C4CF1] bg-[#F0EDFF]/20 shadow-sm" 
                        : "border-[#ECECEC] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-[#F0EDFF] text-[#6C4CF1] px-2 py-0.5 rounded-md leading-none">
                          Standard
                        </span>
                      </div>
                      
                      <h4 className="font-poppins font-black text-sm text-[#1E2235] pt-2 leading-none">
                        7 Days Boost
                      </h4>

                      <div className="flex items-baseline pt-2.5 pb-1">
                        <span className="font-poppins font-black text-3.5xl text-[#6C4CF1]">₹19</span>
                        <span className="text-[9px] text-[#94A3B8] font-bold uppercase ml-1 tracking-wider">/ 7 Days</span>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 mt-3 text-left">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                          <span>2x Visibility increase</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                          <span>Standard sorting rank</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan 2: Ultra Premium Boost */}
                  <div 
                    onClick={() => setSelectedPlan("premium")}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                      selectedPlan === "premium" 
                        ? "border-amber-500 bg-amber-50/10 shadow-sm" 
                        : "border-[#ECECEC] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="absolute top-0 right-0 bg-amber-500 text-white text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                      Best Value
                    </span>

                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md leading-none">
                          Premium
                        </span>
                      </div>
                      
                      <h4 className="font-poppins font-black text-sm text-[#1E2235] pt-2 leading-none">
                        30 Days Boost
                      </h4>

                      <div className="flex items-baseline pt-2.5 pb-1">
                        <span className="font-poppins font-black text-3.5xl text-amber-500">₹49</span>
                        <span className="text-[9px] text-[#94A3B8] font-bold uppercase ml-1 tracking-wider">/ 30 Days</span>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 mt-3 text-left">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                          <span>5x Visibility boost</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                          <span>Priority sorting rank</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                          <span>Gold featured badge</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => {
                      setCheckoutStep("list");
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setCheckoutStep("payment")}
                    className="flex-1 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-poppins font-semibold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    Proceed to Pay
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment QR & Screenshot Upload */}
            {checkoutStep === "payment" && boostingListing && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="space-y-1">
                  <h3 className="font-poppins font-black text-lg text-[#1E2235] flex items-center gap-2">
                    <Sparkles className="w-5.5 h-5.5 text-amber-500 fill-amber-500/20" />
                    <span>Scan & Pay via UPI</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wide">
                    Amount: {selectedPlan === "basic" ? "₹19" : "₹49"} for {selectedPlan === "basic" ? "7 Days" : "30 Days"}
                  </p>
                </div>

                {/* PREMIUM PHONEPE THEME QR CARD */}
                <div className="bg-[#11121A] text-white p-6 rounded-[28px] border border-slate-800 shadow-xl flex flex-col items-center relative overflow-hidden font-sans">
                  
                  {/* State Bank of India logo mockup */}
                  <div className="flex flex-col items-center space-y-1 mb-5">
                    <div className="w-11 h-11 rounded-full bg-[#1A73E8] border border-white/20 flex items-center justify-center shadow-inner relative">
                      <div className="w-4 h-4 rounded-full border-[3px] border-white flex items-center justify-center">
                        <div className="w-1.5 h-3 bg-[#1A73E8] absolute bottom-1.5" />
                      </div>
                    </div>
                    <span className="block font-semibold text-sm text-slate-100 tracking-tight">
                      State Bank of India - 0396
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Primary account for receiving money
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div className="w-48 h-48 bg-white border border-slate-700 rounded-2xl flex items-center justify-center p-3 relative shadow-inner">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=9263119717@axl%26pn=RoomsWallah%26am=${selectedPlan === "basic" ? "19" : "49"}%26cu=INR%26tn=Boost_${boostingListing.id}`} 
                      alt="UPI Payment QR Code" 
                      className="w-full h-full object-contain"
                    />
                    {/* Small center overlay logo simulating PhonePe */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#5F259F] border-2 border-white flex items-center justify-center font-bold text-[10px] text-white">
                      पे
                    </div>
                  </div>
                  
                  {/* UPI ID block */}
                  <div className="mt-5 w-full flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                      <span className="text-xs font-semibold tracking-wide text-slate-300 select-all">
                        UPI ID: 9263119717@axl
                      </span>
                      <button 
                        onClick={() => {
                          if (typeof navigator !== "undefined") {
                            navigator.clipboard.writeText("9263119717@axl");
                            alert("UPI ID copied to clipboard!");
                          }
                        }}
                        className="text-[10px] bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white px-2.5 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Download / Share Buttons mockup */}
                  <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-white/5 mt-4">
                    <button className="flex items-center justify-center space-x-1.5 border border-white/15 hover:bg-white/5 text-slate-300 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1.5 border border-white/15 hover:bg-white/5 text-slate-300 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l-2.016 1.152m0 0l-2.016 1.152m2.016-1.152L11 8m0 0l2.016-1.152m0 0l2.016-1.152M11 8v8M11 8l-2.016 1.152m2.016-1.152l2.016 1.152m-2.016-1.152v8" />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Supported UPI Apps Footer */}
                  <div className="w-full flex items-center justify-between pt-4 mt-3 border-t border-white/5 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                    <div className="flex items-center space-x-1">
                      <span>Supported UPI apps</span>
                    </div>
                    <div className="flex space-x-2 text-slate-300">
                      <span>PhonePe</span>
                      <span>BHIM</span>
                      <span>GPay</span>
                      <span>Paytm</span>
                    </div>
                  </div>
                </div>

                {/* Screenshot Uploader */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase text-slate-600 tracking-wide block">
                    Upload Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  
                  {screenshotFileUrl ? (
                    <div className="flex items-center justify-between p-3 bg-[#ECFDF5] border border-[#DEF7EC] rounded-2xl">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 animate-scale-in">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-800 truncate">Screenshot Uploaded Successfully</span>
                      </div>
                      <button 
                        onClick={() => setScreenshotFileUrl("")} 
                        className="text-xs font-black text-red-500 hover:underline uppercase shrink-0 pl-2 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-[#ECECEC] hover:border-[#6C4CF1] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        disabled={isUploadingScreenshot}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1.5">
                        <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto">
                          <Plus className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="block text-xs font-bold text-slate-700">
                          {isUploadingScreenshot ? "Uploading screenshot..." : "Upload payment screenshot (Image/SS)"}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] font-semibold block">Max size: 5MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setCheckoutStep("plans")}
                    className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-poppins font-semibold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleVerifySubmit}
                    disabled={!screenshotFileUrl || isUploadingScreenshot}
                    className="flex-1 bg-[#6C4CF1] hover:bg-[#5B3FE6] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-poppins font-semibold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all duration-200"
                  >
                    Submit Verification
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Submitting State */}
            {checkoutStep === "submitting" && (
              <div className="flex flex-col items-center justify-center py-10 space-y-5 text-center animate-fade-in">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#6C4CF1] animate-spin"></div>
                  <div className="absolute inset-2 rounded-full bg-[#6C4CF1]/5 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#6C4CF1] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-poppins font-black text-lg text-[#1E2235]">Submitting Receipt</h4>
                  <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">Please do not close this modal</p>
                  <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto pt-1 leading-normal">
                    We are uploading and attaching your payment screenshot to this listing verification request.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Success State */}
            {checkoutStep === "success" && (
              <div className="flex flex-col items-center justify-center py-6 space-y-5 text-center animate-scale-in">
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 relative z-10">
                    <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-poppins font-black text-xl text-[#1E2235] tracking-tight">Thank You!</h4>
                  <p className="text-[#6C4CF1] font-bold text-[10px] uppercase tracking-widest">Verification request submitted</p>
                  <p className="text-xs text-slate-600 max-w-sm font-medium leading-relaxed pt-1.5">
                    Your verification screenshot has been submitted successfully. Our team will verify your payment details, and your listing will be <span className="font-bold text-[#1E2235]">boosted within 1 hour</span>.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowBoostModal(false);
                    setBoostingListing(null);
                    setCheckoutStep("list");
                  }}
                  className="w-full bg-[#1E2235] hover:bg-[#2A2E45] text-white font-poppins font-semibold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING ACTION BOTTOM STICKY NAVIGATION FOR DASHBOARD */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F2F5] px-6 py-3.5 z-40 flex shadow-[0px_-8px_24px_rgba(0,0,0,0.03)] justify-between items-center">
        <div className="max-w-[1280px] mx-auto w-full flex justify-between items-center">
          
          <button 
            onClick={() => setActiveScreen("dashboard")}
            className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
              activeScreen === "dashboard" || activeScreen === "inquiries" ? "text-blue-600" : "text-[#94A3B8]"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] sm:text-xs font-bold uppercase mt-1">Home</span>
          </button>

          <button 
            onClick={() => setActiveScreen("step1")}
            className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
              activeScreen.startsWith("step") ? "text-blue-600" : "text-[#94A3B8]"
            }`}
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] sm:text-xs font-bold uppercase mt-1">Add Listing</span>
          </button>

          <button 
            onClick={() => setActiveScreen("listings")}
            className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
              activeScreen === "listings" ? "text-blue-600" : "text-[#94A3B8]"
            }`}
          >
            <ListTodo className="w-6 h-6" />
            <span className="text-[10px] sm:text-xs font-bold uppercase mt-1">My Listings</span>
          </button>

          <button 
            onClick={() => setActiveScreen("profile")}
            className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
              activeScreen === "profile" ? "text-blue-600" : "text-[#94A3B8]"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] sm:text-xs font-bold uppercase mt-1">Profile</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
