"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Home,
  Users,
  Megaphone,
  Image as ImageIcon,
  Mail,
  AlertTriangle,
  Settings as SettingsIcon,
  User,
  LogOut,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  Phone,
  ExternalLink,
  Lock,
  PlusCircle,
  Slash,
  Play,
  Sparkles,
  Star,
  MapPin,
  Activity,
  AlertCircle,
  UserMinus,
  UserCheck,
  Share2,
  Send,
  MoreVertical
} from "lucide-react";
import { PropertyListing } from "@/data/listings";
import { getApiUrl, getImageUrl } from "@/data/api";
import {
  mockOwners,
  mockAdvertisements,
  mockContactMessages,
  mockReports,
  mockPromotionSlots,
  Owner,
  Advertisement,
  ContactMessage,
  ListingReport,
  PromotionSlot
} from "@/data/admin-mock";

export default function AdminPage() {
  // Authentication State
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");

  // Admin Tab Navigation
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local React State initialized from mock files / localStorage
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [backendPromos, setBackendPromos] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<PromotionSlot[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [adminBoostRequests, setAdminBoostRequests] = useState<any[]>([]);
  const [activeBoostDropdownId, setActiveBoostDropdownId] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState({
    siteName: "RoomsWallah",
    supportEmail: "support@roomswallah.com",
    supportPhone: "+91 99999 88888",
    facebook: "https://facebook.com/roomswallah",
    instagram: "https://instagram.com/roomswallah",
    linkedin: "https://linkedin.com/company/roomswallah",
    twitter: "https://twitter.com/roomswallah",
    logoUrl: "/assets/room1.png"
  });
  const [guideTitle, setGuideTitle] = useState("");
  const [guideDescription, setGuideDescription] = useState("");
  const [guideVideoUrl, setGuideVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin Chief",
    email: "manish12643@gmail.com",
    password: "Goa@627830",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  });

  // Admin-authenticated API fetch helper
  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  // Load / Sync state with localStorage
  const fetchData = async () => {
    try {
      const [resListings, resOwners, resPromos, resBoosts, resReports] = await Promise.all([
        adminFetch(getApiUrl("/api/admin/listings")),
        adminFetch(getApiUrl("/api/admin/owners")),
        adminFetch(getApiUrl("/api/promotions?includeInactive=true")),
        adminFetch(getApiUrl("/api/admin/boost-requests")),
        adminFetch(getApiUrl("/api/admin/reports"))
      ]);

      let apiListings: PropertyListing[] = [];
      if (resListings.ok) {
        const rawListings = await resListings.json();
        apiListings = (rawListings || []).map((p: any) => ({
          id: p.id || p._id,
          title: p.title,
          type: p.type,
          rent: p.rent,
          city: p.city,
          area: p.area,
          image: p.image || "/assets/room1.png",
          description: p.description || "",
          amenities: p.amenities || [],
          ownerName: p.ownerName || "",
          ownerPhone: p.ownerPhone || "",
          ownerWhatsApp: p.ownerWhatsApp || "",
          tag: p.tag || "Boys Only",
          rating: p.rating || 4.5,
          furnishing: p.furnishing || "Fully Furnished",
          sharing: p.sharing || "Single Room",
          images: p.images || []
        }));
      }

      setProperties(apiListings);

      let apiOwners: Owner[] = [];
      if (resOwners.ok) {
        const rawOwners = await resOwners.json();
        apiOwners = (rawOwners || []).map((o: any) => ({
          id: o.id || o._id,
          name: o.name || "Unknown Owner",
          mobile: o.phone || o.mobile || "+91 99999 88888",
          email: o.email || "owner@gmail.com",
          joinedDate: o.createdAt ? o.createdAt.split("T")[0] : (o.joinedDate || new Date().toISOString().split("T")[0]),
          avatar: o.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${o.name || "Unknown"}`,
          status: o.status || "Active"
        }));
      }

      const combinedOwners = [...apiOwners];

      // Auto-populate owners for listings that don't have owner records
      apiListings.forEach((p) => {
        const hasOwner = combinedOwners.some((o) => o.name.toLowerCase() === p.ownerName.toLowerCase());
        if (!hasOwner && p.ownerName) {
          combinedOwners.push({
            id: "ow_" + p.id,
            name: p.ownerName,
            mobile: p.ownerPhone || "+91 99999 88888",
            email: `${p.ownerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
            joinedDate: new Date().toISOString().split("T")[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.ownerName}`,
            status: "Active"
          });
        }
      });

      setOwners(combinedOwners);

      if (resPromos.ok) {
        const data = await resPromos.json();
        setBackendPromos(data || []);
        const formatted = (data || []).map((promo: any) => ({
          id: promo._id || promo.id,
          companyName: promo.title,
          website: promo.buttonLink,
          image: promo.badge || "NEW",
          startDate: promo.subtitle || "Quick & Easy",
          endDate: promo.buttonText || "Explore",
          status: promo.status === "active" ? "Active" : "Disabled"
        }));
        setAdvertisements(formatted);
      }

      if (resBoosts.ok) {
        const boostsData = await resBoosts.json();
        setAdminBoostRequests(boostsData || []);
      }

      if (resReports && resReports.ok) {
        const reportsData = await resReports.json();
        setReports(reportsData || []);
      }
    } catch (err) {
      console.error("Error loading admin data from backend:", err);
    }
  };

  const handleVerifyBoost = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await adminFetch(getApiUrl(`/api/admin/boost-requests/${id}/verify`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Boost request successfully ${status === "Approved" ? "Approved" : "Rejected"}!`);
        // Refresh requests
        const resBoosts = await adminFetch(getApiUrl("/api/admin/boost-requests"));
        if (resBoosts.ok) {
          const boostsData = await resBoosts.json();
          setAdminBoostRequests(boostsData || []);
        }
      } else {
        const err = await res.json();
        alert(err.message || "Failed to verify boost request.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error verifying boost request.");
    }
  };

  const handleDeleteBoost = async (id: string) => {
    try {
      const res = await adminFetch(getApiUrl(`/api/admin/boost-requests/${id}`), {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Boost request deleted successfully!");
        // Refresh requests
        const resBoosts = await adminFetch(getApiUrl("/api/admin/boost-requests"));
        if (resBoosts.ok) {
          const boostsData = await resBoosts.json();
          setAdminBoostRequests(boostsData || []);
        }
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete boost request.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error deleting boost request.");
    }
  };

  // Load / Sync state with backend on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Clear legacy dummy mock keys permanently from browser local storage
      localStorage.removeItem("roomswallah_properties");
      localStorage.removeItem("roomswallah_reports");
      localStorage.removeItem("roomswallah_messages");
      localStorage.removeItem("roomswallah_owners");
      localStorage.removeItem("roomswallah_advertisements");

      const checkAdminSession = async () => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          setIsLoggedIn(false);
          localStorage.removeItem("admin_logged_in");
          return;
        }
        try {
          const res = await adminFetch(getApiUrl("/api/admin/me"), {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            setIsLoggedIn(true);
            fetchData();
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem("admin_logged_in");
            localStorage.removeItem("admin_token");
          }
        } catch (e) {
          console.error("Admin verification check failed:", e);
          setIsLoggedIn(false);
        }
      };

      const storedAuth = localStorage.getItem("admin_logged_in");
      if (storedAuth === "true") {
        checkAdminSession();
      }

      // Load promotions slots from backend
      const loadSlots = async () => {
        try {
          const resSlots = await adminFetch(getApiUrl("/api/promotions/slots"));
          if (resSlots.ok) {
            const slotsData = await resSlots.json();
            if (Array.isArray(slotsData)) {
              const merged = mockPromotionSlots.map((mockSlot) => {
                const found = slotsData.find((s: any) => s && s.slotId === mockSlot.slotId);
                return found ? { ...mockSlot, ...found } : mockSlot;
              });
              setPromotions(merged);
              localStorage.setItem("roomswallah_promotions", JSON.stringify(merged));
              return;
            }
          }
        } catch (e) {
          console.error("Error loading promo slots from backend:", e);
        }
        const promos = localStorage.getItem("roomswallah_promotions");
        if (promos) {
          try {
            const parsed = JSON.parse(promos);
            const merged = mockPromotionSlots.map((mockSlot) => {
              const found = parsed.find((s: any) => s && s.slotId === mockSlot.slotId);
              return found ? { ...mockSlot, ...found } : mockSlot;
            });
            setPromotions(merged);
          } catch (e) {
            console.error("Error parsing promotions from localStorage:", e);
            savePromotions(mockPromotionSlots);
          }
        } else {
          savePromotions(mockPromotionSlots);
        }
      };
      loadSlots();

      const loadGuide = async () => {
        try {
          const resGuide = await adminFetch(getApiUrl("/api/admin/guide"));
          if (resGuide.ok) {
            const guideData = await resGuide.json();
            setGuideTitle(guideData.title || "");
            setGuideDescription(guideData.description || "");
            setGuideVideoUrl(guideData.videoUrl || "");
          }
        } catch (e) {
          console.error("Error loading guide settings from backend:", e);
        }
      };
      loadGuide();

      const msgs = localStorage.getItem("roomswallah_messages");
      if (msgs) {
        try {
          setMessages(JSON.parse(msgs));
        } catch (e) {
          console.error("Error parsing messages:", e);
          saveMessages(mockContactMessages);
        }
      } else {
        saveMessages(mockContactMessages);
      }

      const reps = localStorage.getItem("roomswallah_reports");
      if (reps) {
        try {
          setReports(JSON.parse(reps));
        } catch (e) {
          console.error("Error parsing reports:", e);
          saveReports(mockReports);
        }
      } else {
        saveReports(mockReports);
      }

      const settings = localStorage.getItem("roomswallah_settings");
      if (settings) {
        try {
          setSiteSettings(JSON.parse(settings));
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
      }

      const profile = localStorage.getItem("roomswallah_admin_profile");
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          setAdminProfile(parsed);
          setProfileName(parsed.name);
          setProfileEmail(parsed.email);
          setProfilePassword(parsed.password);
        } catch (e) {
          console.error("Error parsing admin profile:", e);
        }
      }

      fetchData();
    }
  }, []);

  // Sync state helpers
  const saveProperties = (data: PropertyListing[]) => {
    setProperties(data);
    localStorage.setItem("roomswallah_properties", JSON.stringify(data));
    window.dispatchEvent(new Event("savedListingsUpdated"));
    window.dispatchEvent(new Event("roomswallahPropertiesUpdated"));
  };

  const saveOwners = (data: Owner[]) => {
    setOwners(data);
    localStorage.setItem("roomswallah_owners", JSON.stringify(data));
  };

  const saveAdvertisements = (data: Advertisement[]) => {
    setAdvertisements(data);
    localStorage.setItem("roomswallah_advertisements", JSON.stringify(data));
  };

  const savePromotions = async (data: PromotionSlot[]) => {
    setPromotions(data);
    localStorage.setItem("roomswallah_promotions", JSON.stringify(data));
    window.dispatchEvent(new Event("roomswallahPropertiesUpdated"));
    try {
      await adminFetch(getApiUrl("/api/promotions/slots"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error("Error saving slots to backend:", e);
    }
  };

  const saveMessages = (data: ContactMessage[]) => {
    setMessages(data);
    localStorage.setItem("roomswallah_messages", JSON.stringify(data));
  };

  const saveReports = (data: ListingReport[]) => {
    setReports(data);
    localStorage.setItem("roomswallah_reports", JSON.stringify(data));
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch(getApiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        localStorage.setItem("admin_token", data.token);
        if (rememberMe) {
          localStorage.setItem("admin_logged_in", "true");
        }
        setLoginError("");
        fetchData();
      } else {
        setLoginError(data.message || "Invalid email or password credentials.");
      }
    } catch (err) {
      setLoginError("Failed to connect to backend auth server.");
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await adminFetch(getApiUrl("/api/admin/logout"), { method: "POST" });
    } catch (e) {}
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_token");
  };

  // -------------------------------------------------------------
  // CRUD & Interactive Admin Operations State
  // -------------------------------------------------------------

  // Search & Filter state for listings
  const [listingSearch, setListingSearch] = useState("");
  const [listingFilterType, setListingFilterType] = useState("all");
  const [listingFilterCity, setListingFilterCity] = useState("all");
  const [listingPage, setListingPage] = useState(1);

  // Property Modal State
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyListing | null>(null);
  const [propForm, setPropForm] = useState<Partial<PropertyListing>>({
    title: "",
    type: "room",
    rent: 5000,
    city: "Greater Noida",
    area: "Knowledge Park 3",
    image: "/assets/room1.png",
    description: "",
    amenities: ["Wi-Fi", "AC"],
    ownerName: "",
    ownerPhone: "",
    ownerWhatsApp: "",
    tag: "Boys Only",
    rating: 4.8,
    furnishing: "Fully Furnished",
    sharing: "Single Room"
  });

  // Owner Search state
  const [ownerSearch, setOwnerSearch] = useState("");

  // Owner Profile View state
  const [viewingOwnerId, setViewingOwnerId] = useState<string | null>(null);

  const viewingOwner = useMemo(() => {
    return owners.find((o) => o.id === viewingOwnerId) || null;
  }, [owners, viewingOwnerId]);

  // Promotion Slot selection state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedPromoSlot, setSelectedPromoSlot] = useState<string | null>(null);
  const [promoSearchQuery, setPromoSearchQuery] = useState("");

  // Advertisement modal state
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adForm, setAdForm] = useState<Partial<Advertisement>>({
    companyName: "",
    website: "",
    image: "/assets/room1.png",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Active"
  });

  // Folder Upload and Image States
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size is too large (max 5MB).");
      return null;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await adminFetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.imageUrl;
        return url;
      } else {
        const err = await res.json();
        alert(err.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error connecting to upload server.");
    } finally {
      setIsUploading(false);
    }
    return null;
  };

  // Contact details modal
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  // Profile management inputs
  const [profileName, setProfileName] = useState(adminProfile.name);
  const [profileEmail, setProfileEmail] = useState(adminProfile.email);
  const [profilePassword, setProfilePassword] = useState(adminProfile.password);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);

  // Dynamic values derived from state
  const dynamicOwnersList = useMemo(() => {
    // Generate derived list of owners matching properties
    const ownersMap = new Map<string, number>();
    properties.forEach((p) => {
      ownersMap.set(p.ownerName, (ownersMap.get(p.ownerName) || 0) + 1);
    });

    return owners.map((owner) => ({
      ...owner,
      listingsCount: ownersMap.get(owner.name) || 0
    }));
  }, [properties, owners]);

  // Handle adding new listing automatically adds owner if not exists
  const checkAndAddOwner = (ownerName: string, ownerPhone: string) => {
    const exists = owners.some((o) => o.name.toLowerCase() === ownerName.toLowerCase());
    if (!exists && ownerName) {
      const newOwnerRecord: Owner = {
        id: "ow_" + Date.now(),
        name: ownerName,
        mobile: ownerPhone || "+91 99999 88888",
        email: `${ownerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        joinedDate: new Date().toISOString().split("T")[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerName}`,
        status: "Active"
      };
      saveOwners([...owners, newOwnerRecord]);
    }
  };

  // Submit Listing Add/Edit
  const handlePropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        // Edit
        const res = await adminFetch(getApiUrl(`/api/admin/listings/${editingProperty.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propForm)
        });
        if (res.ok) {
          fetchData();
        }
      } else {
        // Add
        const res = await adminFetch(getApiUrl("/api/admin/listings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propForm)
        });
        if (res.ok) {
          fetchData();
        }
      }
    } catch (err) {
      console.error("Error saving property listing:", err);
    }
    setIsPropModalOpen(false);
    setEditingProperty(null);
  };

  // Open property modal for edit
  const openPropEdit = (p: PropertyListing) => {
    setEditingProperty(p);
    setPropForm(p);
    setIsPropModalOpen(true);
  };

  // Open property modal for add
  const openPropAdd = () => {
    setEditingProperty(null);
    setPropForm({
      title: "",
      type: "room",
      rent: 5000,
      city: "Greater Noida",
      area: "Knowledge Park 3",
      image: "/assets/room1.png",
      description: "",
      amenities: ["Wi-Fi", "AC"],
      ownerName: "",
      ownerPhone: "",
      ownerWhatsApp: "",
      tag: "Boys Only",
      rating: 4.8,
      furnishing: "Fully Furnished",
      sharing: "Single Room"
    });
    setIsPropModalOpen(true);
  };

  // Delete listing
  const deleteProperty = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isObjectId) {
        try {
          await adminFetch(getApiUrl(`/api/admin/listings/${id}`), {
            method: "DELETE"
          });
        } catch (err) {
          console.error("Error deleting property listing from backend:", err);
        }
      }

      if (typeof window !== "undefined") {
        try {
          const localProps = JSON.parse(localStorage.getItem("roomswallah_properties") || "[]");
          const updated = localProps.filter((p: any) => p.id !== id && p._id !== id);
          localStorage.setItem("roomswallah_properties", JSON.stringify(updated));
          window.dispatchEvent(new Event("roomswallahPropertiesUpdated"));
        } catch (e) {}
      }

      setProperties((prev) => prev.filter((p) => p.id !== id));
      fetchData();
    }
  };

  // Toggle Listing Block Status
  const toggleBlockProperty = async (id: string) => {
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;
    const isBlocked = isPropertyBlocked(prop);
    const nextStatus = isBlocked ? "Active" : "Inactive";
    try {
      const res = await adminFetch(getApiUrl(`/api/admin/listings/${id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error toggling property status:", err);
    }
  };

  // Owner action: Delete all listings
  const deleteOwnerListings = async (ownerName: string) => {
    if (confirm(`Are you sure you want to delete all listings by owner: ${ownerName}?`)) {
      const ownerProps = properties.filter((p) => p.ownerName.toLowerCase() === ownerName.toLowerCase());
      
      // Delete from backend in parallel
      await Promise.all(
        ownerProps.map(async (p) => {
          const isObjectId = /^[0-9a-fA-F]{24}$/.test(p.id);
          if (isObjectId) {
            try {
              await adminFetch(getApiUrl(`/api/admin/listings/${p.id}`), {
                method: "DELETE"
              });
            } catch (err) {
              console.error(`Error deleting listing ${p.id} from backend:`, err);
            }
          }
        })
      );

      // Delete locally
      const remaining = properties.filter((p) => p.ownerName.toLowerCase() !== ownerName.toLowerCase());
      saveProperties(remaining);
      fetchData();
    }
  };

  // Owner action: Toggle Blacklist
  const toggleBlacklistOwner = async (ownerId: string, name: string) => {
    const owner = owners.find((o) => o.id === ownerId);
    if (!owner) return;
    const nextStatus = owner.status === "Active" ? "Blocked" : "Active";
    try {
      const res = await adminFetch(getApiUrl(`/api/admin/owners/${ownerId}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating owner status:", err);
    }
  };

  // Helper to view owner profile from anywhere (e.g. Listings tab)
  const handleViewOwnerProfile = (ownerName: string, ownerPhone?: string) => {
    let ownerObj = owners.find(o => o.name.toLowerCase() === ownerName.toLowerCase());
    if (!ownerObj) {
      const newId = "ow_" + Date.now();
      const newOwnerRecord: Owner = {
        id: newId,
        name: ownerName,
        mobile: ownerPhone || "+91 99999 88888",
        email: `${ownerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        joinedDate: new Date().toISOString().split("T")[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerName}`,
        status: "Active"
      };
      saveOwners([...owners, newOwnerRecord]);
      setViewingOwnerId(newId);
    } else {
      setViewingOwnerId(ownerObj.id);
    }
    setActiveTab("owners");
  };

  // Delete owner
  const deleteOwner = async (ownerId: string, name: string) => {
    if (confirm(`Are you sure you want to remove owner: ${name}?`)) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(ownerId);
      if (isObjectId) {
        try {
          await adminFetch(getApiUrl(`/api/admin/owners/${ownerId}`), {
            method: "DELETE"
          });
        } catch (err) {
          console.error("Error deleting owner from backend:", err);
        }
      }

      if (typeof window !== "undefined") {
        try {
          const localOwners = JSON.parse(localStorage.getItem("roomswallah_owners") || "[]");
          const updated = localOwners.filter((o: any) => o.id !== ownerId && o._id !== ownerId);
          localStorage.setItem("roomswallah_owners", JSON.stringify(updated));
        } catch (e) {}
      }

      setOwners((prev) => prev.filter((o) => o.id !== ownerId));
      fetchData();
    }
  };

  // Replace Promotion handler
  const handleReplacePromo = (slotId: string, listingId: string) => {
    const updated = promotions.map((p) =>
      p.slotId === slotId ? { ...p, listingId, status: "Active" as const } : p
    );
    savePromotions(updated);
    setIsPromoModalOpen(false);
  };

  // Delete Promo / Clear Slot
  const deletePromo = (slotId: string) => {
    const updated = promotions.map((p) =>
      p.slotId === slotId ? { ...p, listingId: null, status: "Empty" as const } : p
    );
    savePromotions(updated);
  };

  // Disable Promo
  const toggleDisablePromo = (slotId: string) => {
    const updated = promotions.map((p) => {
      if (p.slotId === slotId) {
        const nextStatus = p.status === "Active" ? ("Disabled" as const) : ("Active" as const);
        return { ...p, status: nextStatus };
      }
      return p;
    });
    savePromotions(updated);
  };

  // Submit Ad Add/Edit
  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: adForm.companyName,
        subtitle: adForm.startDate,
        badge: adForm.image,
        buttonText: adForm.endDate,
        buttonLink: adForm.website
      };

      if (editingAd) {
        const res = await adminFetch(getApiUrl(`/api/promotions/${editingAd.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchData();
        }
      } else {
        const res = await adminFetch(getApiUrl("/api/promotions"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchData();
        }
      }
    } catch (err) {
      console.error("Error saving promotion:", err);
    }
    setIsAdModalOpen(false);
    setEditingAd(null);
  };

  // Open Ad Modal
  const openAdEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setAdForm(ad);
    setIsAdModalOpen(true);
  };

  const openAdAdd = () => {
    setEditingAd(null);
    setAdForm({
      companyName: "",
      website: "",
      image: "/assets/room1.png",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active"
    });
    setIsAdModalOpen(true);
  };

  // Delete Ad
  const deleteAd = async (id: string) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isObjectId) {
        try {
          await adminFetch(getApiUrl(`/api/promotions/${id}`), {
            method: "DELETE"
          });
        } catch (err) {
          console.error("Error deleting advertisement from backend:", err);
        }
      }

      if (typeof window !== "undefined") {
        try {
          const localAds = JSON.parse(localStorage.getItem("roomswallah_advertisements") || "[]");
          const updated = localAds.filter((a: any) => a.id !== id && a._id !== id);
          localStorage.setItem("roomswallah_advertisements", JSON.stringify(updated));
        } catch (e) {}
      }

      setAdvertisements((prev) => prev.filter((a) => a.id !== id));
      fetchData();
    }
  };

  // Toggle Ad Disable
  const toggleDisableAd = async (id: string) => {
    const adObj = advertisements.find((a) => a.id === id);
    if (!adObj) return;
    const nextStatus = adObj.status === "Active" ? "inactive" : "active";
    try {
      const res = await adminFetch(getApiUrl(`/api/promotions/${id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error toggling status of advertisement:", err);
    }
  };

  // Promotion Card Modal and CRUD Operations State & Handlers
  const [isPromoCardModalOpen, setIsPromoCardModalOpen] = useState(false);
  const [editingPromoCard, setEditingPromoCard] = useState<any | null>(null);
  const [promoCardForm, setPromoCardForm] = useState<any>({
    title: "",
    subtitle: "",
    badge: "NEW",
    buttonText: "Explore Now",
    buttonLink: "/welcome",
    gradientFrom: "#6C4CF1",
    gradientTo: "#8E75FF",
    icon: "Sparkles",
    image: "",
    status: "active"
  });

  const openPromoCardAdd = () => {
    setEditingPromoCard(null);
    setPromoCardForm({
      title: "",
      subtitle: "",
      badge: "NEW",
      buttonText: "Explore Now",
      buttonLink: "/welcome",
      gradientFrom: "#6C4CF1",
      gradientTo: "#8E75FF",
      icon: "Sparkles",
      image: "",
      status: "active"
    });
    setIsPromoCardModalOpen(true);
  };

  const openPromoCardEdit = (promo: any) => {
    setEditingPromoCard(promo);
    setPromoCardForm({
      title: promo.title,
      subtitle: promo.subtitle,
      badge: promo.badge || "NEW",
      buttonText: promo.buttonText || "Explore Now",
      buttonLink: promo.buttonLink || "/welcome",
      gradientFrom: promo.gradientFrom || "#6C4CF1",
      gradientTo: promo.gradientTo || "#8E75FF",
      icon: promo.icon || "Sparkles",
      image: promo.image || "",
      status: promo.status || "active"
    });
    setIsPromoCardModalOpen(true);
  };

  const handlePromoCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPromoCard
        ? getApiUrl(`/api/promotions/${editingPromoCard._id || editingPromoCard.id}`)
        : getApiUrl("/api/promotions");
      const method = editingPromoCard ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoCardForm)
      });

      if (res.ok) {
        fetchData();
        setIsPromoCardModalOpen(false);
        setEditingPromoCard(null);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save promotion card.");
      }
    } catch (err) {
      console.error("Error saving promotion card:", err);
    }
  };

  const deletePromoCard = async (id: string) => {
    if (confirm("Are you sure you want to delete this promotion card?")) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isObjectId) {
        try {
          await adminFetch(getApiUrl(`/api/promotions/${id}`), {
            method: "DELETE"
          });
        } catch (err) {
          console.error("Error deleting promotion card from backend:", err);
        }
      }

      if (typeof window !== "undefined") {
        try {
          const localPromos = JSON.parse(localStorage.getItem("roomswallah_promotions") || "[]");
          const updated = localPromos.filter((p: any) => p.id !== id && p._id !== id);
          localStorage.setItem("roomswallah_promotions", JSON.stringify(updated));
        } catch (e) {}
      }

      setAdvertisements((prev) => prev.filter((a) => a.id !== id));
      fetchData();
    }
  };

  const toggleDisablePromoCard = async (promo: any) => {
    const nextStatus = promo.status === "active" ? "inactive" : "active";
    try {
      const res = await adminFetch(getApiUrl(`/api/promotions/${promo._id || promo.id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error toggling status of promotion card:", err);
    }
  };

  // Submit reply message
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewingMessage && replyText) {
      // Send a notification to the owner containing the reply message
      try {
        await adminFetch(getApiUrl("/api/admin/notifications"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mobile: viewingMessage.phone,
            title: `Support Reply: ${viewingMessage.subject}`,
            message: replyText,
            type: "info"
          })
        });
      } catch (err) {
        console.error("Failed to send reply notification to owner:", err);
      }

      // Mark as replied
      const updated = messages.map((m) => (m.id === viewingMessage.id ? { ...m, replied: true } : m));
      saveMessages(updated);
      setReplySuccess(true);
      setTimeout(() => {
        setReplySuccess(false);
        setReplyText("");
        setViewingMessage(null);
      }, 1500);
    }
  };

  // Delete Message
  const deleteMessage = (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      saveMessages(messages.filter((m) => m.id !== id));
    }
  };

  // Report actions
  const resolveReport = async (id: string, action: "delete" | "blacklist" | "ignore", listingId?: string, ownerName?: string) => {
    try {
      const res = await adminFetch(getApiUrl(`/api/admin/reports/${id}`), {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Failed to delete report on backend");
      }

      if (action === "delete" && listingId) {
        deleteProperty(listingId);
      } else if (action === "blacklist" && ownerName) {
        const owner = owners.find((o) => o.name === ownerName);
        if (owner) {
          toggleBlacklistOwner(owner.id, owner.name);
        } else {
          alert("Owner profile not found.");
        }
      }

      // Mark report resolved or delete it
      saveReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error resolving report:", err);
      alert("Failed to resolve/delete report on backend");
    }
  };

  // Save General settings
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("roomswallah_settings", JSON.stringify(siteSettings));
    alert("Settings updated successfully!");
  };

  // Save Guide settings
  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch(getApiUrl("/api/admin/guide"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: guideTitle,
          description: "",
          videoUrl: guideVideoUrl
        })
      });
      if (res.ok) {
        alert("Video Guide settings updated successfully!");
      } else {
        const err = await res.json();
        alert(`Failed to save video guide: ${err.message}`);
      }
    } catch (err) {
      console.error("Error saving guide settings:", err);
      alert("Error connecting to server.");
    }
  };

  // Video Upload Handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Video file size is too large (max 50MB).");
      return;
    }

    setIsUploadingVideo(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await adminFetch(getApiUrl("/api/upload/video"), {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setGuideVideoUrl(data.videoUrl);
        alert("Video uploaded successfully!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to upload video.");
      }
    } catch (err) {
      console.error("Error uploading video:", err);
      alert("Error connecting to upload server.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Update profile
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = { ...adminProfile, name: profileName, email: profileEmail, password: profilePassword };
    setAdminProfile(updatedProfile);
    localStorage.setItem("roomswallah_admin_profile", JSON.stringify(updatedProfile));
    setIsProfileUpdated(true);
    setTimeout(() => setIsProfileUpdated(false), 2000);
  };

  // Helper: check if listing is blocked
  const isPropertyBlocked = (p: PropertyListing) => {
    return p.description.startsWith("[BLOCKED] ");
  };

  // -------------------------------------------------------------
  // Filtered lists for rendering
  // -------------------------------------------------------------

  // Filtered properties
  const filteredPropertiesList = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(listingSearch.toLowerCase()) || p.ownerName.toLowerCase().includes(listingSearch.toLowerCase());
      const matchesType = listingFilterType === "all" ? true : p.type === listingFilterType;
      const matchesCity = listingFilterCity === "all" ? true : p.city === listingFilterCity;
      return matchesSearch && matchesType && matchesCity;
    });
  }, [properties, listingSearch, listingFilterType, listingFilterCity]);

  // Paginated properties list
  const listingsPerPage = 6;
  const paginatedPropertiesList = useMemo(() => {
    const start = (listingPage - 1) * listingsPerPage;
    return filteredPropertiesList.slice(start, start + listingsPerPage);
  }, [filteredPropertiesList, listingPage]);

  const totalListingPages = Math.ceil(filteredPropertiesList.length / listingsPerPage);

  // Filtered owners list
  const filteredOwnersList = useMemo(() => {
    return dynamicOwnersList.filter((o) =>
      o.name.toLowerCase().includes(ownerSearch.toLowerCase()) || o.email.toLowerCase().includes(ownerSearch.toLowerCase())
    );
  }, [dynamicOwnersList, ownerSearch]);

  // Filtered listings for promotions selection modal
  const filteredPromosSelectionList = useMemo(() => {
    return properties.filter((p) =>
      p.title.toLowerCase().includes(promoSearchQuery.toLowerCase()) || p.ownerName.toLowerCase().includes(promoSearchQuery.toLowerCase())
    );
  }, [properties, promoSearchQuery]);

  // -------------------------------------------------------------
  // RENDER INTERFACES
  // -------------------------------------------------------------

  // Hydration safety check
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6C4CF1]" />
      </div>
    );
  }

  // Login Screen Render
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 sm:px-6 relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#6C4CF1]/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#8E75FF]/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[450px] bg-white border border-[#ECECEC] rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10 text-left space-y-6"
        >
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white mx-auto shadow-md shadow-[#6C4CF1]/20">
              <Home className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="font-poppins font-bold text-2xl tracking-tight text-slate-900">
              Rooms<span className="text-[#6C4CF1]">Wallah</span> Admin
            </h1>
            <p className="text-xs text-[#6C4CF1] font-semibold uppercase tracking-wider">
              Control Panel Access Gateway
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@roomswallah.com"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none transition-all text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Standard credentials are:\nEmail: manish12643@gmail.com\nPassword: Goa@627830")}
                  className="text-xs text-[#6C4CF1] font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none transition-all text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-[#ECECEC] text-[#6C4CF1] focus:ring-[#6C4CF1] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-500 font-semibold cursor-pointer select-none">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-98 shadow-lg shadow-[#6C4CF1]/10 cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-xs text-[#94A3B8] font-medium">
              Tip: Standard passcode is <span className="text-slate-800 font-bold">admin / admin</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Sidebar navigation options
  const sidebarItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "listings", name: "Listings", icon: Home },
    { id: "owners", name: "Owners", icon: Users },
    { id: "boosts", name: "Boost Requests", icon: Sparkles, badge: adminBoostRequests.filter(r => r.status === "Pending").length },
    { id: "promotions", name: "Promotion Manager", icon: Megaphone },
    { id: "advertisements", name: "Advertisement Manager", icon: ImageIcon },
    { id: "messages", name: "Contact Messages", icon: Mail, badge: messages.filter(m => !m.replied).length },
    { id: "reports", name: "Reports", icon: AlertTriangle, badge: reports.length },
    { id: "settings", name: "Settings", icon: SettingsIcon },
    { id: "profile", name: "My Profile", icon: User },
    { id: "diagnostics", name: "Diagnostics", icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex text-slate-800">
      {/* -------------------------------------------------------------
          1. FIXED SIDEBAR
          ------------------------------------------------------------- */}
      <aside className="w-[260px] bg-white border-r border-[#ECECEC] h-screen fixed top-0 left-0 flex flex-col justify-between shrink-0 z-30 select-none text-left">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-[#ECECEC]/60 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white shadow-md shadow-[#6C4CF1]/10 shrink-0">
              <Home className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-bold text-lg tracking-tight leading-none text-slate-900">
                Rooms<span className="text-[#6C4CF1]">Wallah</span>
              </span>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setListingPage(1);
                    setViewingOwnerId(null);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? "bg-[#F0EDFF] text-[#6C4CF1]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#6C4CF1]" : "text-[#94A3B8] group-hover:text-slate-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-[#6C4CF1] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center leading-none">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Quick Profile Card & Logout */}
        <div className="p-4 border-t border-[#ECECEC]/60 space-y-3 bg-slate-50/55">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden relative shrink-0 border border-[#ECECEC]">
              <Image
                src={adminProfile.avatar}
                alt="Admin Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-800 truncate leading-none">{adminProfile.name}</span>
              <span className="text-[10px] text-[#94A3B8] font-semibold truncate mt-1">Super Admin</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-red-100 bg-red-50/40 hover:bg-red-50 text-red-500 text-xs font-bold active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          2. MAIN CONTENT WRAPPER
          ------------------------------------------------------------- */}
      <div className="flex-1 pl-[260px] flex flex-col min-h-screen">
        
        {/* HEADER BAR */}
        <header className="bg-white border-b border-[#ECECEC]/60 h-20 flex items-center justify-between px-8 sticky top-0 z-20 select-none">
          <div className="text-left space-y-1">
            <h2 className="font-poppins font-bold text-slate-900 text-lg leading-none capitalize">
              {activeTab === "dashboard" ? "Admin Dashboard" : activeTab.replace("-", " ")}
            </h2>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#94A3B8]">
              <span>RoomsWallah</span>
              <span>/</span>
              <span className="text-[#6C4CF1] capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 border border-[#ECECEC] rounded-xl text-xs font-bold text-[#1E2235] hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Site</span>
            </Link>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="p-8 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              
              {/* =========================================================
                  TAB: DASHBOARD
                  ========================================================= */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.015)] hover:shadow-[0px_12px_28px_rgba(108,76,241,0.05)] hover:-translate-y-1 transition-all duration-300 text-left flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Listings</span>
                        <h3 className="font-poppins font-bold text-3xl text-slate-900">{properties.length}</h3>
                        <p className="text-xs text-slate-500 font-medium">Rooms, PG & Hostels</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#6C4CF1] flex items-center justify-center">
                        <Home className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.015)] hover:shadow-[0px_12px_28px_rgba(99,102,241,0.05)] hover:-translate-y-1 transition-all duration-300 text-left flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Owners</span>
                        <h3 className="font-poppins font-bold text-3xl text-slate-900">{owners.length}</h3>
                        <p className="text-xs text-slate-500 font-medium">Verified Landlords</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.015)] hover:shadow-[0px_12px_28px_rgba(236,72,153,0.05)] hover:-translate-y-1 transition-all duration-300 text-left flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Promotions</span>
                        <h3 className="font-poppins font-bold text-3xl text-slate-900">
                          {promotions.filter(p => p.status === "Active").length}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Promotional Slots</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                        <Megaphone className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.015)] hover:shadow-[0px_12px_28px_rgba(59,130,246,0.05)] hover:-translate-y-1 transition-all duration-300 text-left flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Advertisements</span>
                        <h3 className="font-poppins font-bold text-3xl text-slate-900">
                          {advertisements.filter(a => a.status === "Active").length}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">External Ad Banners</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* System Summary Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                         {/* Left Column: Recent Reported Listings (7 cols) */}
                    <div className="lg:col-span-7 bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-2">
                        <h3 className="font-poppins font-bold text-sm text-[#1E2235] flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          Recent Flags & Reports
                        </h3>
                        <button
                          onClick={() => setActiveTab("reports")}
                          className="text-xs font-bold text-[#6C4CF1] hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      {reports.length > 0 ? (
                        <div className="divide-y divide-[#F0F2F5] text-left font-poppins">
                          {reports.slice(0, 3).map((rep) => (
                            <div key={rep.id} className="py-3.5 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="bg-red-50 text-red-600 text-[8.5px] font-black px-2.5 py-1 rounded-[4px] border border-red-200/50 uppercase tracking-wider inline-block mb-1.5 leading-none">
                                  {rep.reason}
                                </span>
                                <h4 className="text-xs font-bold text-[#1E2235] truncate leading-tight">{rep.listingTitle}</h4>
                                {rep.message && (
                                  <p className="text-[10px] text-slate-400 font-medium italic mt-0.5 max-w-xs truncate font-poppins">
                                    "{rep.message}"
                                  </p>
                                )}
                                <span className="text-[10px] text-[#94A3B8] font-bold mt-1 block">Owner: {rep.ownerName} &bull; {rep.date}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  onClick={() => resolveReport(rep.id, "delete", rep.listingId)}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-[10px] font-black hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                  Delete Listing
                                </button>
                                <button
                                  onClick={() => resolveReport(rep.id, "ignore")}
                                  className="px-3 py-1.5 rounded-lg border border-[#ECECEC] text-[#64748B] text-[10px] font-black hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  Ignore
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-bold text-xs">
                          No pending reports. Platform status is healthy.
                        </div>
                      )}
                    </div>

                    {/* Right Column: Platform Audit Logs & Quick Stats (5 cols) */}
                    <div className="lg:col-span-5 bg-white border border-[#ECECEC] rounded-[28px] p-6 shadow-sm space-y-4">
                      <h3 className="font-poppins font-bold text-sm text-[#1E2235] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#6C4CF1]" />
                        Listing Type Breakdown
                      </h3>
                      
                      <div className="space-y-3.5 text-left">
                        {/* Rooms */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Rooms for Rent</span>
                            <span className="text-[#6C4CF1]">
                              {properties.filter((p) => p.type === "room").length}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#F0EDFF] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#6C4CF1] rounded-full" 
                              style={{ width: `${(properties.filter(p => p.type === "room").length / properties.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* PG */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Paying Guest (PG)</span>
                            <span className="text-pink-600">
                              {properties.filter((p) => p.type === "pg").length}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-pink-500 rounded-full" 
                              style={{ width: `${(properties.filter(p => p.type === "pg").length / properties.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Hostels */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Hostels</span>
                            <span className="text-blue-600">
                              {properties.filter((p) => p.type === "hostel").length}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${properties.length > 0 ? (properties.filter(p => p.type === "hostel").length / properties.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Flats */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Flats for Rent</span>
                            <span className="text-emerald-600">
                              {properties.filter((p) => p.type === "flat").length}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${properties.length > 0 ? (properties.filter(p => p.type === "flat").length / properties.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB: LISTINGS
                  ========================================================= */}
              {activeTab === "listings" && (
                <div className="space-y-6">
                  {/* Top bar with Search and Filters */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-[24px] border border-[#ECECEC] shadow-xs">
                    <div className="flex-1 max-w-md relative">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={listingSearch}
                        onChange={(e) => {
                          setListingSearch(e.target.value);
                          setListingPage(1);
                        }}
                        placeholder="Search properties or owner..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Filter Type */}
                      <select
                        value={listingFilterType}
                        onChange={(e) => {
                          setListingFilterType(e.target.value);
                          setListingPage(1);
                        }}
                        className="bg-slate-50 border border-[#ECECEC] rounded-xl px-3 py-2 text-xs font-bold text-[#64748B]"
                      >
                        <option value="all">All Categories</option>
                        <option value="room">Rooms</option>
                        <option value="pg">PGs</option>
                        <option value="hostel">Hostels</option>
                        <option value="flat">Flats</option>
                      </select>

                      {/* Filter City */}
                      <select
                        value={listingFilterCity}
                        onChange={(e) => {
                          setListingFilterCity(e.target.value);
                          setListingPage(1);
                        }}
                        className="bg-slate-50 border border-[#ECECEC] rounded-xl px-3 py-2 text-xs font-bold text-[#64748B]"
                      >
                        <option value="all">All Cities</option>
                        <option value="Greater Noida">Greater Noida</option>
                        <option value="Noida">Noida</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gurugram">Gurugram</option>
                      </select>

                      <button
                        onClick={openPropAdd}
                        className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#6C4CF1]/10"
                      >
                        <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                        <span>Add Listing</span>
                      </button>
                    </div>
                  </div>

                  {/* Listings Table Card */}
                  <div className="bg-white border border-[#ECECEC] rounded-[28px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto text-left">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Property Name</th>
                            <th className="px-6 py-4">Owner Name</th>
                            <th className="px-6 py-4">City</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235]">
                          {paginatedPropertiesList.map((p) => {
                            const isBlocked = isPropertyBlocked(p);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="w-12 h-9 rounded-lg relative overflow-hidden bg-slate-100 border border-[#ECECEC]">
                                    <Image
                                      src={p.image ? getImageUrl(p.image) : "/assets/room1.png"}
                                      alt={p.title}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-[200px] truncate">
                                  <span className="font-bold text-[#1E2235] block truncate">{p.title}</span>
                                  <span className="text-[9px] text-[#94A3B8] mt-0.5 block">{p.area}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleViewOwnerProfile(p.ownerName, p.ownerPhone)}
                                    className="text-[#6C4CF1] hover:underline font-bold text-left cursor-pointer"
                                  >
                                    {p.ownerName}
                                  </button>
                                </td>
                                <td className="px-6 py-4">{p.city}</td>
                                <td className="px-6 py-4 capitalize">
                                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                    p.type === "room" ? "bg-indigo-50 text-indigo-600" :
                                    p.type === "pg" ? "bg-pink-50 text-pink-600" :
                                    p.type === "flat" ? "bg-emerald-50 text-emerald-600" :
                                    "bg-blue-50 text-blue-600"
                                  }`}>
                                    {p.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                    isBlocked ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                  }`}>
                                    {isBlocked ? "Blocked" : "Active"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    <Link
                                      href={`/${p.type === "room" ? "rooms" : p.type === "hostel" ? "hostels" : "pg"}/${p.id}`}
                                      target="_blank"
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                      title="View Public Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                    <button
                                      onClick={() => openPropEdit(p)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                      title="Edit Details"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => toggleBlockProperty(p.id)}
                                      className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors ${
                                        isBlocked ? "text-emerald-500 hover:text-emerald-700" : "text-amber-500 hover:text-amber-700"
                                      }`}
                                      title={isBlocked ? "Unblock Listing" : "Block Listing"}
                                    >
                                      <Slash className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteProperty(p.id)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                      title="Delete Listing"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalListingPages > 1 && (
                      <div className="px-6 py-4.5 border-t border-[#ECECEC] flex items-center justify-between">
                        <span className="text-[11px] text-[#94A3B8] font-bold">
                          Showing {listingsPerPage * (listingPage - 1) + 1} - {Math.min(listingsPerPage * listingPage, filteredPropertiesList.length)} of {filteredPropertiesList.length} listings
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => setListingPage(p => Math.max(p - 1, 1))}
                            disabled={listingPage === 1}
                            className="w-8 h-8 rounded-lg border border-[#ECECEC] flex items-center justify-center text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            &lt;
                          </button>
                          {Array.from({ length: totalListingPages }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setListingPage(idx + 1)}
                              className={`w-8 h-8 rounded-lg font-black text-xs transition-colors cursor-pointer ${
                                listingPage === idx + 1
                                  ? "bg-[#6C4CF1] text-white"
                                  : "border border-[#ECECEC] text-[#1E2235] hover:bg-slate-50"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setListingPage(p => Math.min(p + 1, totalListingPages))}
                            disabled={listingPage === totalListingPages}
                            className="w-8 h-8 rounded-lg border border-[#ECECEC] flex items-center justify-center text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB: OWNERS
                  ========================================================= */}
              {activeTab === "owners" && (
                viewingOwner !== null ? (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header Card */}
                    <div className="bg-white/80 backdrop-blur-md border border-[#ECECEC] rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left relative overflow-hidden">
                      {/* Decorative background element */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#6C4CF1]/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center space-x-5 relative z-10">
                        <div className="w-20 h-20 rounded-2xl relative overflow-hidden bg-slate-100 border-[3px] border-white shadow-lg shrink-0">
                          <Image
                            src={viewingOwner.avatar}
                            alt={viewingOwner.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-poppins font-black text-2xl text-slate-900 leading-tight tracking-tight">
                              {viewingOwner.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              viewingOwner.status === "Active" 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50" 
                                : "bg-rose-100 text-rose-800 border border-rose-200/50"
                            }`}>
                              {viewingOwner.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                            <span>Verified Landlord &bull; Joined {viewingOwner.joinedDate}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap relative z-10">
                        <button
                          onClick={() => setViewingOwnerId(null)}
                          className="px-4 py-2.5 bg-white border border-[#ECECEC] rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>&larr; Back to List</span>
                        </button>
                        <a
                          href={`tel:${viewingOwner.mobile}`}
                          className="px-4 py-2.5 bg-[#6C4CF1] hover:bg-[#5B3FE6] rounded-xl text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#6C4CF1]/10"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`mailto:${viewingOwner.email}`}
                          className="px-4 py-2.5 bg-white border border-[#ECECEC] hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email</span>
                        </a>
                        <button
                          onClick={() => toggleBlacklistOwner(viewingOwner.id, viewingOwner.name)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 shadow-sm ${
                            viewingOwner.status === "Blacklisted"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70"
                              : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70"
                          }`}
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>{viewingOwner.status === "Blacklisted" ? "Whitelist Owner" : "Blacklist Owner"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Info and Statistics Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Contact Info Card (5 cols) */}
                      <div className="lg:col-span-5 bg-white border border-[#ECECEC] rounded-[32px] p-6 shadow-sm text-left space-y-5">
                        <div className="border-b border-[#F0F2F5] pb-3">
                          <h4 className="font-poppins font-black text-sm text-[#1E2235] tracking-tight">Personal Details</h4>
                          <p className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">Primary landlord contact info</p>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Row 1: Name */}
                          <div className="flex items-center space-x-3.5 py-1">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-[#ECECEC] flex items-center justify-center text-slate-500 shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#94A3B8] font-bold uppercase tracking-wider block leading-none">Full Name</span>
                              <span className="text-xs font-bold text-slate-800 mt-1 block">{viewingOwner.name}</span>
                            </div>
                          </div>

                          {/* Row 2: Phone */}
                          <div className="flex items-center space-x-3.5 py-1">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-[#ECECEC] flex items-center justify-center text-slate-500 shrink-0">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#94A3B8] font-bold uppercase tracking-wider block leading-none">Phone Number</span>
                              <span className="text-xs font-bold text-slate-800 mt-1 block">{viewingOwner.mobile}</span>
                            </div>
                          </div>

                          {/* Row 3: Email */}
                          <div className="flex items-center space-x-3.5 py-1">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-[#ECECEC] flex items-center justify-center text-slate-500 shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#94A3B8] font-bold uppercase tracking-wider block leading-none">Email Address</span>
                              <span className="text-xs font-bold text-slate-800 mt-1 block truncate max-w-[200px]">{viewingOwner.email}</span>
                            </div>
                          </div>

                          {/* Row 4: ID */}
                          <div className="flex items-center space-x-3.5 py-1">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-[#ECECEC] flex items-center justify-center text-slate-500 shrink-0">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#94A3B8] font-bold uppercase tracking-wider block leading-none">System ID</span>
                              <span className="text-[11px] font-mono text-slate-400 mt-1 block">{viewingOwner.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stats Card (7 cols) */}
                      <div className="lg:col-span-7 bg-white border border-[#ECECEC] rounded-[32px] p-6 shadow-sm text-left space-y-5">
                        <div className="border-b border-[#F0F2F5] pb-3">
                          <h4 className="font-poppins font-black text-sm text-[#1E2235] tracking-tight">Performance & Listings Metrics</h4>
                          <p className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">Real-time statistics overview</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Stat 1: Total */}
                          <div className="bg-[#F8FAFC] border border-[#ECECEC]/75 rounded-2xl p-4.5 text-left flex items-center justify-between group hover:border-[#6C4CF1]/30 transition-all duration-300">
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Properties</span>
                              <h3 className="font-poppins font-bold text-2xl text-slate-800 leading-none">
                                {properties.filter(p => p.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()).length}
                              </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] text-[#6C4CF1] flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Stat 2: Active */}
                          <div className="bg-[#F8FAFC] border border-[#ECECEC]/75 rounded-2xl p-4.5 text-left flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active Listings</span>
                              <h3 className="font-poppins font-bold text-2xl text-slate-800 leading-none">
                                {properties.filter(p => p.ownerName.toLowerCase() === viewingOwner.name.toLowerCase() && !isPropertyBlocked(p)).length}
                              </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <Check className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Stat 3: Blocked */}
                          <div className="bg-[#F8FAFC] border border-[#ECECEC]/75 rounded-2xl p-4.5 text-left flex items-center justify-between group hover:border-rose-500/30 transition-all duration-300">
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Blocked Listings</span>
                              <h3 className="font-poppins font-bold text-2xl text-slate-800 leading-none">
                                {properties.filter(p => p.ownerName.toLowerCase() === viewingOwner.name.toLowerCase() && isPropertyBlocked(p)).length}
                              </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Stat 4: Promoted */}
                          <div className="bg-[#F8FAFC] border border-[#ECECEC]/75 rounded-2xl p-4.5 text-left flex items-center justify-between group hover:border-pink-500/30 transition-all duration-300">
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Promoted Listings</span>
                              <h3 className="font-poppins font-bold text-2xl text-slate-800 leading-none">
                                {promotions.filter(slot => slot.listingId && properties.find(p => p.id === slot.listingId)?.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()).length}
                              </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Listings Section */}
                    <div className="bg-white border border-[#ECECEC] rounded-[32px] p-6 sm:p-7 shadow-sm text-left space-y-5">
                      <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-4">
                        <div className="text-left space-y-0.5">
                          <h4 className="font-poppins font-black text-base text-[#1E2235]">Properties Listed</h4>
                          <p className="text-[11px] text-[#94A3B8] font-semibold">Manage all listed assets under this account</p>
                        </div>
                        <button
                          onClick={openPropAdd}
                          className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white flex items-center justify-center space-x-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#6C4CF1]/10 active:scale-95"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add Property</span>
                        </button>
                      </div>

                      {properties.filter(p => p.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()).length > 0 ? (
                        <div className="overflow-x-auto rounded-[20px] border border-[#ECECEC]">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-[#ECECEC] text-[9.5px] font-black text-[#94A3B8] uppercase tracking-wider">
                                <th className="px-5 py-3.5 text-left">Image</th>
                                <th className="px-5 py-3.5 text-left">Property Name</th>
                                <th className="px-5 py-3.5 text-left">City</th>
                                <th className="px-5 py-3.5 text-left">Type</th>
                                <th className="px-5 py-3.5 text-left">Rent</th>
                                <th className="px-5 py-3.5 text-left">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235] bg-white">
                              {properties.filter(p => p.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()).map((p) => {
                                const isBlocked = isPropertyBlocked(p);
                                return (
                                  <tr key={p.id} className="hover:bg-[#F8FAFC]/65 transition-all duration-200">
                                    <td className="px-5 py-3.5">
                                      <div className="w-12 h-9 rounded-lg relative overflow-hidden bg-slate-100 border border-[#ECECEC] shadow-sm">
                                        <Image
                                          src={p.image ? getImageUrl(p.image) : "/assets/room1.png"}
                                          alt={p.title}
                                          fill
                                          className="object-cover animate-fade-in"
                                          unoptimized
                                        />
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 max-w-[200px]">
                                      <span className="font-bold text-[#1E2235] block truncate text-xs sm:text-[13px]">{p.title}</span>
                                      <span className="text-[9.5px] text-[#94A3B8] font-bold mt-0.5 block">{p.area}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 font-medium">{p.city}</td>
                                    <td className="px-5 py-3.5">
                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        p.type === "room" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                                        p.type === "pg" ? "bg-pink-50 text-pink-700 border border-pink-100" :
                                        p.type === "flat" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                        "bg-blue-50 text-blue-700 border border-blue-100"
                                      }`}>
                                        {p.type}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-[#6C4CF1]">₹{p.rent.toLocaleString("en-IN")}/{p.type === "hostel" ? "year" : "month"}</td>
                                    <td className="px-5 py-3.5">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        isBlocked ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? "bg-rose-500" : "bg-emerald-500"}`} />
                                        {isBlocked ? "Blocked" : "Active"}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                      <div className="flex items-center justify-end space-x-1.5">
                                        <Link
                                          href={`/${p.type === "room" ? "rooms" : p.type === "hostel" ? "hostels" : "pg"}/${p.id}`}
                                          target="_blank"
                                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#6C4CF1] transition-all"
                                          title="View Public Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Link>
                                        <button
                                          onClick={() => openPropEdit(p)}
                                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                                          title="Edit Details"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => toggleBlockProperty(p.id)}
                                          className={`p-1.5 hover:bg-slate-100 rounded-lg transition-all cursor-pointer ${
                                            isBlocked ? "text-emerald-500 hover:text-emerald-700" : "text-amber-500 hover:text-amber-700"
                                          }`}
                                          title={isBlocked ? "Unblock Listing" : "Block Listing"}
                                        >
                                          <Slash className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => deleteProperty(p.id)}
                                          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                          title="Delete Listing"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-slate-50/50 rounded-[20px] border border-dashed border-[#ECECEC] text-slate-400 font-bold text-xs">
                          No listings registered by this owner.
                        </div>
                      )}
                    </div>

                    {/* Promotions Section */}
                    <div className="bg-white border border-[#ECECEC] rounded-[32px] p-6 sm:p-7 shadow-sm text-left space-y-5">
                      <div className="border-b border-[#F0F2F5] pb-3">
                        <h4 className="font-poppins font-black text-base text-[#1E2235]">Active Promotions</h4>
                        <p className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">Assigned promotional slots on the website</p>
                      </div>
                      
                      {promotions.filter(slot => slot.listingId && properties.find(p => p.id === slot.listingId)?.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {promotions.filter(slot => slot.listingId && properties.find(p => p.id === slot.listingId)?.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()).map((slot) => {
                            const listing = properties.find(p => p.id === slot.listingId);
                            if (!listing) return null;
                            return (
                              <div key={slot.slotId} className="bg-gradient-to-br from-white to-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-3.5 text-left">
                                  <div className="w-12 h-9 rounded-lg relative overflow-hidden bg-slate-100 border border-[#ECECEC] shrink-0">
                                    <Image
                                      src={listing.image ? getImageUrl(listing.image) : "/assets/room1.png"}
                                      alt={listing.title}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-xs sm:text-[13px] text-[#1E2235] line-clamp-1">{listing.title}</h5>
                                    <span className="text-[9.5px] text-[#94A3B8] font-bold block mt-0.5 uppercase tracking-wider">
                                      {slot.slotName}
                                    </span>
                                  </div>
                                </div>
                                <div className="pt-3 border-t border-[#F0F2F5] flex justify-between items-center text-[10px] font-bold">
                                  <span className="bg-pink-100 border border-pink-200 text-pink-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[8px] font-black">
                                    {slot.status}
                                  </span>
                                  <span className="text-[#94A3B8] font-semibold">
                                    Expires: {slot.expiryDate || "N/A"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-[#F8FAFC]/40 rounded-2xl border border-dashed border-[#ECECEC] text-slate-400 font-bold text-xs">
                          No active promotions on this owner's properties.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top bar search */}
                    <div className="flex bg-white p-5 rounded-[24px] border border-[#ECECEC] shadow-xs">
                      <div className="flex-1 max-w-md relative">
                        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={ownerSearch}
                          onChange={(e) => setOwnerSearch(e.target.value)}
                          placeholder="Search owners by name or email..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Owners Table */}
                    <div className="bg-white border border-[#ECECEC] rounded-[28px] overflow-hidden shadow-sm">
                      <div className="overflow-x-auto text-left">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                              <th className="px-6 py-4">Profile</th>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Mobile</th>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">Listings</th>
                              <th className="px-6 py-4">Joined Date</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235]">
                            {filteredOwnersList.map((o) => (
                              <tr key={o.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => setViewingOwnerId(o.id)}
                                    className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden relative border border-[#ECECEC] block cursor-pointer"
                                  >
                                    <Image
                                      src={o.avatar}
                                      alt={o.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => setViewingOwnerId(o.id)}
                                    className="font-bold text-[#1E2235] hover:text-[#6C4CF1] hover:underline block text-left cursor-pointer"
                                  >
                                    {o.name}
                                  </button>
                                  {o.status === "Blacklisted" && (
                                    <span className="bg-red-50 text-red-500 text-[8px] font-black px-1 py-0.2 rounded uppercase mt-0.5 inline-block">
                                      Blacklisted
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">{o.mobile}</td>
                                <td className="px-6 py-4">{o.email}</td>
                                <td className="px-6 py-4">
                                  <span className="bg-slate-100 text-[#1E2235] font-black px-2 py-0.5 rounded-lg">
                                    {o.listingsCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4">{o.joinedDate}</td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    <button
                                      onClick={() => setViewingOwnerId(o.id)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                      title="View Profile"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <a
                                      href={`tel:${o.mobile}`}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                      title="Call Owner"
                                    >
                                      <Phone className="w-4 h-4" />
                                    </a>
                                    <a
                                      href={`mailto:${o.email}`}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                      title="Email Owner"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </a>
                                    <button
                                      onClick={() => toggleBlacklistOwner(o.id, o.name)}
                                      className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors ${
                                        o.status === "Blacklisted" ? "text-emerald-500 hover:text-emerald-700" : "text-amber-500 hover:text-amber-700"
                                      }`}
                                      title={o.status === "Blacklisted" ? "Whitelist Owner" : "Blacklist Owner"}
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteOwnerListings(o.name)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                      title="Delete All Listings"
                                    >
                                      <Slash className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteOwner(o.id, o.name)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                      title="Delete Profile"
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
                  </div>
                )
              )}

              {/* =========================================================
                  TAB: PROMOTIONS
                  ========================================================= */}
              {activeTab === "promotions" && (
                <div className="space-y-6">
                  {/* Slots Cards Header */}
                  <div className="bg-white p-6 rounded-[24px] border border-[#ECECEC] flex items-center justify-between shadow-xs text-left">
                    <div className="space-y-1">
                      <h3 className="font-poppins font-bold text-sm text-[#1E2235]">Active Promotional Slots</h3>
                      <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">
                        Configured elements display directly on target templates
                      </p>
                    </div>
                  </div>

                  {/* Slots Cards list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {promotions.filter((slot) => slot.slotId !== "home_card").map((slot) => {
                      // Find listing details
                      const listing = properties.find((p) => p.id === slot.listingId);
                      const isEmpty = slot.status === "Empty" || !listing;

                      return (
                        <div
                          key={slot.slotId}
                          className="bg-white border border-[#ECECEC] rounded-[28px] p-5 shadow-sm space-y-4 text-left flex flex-col justify-between"
                        >
                          {/* Slot Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-poppins font-black text-xs text-[#1E2235] tracking-wide uppercase">
                              {slot.slotName}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              slot.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                              slot.status === "Disabled" ? "bg-amber-50 text-amber-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {slot.status}
                            </span>
                          </div>

                          {/* Slot Body Image / Content */}
                          {!isEmpty && listing ? (
                            <div className="space-y-3 flex-1 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="aspect-[16/10] w-full rounded-2xl relative overflow-hidden bg-slate-50 border border-[#ECECEC]">
                                  <Image
                                    src={listing.image ? getImageUrl(listing.image) : "/assets/room1.png"}
                                    alt={listing.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-bold text-sm text-[#1E2235] line-clamp-1">{listing.title}</h4>
                                  <p className="text-[10px] text-[#94A3B8] font-bold">Owner: {listing.ownerName} &bull; Exp: {slot.expiryDate}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[16/10] w-full rounded-2xl bg-slate-50/50 border border-dashed border-[#ECECEC] flex flex-col items-center justify-center text-slate-400 space-y-2 flex-1 min-h-[140px]">
                              <Megaphone className="w-8 h-8 text-[#94A3B8]/60" />
                              <span className="text-xs font-bold">Slot is currently empty</span>
                            </div>
                          )}

                          {/* Slot Actions Footer */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#F0F2F5]">
                            <button
                              onClick={() => {
                                setSelectedPromoSlot(slot.slotId);
                                setIsPromoModalOpen(true);
                              }}
                              className="flex-1 py-2 rounded-xl bg-[#F0EDFF] hover:bg-[#6C4CF1]/10 text-[#6C4CF1] text-xs font-bold transition-colors cursor-pointer text-center"
                            >
                              {isEmpty ? "Add Listing" : "Replace"}
                            </button>
                            {!isEmpty && (
                              <>
                                <button
                                  onClick={() => toggleDisablePromo(slot.slotId)}
                                  className="px-3 py-2 rounded-xl border border-[#ECECEC] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xs font-bold"
                                >
                                  {slot.status === "Active" ? "Disable" : "Enable"}
                                </button>
                                <button
                                  onClick={() => deletePromo(slot.slotId)}
                                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* =========================================================
                  TAB: ADVERTISEMENTS
                  ========================================================= */}
              {activeTab === "advertisements" && (
                <div className="space-y-6">
                  {/* Header action */}
                  <div className="bg-white p-5 rounded-[24px] border border-[#ECECEC] flex items-center justify-between shadow-xs text-left">
                    <div className="space-y-1">
                      <h3 className="font-poppins font-bold text-sm text-[#1E2235]">Website Advertisements</h3>
                      <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">
                        Configure sponsored placements
                      </p>
                    </div>
                    <button
                      onClick={openAdAdd}
                      className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#6C4CF1]/10"
                    >
                      <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                      <span>Add Advertisement</span>
                    </button>
                  </div>

                  {/* Ads list */}
                  <div className="bg-white border border-[#ECECEC] rounded-[28px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto text-left">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                            <th className="px-6 py-4">Ad Image</th>
                            <th className="px-6 py-4">Company Name</th>
                            <th className="px-6 py-4">Website</th>
                            <th className="px-6 py-4">Start Date</th>
                            <th className="px-6 py-4">End Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235]">
                          {advertisements.map((ad) => (
                            <tr key={ad.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="w-16 h-10 rounded-lg relative overflow-hidden bg-slate-100 border border-[#ECECEC]">
                                  <Image
                                    src={ad.image ? getImageUrl(ad.image) : "/assets/room1.png"}
                                    alt={ad.companyName}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-[#1E2235]">{ad.companyName}</td>
                              <td className="px-6 py-4">
                                <a href={ad.website} target="_blank" rel="noopener noreferrer" className="text-[#6C4CF1] hover:underline flex items-center gap-1.5 w-fit">
                                  <span>Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="px-6 py-4">{ad.startDate}</td>
                              <td className="px-6 py-4">{ad.endDate}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                  ad.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                }`}>
                                  {ad.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => openAdEdit(ad)}
                                    className="px-2.5 py-1.5 border border-[#ECECEC] rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-[10.5px] font-bold transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => toggleDisableAd(ad.id)}
                                    className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
                                      ad.status === "Active" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                    }`}
                                  >
                                    {ad.status === "Active" ? "Disable" : "Enable"}
                                  </button>
                                  <button
                                    onClick={() => deleteAd(ad.id)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
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
                </div>
              )}

              {/* =========================================================
                  TAB: CONTACT MESSAGES
                  ========================================================= */}
              {activeTab === "messages" && (
                <div className="space-y-6">
                  {/* Messages Card */}
                  <div className="bg-white border border-[#ECECEC] rounded-[28px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto text-left">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                            <th className="px-6 py-4">Sender</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235]">
                          {messages.map((msg) => (
                            <tr key={msg.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-bold text-[#1E2235] block">{msg.name}</span>
                                <span className="text-[10px] text-[#94A3B8] mt-0.5 block">{msg.email}</span>
                              </td>
                              <td className="px-6 py-4">{msg.phone}</td>
                              <td className="px-6 py-4 max-w-[200px] truncate">{msg.subject}</td>
                              <td className="px-6 py-4">{msg.date}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                  msg.replied ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                }`}>
                                  {msg.replied ? "Replied" : "Unread"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => setViewingMessage(msg)}
                                    className="px-3 py-1.5 bg-[#F0EDFF] text-[#6C4CF1] hover:bg-[#6C4CF1]/10 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer"
                                  >
                                    View & Reply
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
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
                </div>
              )}

              {/* =========================================================
                  TAB: REPORTS
                  ========================================================= */}
              {activeTab === "reports" && (
                <div className="space-y-6">
                  {/* Reports table */}
                  <div className="bg-white border border-[#ECECEC] rounded-[28px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto text-left">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-poppins">
                            <th className="px-6 py-4">Flagged Listing</th>
                            <th className="px-6 py-4">Owner</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235] font-poppins">
                          {reports.map((rep) => (
                            <tr key={rep.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-[#1E2235]">{rep.listingTitle}</div>
                                {rep.message && (
                                  <div className="text-[10px] text-slate-400 font-medium mt-1 bg-slate-50/50 p-1.5 px-2.5 rounded-lg border border-slate-100/80 max-w-xs break-words font-poppins">
                                    "{rep.message}"
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 font-bold">{rep.ownerName}</td>
                              <td className="px-6 py-4">
                                <span className="bg-red-50 text-red-600 text-[9px] font-black px-2.5 py-1 rounded-md border border-red-200/50 uppercase tracking-wide leading-none">
                                  {rep.reason}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-bold">{rep.date}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => resolveReport(rep.id, "delete", rep.listingId)}
                                    className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                                  >
                                    Delete Listing
                                  </button>
                                  <button
                                    onClick={() => resolveReport(rep.id, "blacklist", undefined, rep.ownerName)}
                                    className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                                  >
                                    Blacklist Owner
                                  </button>
                                  <button
                                    onClick={() => resolveReport(rep.id, "ignore")}
                                    className="px-3 py-1.5 border border-[#ECECEC] text-slate-500 hover:bg-slate-50 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                                  >
                                    Ignore
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB: BOOST REQUESTS
                  ========================================================= */}
              {activeTab === "boosts" && (
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-poppins text-slate-800">
                        Boost Verification Requests 🚀
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Verify host payment screenshots to manually activate listing promotions
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-600 font-bold text-xs uppercase tracking-wide px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                      {adminBoostRequests.filter((r: any) => r.status === "Pending").length} Pending Verification
                    </span>
                  </div>

                  <div className="bg-white border border-[#ECECEC] rounded-3xl overflow-hidden shadow-sm">
                    {adminBoostRequests.length === 0 ? (
                      <div className="text-center py-16 space-y-3">
                        <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm text-slate-500 font-bold">No boost requests submitted yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto overflow-y-auto max-h-[550px] pb-32">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="bg-slate-50 border-b border-[#ECECEC]">
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Details</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan & Cost</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Screenshot</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F2F5]">
                            {adminBoostRequests.map((req) => (
                              <tr key={req._id || req.id} className="hover:bg-slate-50/40 transition-colors">
                                
                                {/* Property */}
                                <td className="px-6 py-4.5">
                                  <div className="flex items-center space-x-3.5">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                      <img 
                                        src={req.listing?.image || "/assets/room1.png"} 
                                        alt="listing" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block text-sm font-bold text-slate-800 truncate max-w-[200px]">
                                        {req.listing?.title || "Deleted Property"}
                                      </span>
                                      <span className="text-[11px] text-slate-400 font-bold block capitalize">
                                        {req.listing?.type || "N/A"} &bull; ₹{req.listing?.rent?.toLocaleString("en-IN") || 0}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Owner */}
                                <td className="px-6 py-4.5">
                                  <div className="space-y-0.5">
                                    <span className="block text-sm font-bold text-slate-800">
                                      {req.owner?.fullName || req.listing?.ownerName || "Unknown Owner"}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-bold block">
                                      Phone: {req.owner?.mobile || req.listing?.ownerPhone || "N/A"}
                                    </span>
                                  </div>
                                </td>

                                {/* Plan & Cost */}
                                <td className="px-6 py-4.5">
                                  <div className="space-y-0.5">
                                    <span className="inline-flex text-[10px] font-black uppercase bg-[#F0EDFF] text-[#6C4CF1] px-2 py-0.5 rounded">
                                      {req.plan}
                                    </span>
                                    <span className="block text-xs font-black text-slate-700 pt-1">
                                      ₹{req.amount}
                                    </span>
                                  </div>
                                </td>

                                {/* Screenshot */}
                                <td className="px-6 py-4.5">
                                  {req.screenshot ? (
                                    <a 
                                      href={getImageUrl(req.screenshot)} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#6C4CF1] hover:underline"
                                    >
                                      <Eye className="w-4 h-4 shrink-0" />
                                      <span>View Receipt</span>
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-semibold">No Image</span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4.5">
                                  <span className={`inline-flex text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                    req.status === "Approved" 
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                                      : req.status === "Rejected"
                                      ? "bg-red-50 text-red-600 border border-red-200"
                                      : "bg-amber-50 text-amber-600 border border-amber-200"
                                  }`}>
                                    {req.status}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4.5 text-right whitespace-nowrap">
                                  {req.status === "Pending" ? (
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => handleVerifyBoost(req._id || req.id, "Rejected")}
                                        className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                                      >
                                        Decline
                                      </button>
                                      <button
                                        onClick={() => handleVerifyBoost(req._id || req.id, "Approved")}
                                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-colors"
                                      >
                                        Approve Boost
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end items-center space-x-3">
                                      {req.status === "Approved" ? (
                                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                                          Active
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 uppercase">
                                          Stopped
                                        </span>
                                      )}
                                      
                                      <div className="relative inline-block text-left">
                                        <button
                                          onClick={() => {
                                            const reqId = req._id || req.id;
                                            setActiveBoostDropdownId(activeBoostDropdownId === reqId ? null : reqId);
                                          }}
                                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                        
                                        {activeBoostDropdownId === (req._id || req.id) && (
                                          <>
                                            {/* Backdrop to close dropdown */}
                                            <div 
                                              className="fixed inset-0 z-10" 
                                              onClick={() => setActiveBoostDropdownId(null)}
                                            />
                                            <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white border border-[#ECECEC] shadow-lg z-20 py-1 text-left">
                                              {req.status === "Approved" ? (
                                                <button
                                                  onClick={() => {
                                                    setActiveBoostDropdownId(null);
                                                    if (confirm("Are you sure you want to stop/revoke this active boost?")) {
                                                      handleVerifyBoost(req._id || req.id, "Rejected");
                                                    }
                                                  }}
                                                  className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2 cursor-pointer text-left"
                                                >
                                                  <span>Stop Boost</span>
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={() => {
                                                    setActiveBoostDropdownId(null);
                                                    handleVerifyBoost(req._id || req.id, "Approved");
                                                  }}
                                                  className="w-full px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center space-x-2 cursor-pointer text-left"
                                                >
                                                  <span>Activate Boost</span>
                                                </button>
                                              )}
                                              <button
                                                onClick={() => {
                                                  setActiveBoostDropdownId(null);
                                                  if (confirm("Are you sure you want to delete this boost request permanently?")) {
                                                    handleDeleteBoost(req._id || req.id);
                                                  }
                                                }}
                                                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2 border-t border-slate-100 cursor-pointer text-left"
                                              >
                                                <span>Delete Request</span>
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </td>

                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB: SETTINGS
                  ========================================================= */}
              {activeTab === "settings" && (
                <div className="bg-white border border-[#ECECEC] rounded-[28px] p-6 sm:p-10 shadow-sm text-left max-w-2xl">
                  <form onSubmit={handleSettingsSubmit} className="space-y-6">
                    <h3 className="font-poppins font-bold text-base text-[#1E2235] pb-2 border-b border-[#F0F2F5]">
                      General Configuration
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Website Name
                        </label>
                        <input
                          type="text"
                          required
                          value={siteSettings.siteName}
                          onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Support Email
                        </label>
                        <input
                          type="email"
                          required
                          value={siteSettings.supportEmail}
                          onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Support Phone
                        </label>
                        <input
                          type="text"
                          required
                          value={siteSettings.supportPhone}
                          onChange={(e) => setSiteSettings({ ...siteSettings, supportPhone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Upload Logo (UI Mock)
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#ECECEC] flex items-center justify-center text-[#94A3B8] font-bold text-xs">
                            Logo
                          </div>
                          <button
                            type="button"
                            onClick={() => alert("Logo upload is simulated. In a live database environment, this will store image assets.")}
                            className="px-3 py-2 border border-[#ECECEC] rounded-xl text-xs font-bold hover:bg-slate-50"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-poppins font-bold text-base text-[#1E2235] pt-4 pb-2 border-b border-[#F0F2F5]">
                      Social Links
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Facebook URL
                        </label>
                        <input
                          type="text"
                          value={siteSettings.facebook}
                          onChange={(e) => setSiteSettings({ ...siteSettings, facebook: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Instagram URL
                        </label>
                        <input
                          type="text"
                          value={siteSettings.instagram}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          LinkedIn URL
                        </label>
                        <input
                          type="text"
                          value={siteSettings.linkedin}
                          onChange={(e) => setSiteSettings({ ...siteSettings, linkedin: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Twitter URL
                        </label>
                        <input
                          type="text"
                          value={siteSettings.twitter}
                          onChange={(e) => setSiteSettings({ ...siteSettings, twitter: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#6C4CF1]/10 cursor-pointer w-full sm:w-auto"
                    >
                      Save Configuration
                    </button>
                  </form>

                </div>
              )}

              {/* =========================================================
                  TAB: PROFILE
                  ========================================================= */}
              {activeTab === "profile" && (
                <div className="bg-white border border-[#ECECEC] rounded-[28px] p-6 sm:p-10 shadow-sm text-left max-w-xl">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <h3 className="font-poppins font-bold text-base text-[#1E2235] pb-2 border-b border-[#F0F2F5]">
                      My Profile
                    </h3>

                    {isProfileUpdated && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Profile updated successfully!</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 pb-2">
                      <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden relative border border-[#ECECEC]">
                        <Image
                          src={adminProfile.avatar}
                          alt={adminProfile.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Avatar generation is simulated. Profile utilizes seed generator tags.")}
                        className="px-3.5 py-2 border border-[#ECECEC] rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                      >
                        Change Avatar
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={profilePassword}
                          onChange={(e) => setProfilePassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-[#1E2235]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#6C4CF1]/10 cursor-pointer w-full sm:w-auto"
                    >
                      Update Profile Info
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "diagnostics" && (
                <div className="bg-white border border-[#ECECEC] rounded-[28px] p-6 sm:p-10 shadow-sm text-left space-y-6">
                  <h3 className="font-poppins font-bold text-base text-[#1E2235] pb-2 border-b border-[#F0F2F5]">
                    Local Storage Diagnostics
                  </h3>
                  <div className="space-y-4">
                    <p className="text-xs text-[#94A3B8] font-bold">
                      Below is the raw list of custom properties currently saved in your browser's local storage database:
                    </p>
                    <pre className="bg-slate-50 border border-[#ECECEC] rounded-2xl p-4 text-[10.5px] font-mono text-slate-700 overflow-x-auto max-h-[400px]">
                      {JSON.stringify(properties.filter(p => p.id.startsWith("prop_") || p.id.startsWith("lst_")), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* -------------------------------------------------------------
          MODALS & DIALOG POPUPS
          ------------------------------------------------------------- */}

      {/* A. Property Add/Edit Modal */}
      <AnimatePresence>
        {isPropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPropModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative z-10 text-left max-h-[85vh] overflow-y-auto space-y-5 no-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="font-poppins font-black text-base text-[#1E2235]">
                  {editingProperty ? "Edit Property Listing" : "Add New Property"}
                </h3>
                <button onClick={() => setIsPropModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handlePropSubmit} className="space-y-4">
                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Title */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Property Name / Title</label>
                    <input
                      type="text"
                      required
                      value={propForm.title || ""}
                      onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                      placeholder="e.g. Elegant 1BHK Student Flat"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* Rent */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      required
                      value={propForm.rent || 5000}
                      onChange={(e) => setPropForm({ ...propForm, rent: parseInt(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Category Type</label>
                    <select
                      value={propForm.type || "room"}
                      onChange={(e) => setPropForm({ ...propForm, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-bold"
                    >
                      <option value="room">Room</option>
                      <option value="pg">PG</option>
                      <option value="hostel">Hostel</option>
                      <option value="flat">Flat</option>
                    </select>
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">City</label>
                    <select
                      value={propForm.city || "Greater Noida"}
                      onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-bold"
                    >
                      <option value="Greater Noida">Greater Noida</option>
                      <option value="Noida">Noida</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gurugram">Gurugram</option>
                    </select>
                  </div>

                  {/* Area */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Area / Sector</label>
                    <input
                      type="text"
                      required
                      value={propForm.area || ""}
                      onChange={(e) => setPropForm({ ...propForm, area: e.target.value })}
                      placeholder="e.g. Knowledge Park 3"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* Furnishing */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Furnishing Status</label>
                    <select
                      value={propForm.furnishing || "Fully Furnished"}
                      onChange={(e) => setPropForm({ ...propForm, furnishing: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-bold"
                    >
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Semi Furnished">Semi Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  {/* Sharing */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Sharing/Room Option</label>
                    <input
                      type="text"
                      value={propForm.sharing || ""}
                      onChange={(e) => setPropForm({ ...propForm, sharing: e.target.value })}
                      placeholder="e.g. Single Room or Double Sharing"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* Tag */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Preferred Tenant Tag</label>
                    <select
                      value={propForm.tag || "Boys Only"}
                      onChange={(e) => setPropForm({ ...propForm, tag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-bold"
                    >
                      <option value="Boys Only">Boys Only</option>
                      <option value="Girls Only">Girls Only</option>
                      <option value="Family / Couple">Family / Couple</option>
                    </select>
                  </div>

                  {/* Image URL & Upload */}
                  <div className="space-y-2 sm:col-span-2 border border-[#ECECEC] rounded-2xl p-4 bg-slate-50/50">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider block mb-1">
                      Property Image (Upload or Select Preset)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      {/* Image Preview */}
                      <div className="aspect-[16/10] w-full rounded-xl relative overflow-hidden bg-slate-100 border border-[#ECECEC] flex items-center justify-center">
                        {propForm.image ? (
                          <img
                            src={propForm.image ? getImageUrl(propForm.image) : "/assets/room1.png"}
                            alt="Property Preview"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs">No image selected</span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="md:col-span-2 space-y-3">
                        {/* File Upload Button */}
                        <div>
                          <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 w-full md:w-auto">
                            <span>{isUploading ? "Uploading..." : "Upload from Folder"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file);
                                  if (url) {
                                    setPropForm({ ...propForm, image: url });
                                  }
                                }
                              }}
                              disabled={isUploading}
                            />
                          </label>
                          <span className="text-[10px] text-slate-400 block mt-1">Upload JPG, PNG, WEBP (Max 5MB)</span>
                        </div>

                        {/* Select Presets */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold block">Or choose a preset image:</span>
                          <select
                            value={propForm.image && (propForm.image.startsWith("/assets") || propForm.image.startsWith("/uploads")) ? propForm.image : ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                setPropForm({ ...propForm, image: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold bg-white"
                          >
                            <option value="">-- Choose Preset --</option>
                            <option value="/assets/room1.png">Preset 1 (Luxury Room)</option>
                            <option value="/assets/room2.png">Preset 2 (1BHK Flat)</option>
                            <option value="/assets/pg1.png">Preset 3 (PG Shared)</option>
                            <option value="/assets/hostel1.png">Preset 4 (Student Hostel)</option>
                          </select>
                        </div>

                        {/* Custom Image URL text field */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold block">Or enter custom image URL:</span>
                          <input
                            type="text"
                            value={propForm.image || ""}
                            onChange={(e) => setPropForm({ ...propForm, image: e.target.value })}
                            placeholder="/assets/room1.png or http://..."
                            className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Owner / Landlord Name</label>
                    <input
                      type="text"
                      required
                      value={propForm.ownerName || ""}
                      onChange={(e) => setPropForm({ ...propForm, ownerName: e.target.value })}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* Owner Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Owner Contact Mobile</label>
                    <input
                      type="text"
                      required
                      value={propForm.ownerPhone || ""}
                      onChange={(e) => setPropForm({ ...propForm, ownerPhone: e.target.value })}
                      placeholder="e.g. +91 99999 88888"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* WhatsApp Link */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Pre-filled WhatsApp URL</label>
                    <input
                      type="text"
                      required
                      value={propForm.ownerWhatsApp || ""}
                      onChange={(e) => setPropForm({ ...propForm, ownerWhatsApp: e.target.value })}
                      placeholder="https://wa.me/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-slate-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Property Description</label>
                    <textarea
                      required
                      rows={3}
                      value={propForm.description || ""}
                      onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                      placeholder="Describe the rooms, location facilities, surroundings..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold resize-none"
                    />
                  </div>

                </div>

                <div className="flex gap-3 pt-3 border-t border-[#F0F2F5]">
                  <button
                    type="submit"
                    className="flex-1 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {editingProperty ? "Save Changes" : "Submit Property"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPropModalOpen(false)}
                    className="px-6 py-3 border border-[#ECECEC] text-[#64748B] font-bold rounded-2xl text-xs uppercase hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. Replace Promotion Modal */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPromoModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[32px] max-w-lg w-full p-6 shadow-2xl relative z-10 text-left max-h-[80vh] overflow-y-auto flex flex-col space-y-4 no-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5] shrink-0">
                <h3 className="font-poppins font-black text-base text-[#1E2235]">
                  Select Listing for Promotion Slot
                </h3>
                <button onClick={() => setIsPromoModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoSearchQuery}
                  onChange={(e) => setPromoSearchQuery(e.target.value)}
                  placeholder="Search listings by title..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                />
              </div>

              {/* List */}
              <div className="divide-y divide-[#F0F2F5] overflow-y-auto max-h-[40vh] pr-1">
                {filteredPromosSelectionList.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-9 rounded-lg relative overflow-hidden bg-slate-50 border border-[#ECECEC] shrink-0">
                        <Image
                          src={p.image ? getImageUrl(p.image) : "/assets/room1.png"}
                          alt={p.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#1E2235] block truncate">{p.title}</span>
                        <span className="text-[10px] text-[#94A3B8] font-bold block truncate">
                          {p.ownerName} &bull; ₹{p.rent.toLocaleString("en-IN")}/mo
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => selectedPromoSlot && handleReplacePromo(selectedPromoSlot, p.id)}
                      className="px-3 py-1.5 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-[10.5px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      Promote
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. Add/Edit Advertisement Modal */}
      <AnimatePresence>
        {isAdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[32px] max-w-md w-full p-6 shadow-2xl relative z-10 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="font-poppins font-black text-base text-[#1E2235]">
                  {editingAd ? "Edit Advertisement" : "Add Advertisement"}
                </h3>
                <button onClick={() => setIsAdModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAdSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    value={adForm.companyName || ""}
                    onChange={(e) => setAdForm({ ...adForm, companyName: e.target.value })}
                    placeholder="e.g. Google Cloud"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Target Website URL</label>
                  <input
                    type="text"
                    required
                    value={adForm.website || ""}
                    onChange={(e) => setAdForm({ ...adForm, website: e.target.value })}
                    placeholder="https://google.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      required
                      value={adForm.startDate || ""}
                      onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      required
                      value={adForm.endDate || ""}
                      onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Ad Image & Upload */}
                <div className="space-y-2 border border-[#ECECEC] rounded-2xl p-4 bg-slate-50/50">
                  <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider block mb-1">
                    Advertisement Image Banner (Upload or Select Preset)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Image Preview */}
                    <div className="aspect-[16/10] w-full rounded-xl relative overflow-hidden bg-slate-100 border border-[#ECECEC] flex items-center justify-center">
                      {adForm.image ? (
                        <img
                          src={getImageUrl(adForm.image || '/assets/room1.png')}
                          alt="Advertisement Preview"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">No image</span>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="md:col-span-2 space-y-3">
                      {/* File Upload Button */}
                      <div>
                        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 w-full md:w-auto">
                          <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) {
                                  setAdForm({ ...adForm, image: url });
                                }
                              }
                            }}
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {/* Select Presets */}
                      <div className="space-y-1">
                        <select
                          value={adForm.image && (adForm.image.startsWith("/assets") || adForm.image.startsWith("/uploads")) ? adForm.image : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              setAdForm({ ...adForm, image: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold bg-white"
                        >
                          <option value="">-- Choose Preset --</option>
                          <option value="/assets/room1.png">Image 1</option>
                          <option value="/assets/room2.png">Image 2</option>
                          <option value="/assets/pg1.png">Image 3</option>
                          <option value="/assets/hostel1.png">Image 4</option>
                        </select>
                      </div>

                      {/* Custom Image URL text field */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={adForm.image || ""}
                          onChange={(e) => setAdForm({ ...adForm, image: e.target.value })}
                          placeholder="/assets/room1.png or http://..."
                          className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#F0F2F5]">
                  <button
                    type="submit"
                    className="flex-1 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {editingAd ? "Save Changes" : "Create Ad"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdModalOpen(false)}
                    className="px-5 py-3 border border-[#ECECEC] text-[#64748B] font-bold rounded-2xl text-xs uppercase hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promotion Card Add/Edit Modal */}
      <AnimatePresence>
        {isPromoCardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPromoCardModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[32px] max-w-lg w-full p-6 shadow-2xl relative z-10 text-left space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="font-poppins font-black text-base text-[#1E2235]">
                  {editingPromoCard ? "Edit Promotion Card" : "Add Promotion Card"}
                </h3>
                <button onClick={() => setIsPromoCardModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handlePromoCardSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Title / Heading</label>
                    <input
                      type="text"
                      required
                      value={promoCardForm.title || ""}
                      onChange={(e) => setPromoCardForm({ ...promoCardForm, title: e.target.value })}
                      placeholder="e.g. Find Verified Hostels"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Badge Tag</label>
                    <input
                      type="text"
                      value={promoCardForm.badge || ""}
                      onChange={(e) => setPromoCardForm({ ...promoCardForm, badge: e.target.value })}
                      placeholder="e.g. NEW, FEATURED"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Subtitle / Description</label>
                  <textarea
                    required
                    rows={2}
                    value={promoCardForm.subtitle || ""}
                    onChange={(e) => setPromoCardForm({ ...promoCardForm, subtitle: e.target.value })}
                    placeholder="Brief details about this promo..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Button Text</label>
                    <input
                      type="text"
                      required
                      value={promoCardForm.buttonText || ""}
                      onChange={(e) => setPromoCardForm({ ...promoCardForm, buttonText: e.target.value })}
                      placeholder="e.g. Explore Now"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Button Link (URL)</label>
                    <input
                      type="text"
                      required
                      value={promoCardForm.buttonLink || ""}
                      onChange={(e) => setPromoCardForm({ ...promoCardForm, buttonLink: e.target.value })}
                      placeholder="e.g. /hostels or /pg"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Gradient Color From</label>
                    <input
                      type="color"
                      value={promoCardForm.gradientFrom || "#6C4CF1"}
                      onChange={(e) => setPromoCardForm({ ...promoCardForm, gradientFrom: e.target.value })}
                      className="w-full h-10 p-1 rounded-xl border border-[#ECECEC] outline-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Gradient Color To</label>
                    <input
                      type="color"
                      value={promoCardForm.gradientTo || "#8E75FF"}
                      onChange={(e) => setPromoCardForm({ ...promoCardForm, gradientTo: e.target.value })}
                      className="w-full h-10 p-1 rounded-xl border border-[#ECECEC] outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Promo Image & Upload */}
                <div className="space-y-2 border border-[#ECECEC] rounded-2xl p-4 bg-slate-50/50">
                  <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider block mb-1">
                    Promo Background Image (Upload or Select Preset)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Image Preview */}
                    <div className="aspect-[16/10] w-full rounded-xl relative overflow-hidden bg-slate-100 border border-[#ECECEC] flex items-center justify-center">
                      {promoCardForm.image ? (
                        <img
                          src={promoCardForm.image ? getImageUrl(promoCardForm.image) : "/assets/room1.png"}
                          alt="Promo Preview"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">No image</span>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="md:col-span-2 space-y-3">
                      {/* File Upload Button */}
                      <div>
                        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 w-full md:w-auto">
                          <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) {
                                  setPromoCardForm({ ...promoCardForm, image: url });
                                }
                              }
                            }}
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {/* Select Presets */}
                      <div className="space-y-1">
                        <select
                          value={promoCardForm.image && (promoCardForm.image.startsWith("/assets") || promoCardForm.image.startsWith("/uploads")) ? promoCardForm.image : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              setPromoCardForm({ ...promoCardForm, image: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold bg-white"
                        >
                          <option value="">-- Choose Preset --</option>
                          <option value="/assets/room1.png">Image 1</option>
                          <option value="/assets/room2.png">Image 2</option>
                          <option value="/assets/pg1.png">Image 3</option>
                          <option value="/assets/hostel1.png">Image 4</option>
                        </select>
                      </div>

                      {/* Custom Image URL text field */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={promoCardForm.image || ""}
                          onChange={(e) => setPromoCardForm({ ...promoCardForm, image: e.target.value })}
                          placeholder="/assets/room1.png or http://..."
                          className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#F0F2F5]">
                  <button
                    type="submit"
                    className="flex-1 bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {editingPromoCard ? "Save Changes" : "Create Promotion"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPromoCardModalOpen(false)}
                    className="px-5 py-3 border border-[#ECECEC] text-[#64748B] font-bold rounded-2xl text-xs uppercase hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. View Contact Message Modal */}
      <AnimatePresence>
        {viewingMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingMessage(null)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[32px] max-w-md w-full p-6 shadow-2xl relative z-10 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="font-poppins font-black text-sm text-[#1E2235] truncate max-w-[280px]">
                  Subject: {viewingMessage.subject}
                </h3>
                <button onClick={() => setViewingMessage(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {replySuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[#1E2235]">Reply Sent Successfully!</h4>
                  <p className="text-[11px] text-[#94A3B8] font-bold">The reply template was delivered to user inbox.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sender details */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">From Sender</span>
                    <p className="text-xs font-bold text-[#1E2235]">
                      {viewingMessage.name} &bull; <span className="font-medium text-[#64748B]">{viewingMessage.email}</span>
                    </p>
                    <p className="text-[11px] text-[#64748B] font-bold">Tel: {viewingMessage.phone}</p>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-[#ECECEC] rounded-2xl">
                    <span className="text-[9px] text-[#94A3B8] font-black uppercase tracking-wider block">Message Content</span>
                    <p className="text-xs text-[#1E2235] leading-relaxed font-medium">
                      {viewingMessage.message}
                    </p>
                  </div>

                  <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#1E2235] uppercase tracking-wider">Reply Message</label>
                      <textarea
                        required
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type reply message to send..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] focus:ring-2 focus:ring-[#6C4CF1]/10 focus:border-[#6C4CF1] outline-none text-xs font-semibold resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#6C4CF1]/10"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Response</span>
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
