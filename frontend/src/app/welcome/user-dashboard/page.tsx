"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Heart, 
  AlertTriangle, 
  Trash2, 
  LogOut, 
  Compass, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowRight,
  ExternalLink,
  Eye,
  Search,
  CalendarDays,
  Clock,
  MessageCircle,
  Calendar
} from "lucide-react";
import { getApiUrl, getImageUrl } from "@/data/api";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function UserDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"wishlist" | "explore" | "bookings" | "reports">("wishlist");

  // Persisted user bookings (Loaded from localStorage / API)
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // User Profile details from localStorage
  const [name, setName] = useState("Tenant");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("🦊");

  const cuteAvatars = ["🦁", "🐼", "🦊", "🐨", "🐱", "🐻", "🐯", "🐶", "🐰"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("user_logged_in") !== "true") {
        router.push("/welcome");
        return;
      }
      setName(localStorage.getItem("user_name") || "Tenant");
      setEmail(localStorage.getItem("user_email") || "tenant@checkrooms.com");
      setPhone(localStorage.getItem("user_phone") || "");
      setAvatar(localStorage.getItem("user_avatar") || "🦊");
      
      try {
        const storedBookings = localStorage.getItem("checkrooms_user_bookings");
        if (storedBookings) {
          const parsed = JSON.parse(storedBookings);
          if (Array.isArray(parsed)) setMyBookings(parsed);
        }
      } catch (err) {
        console.error("Error parsing user bookings:", err);
      }

      let saved = [];
      try {
        saved = JSON.parse(localStorage.getItem("saved_listings") || "[]");
        if (!Array.isArray(saved)) saved = [];
        const cleaned = saved.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
        if (cleaned.length !== saved.length) {
          localStorage.setItem("saved_listings", JSON.stringify(cleaned));
          saved = cleaned;
        }
      } catch (err) {
        console.error("Error parsing saved listings:", err);
      }
      setSavedListingIds(saved);
      
      let repList = [];
      try {
        repList = JSON.parse(localStorage.getItem("checkrooms_reports") || "[]");
        if (!Array.isArray(repList)) repList = [];
      } catch (err) {
        console.error("Error parsing reports:", err);
      }
      setReports(repList);
    }
  }, [router]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(getApiUrl("/api/listings"));
        if (res.ok) {
          const data = await res.json();
          setProperties(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      }
    };
    fetchListings();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_logged_in");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_phone");
      localStorage.removeItem("user_avatar");
      
      // Dispatch storage event to alert navbar
      window.dispatchEvent(new Event("storage"));
    }
    alert("Logged out successfully!");
    router.push("/");
  };

  const handleRemoveWishlist = (id: string) => {
    const updated = savedListingIds.filter(item => item !== id);
    setSavedListingIds(updated);
    localStorage.setItem("saved_listings", JSON.stringify(updated));
    // Dispatch event to navbar
    window.dispatchEvent(new Event("savedListingsUpdated"));
  };

  const changeAvatar = (emoji: string) => {
    setAvatar(emoji);
    localStorage.setItem("user_avatar", emoji);
    // Dispatch event to navbar to live reload avatar
    window.dispatchEvent(new Event("storage"));
  };

  const wishlistProperties = properties.filter((p) => savedListingIds.includes(p.id || p._id));

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 font-manrope">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 w-full space-y-8">
          
          {/* ========================================================================= */}
          {/* USER CARD CONTAINER */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#E8E8F0] rounded-[28px] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 text-center sm:text-left">
              {/* Avatar Selector and display */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F3EEFF] flex items-center justify-center text-5xl sm:text-6xl border-4 border-white shadow-md select-none">
                  {avatar}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#151538] tracking-tight">{name}</h2>
                  <span className="bg-[#EFE7FF] text-[#5B2BE0] border border-[#E9DCFF] text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                    Tenant Account
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 text-xs text-[#666680] font-semibold">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#8C8CA1] shrink-0" />
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#8C8CA1] shrink-0" />
                    <span>{phone}</span>
                  </div>
                </div>

                {/* Avatar changer list */}
                <div className="pt-2">
                  <p className="text-[9px] font-black text-[#8C8CA1] uppercase tracking-wider mb-2">
                    Choose Avatar:
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {cuteAvatars.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => changeAvatar(emoji)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-slate-100 active:scale-90 transition-all cursor-pointer border ${
                          avatar === emoji ? "border-[#5B2BE0] bg-[#F3EEFF] scale-105" : "border-[#E8E8F0] bg-white"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-red-50 border border-[#E8E8F0] hover:border-red-200 text-slate-600 hover:text-red-500 font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-xs md:self-start"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TABS SELECTOR */}
          {/* ========================================================================= */}
          <div className="flex space-x-2 border-b border-[#E8E8F0] pb-0.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "wishlist"
                  ? "border-[#5B2BE0] text-[#5B2BE0]"
                  : "border-transparent text-[#8C8CA1] hover:text-[#151538]"
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>My Wishlist ({wishlistProperties.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "bookings"
                  ? "border-[#5B2BE0] text-[#5B2BE0]"
                  : "border-transparent text-[#8C8CA1] hover:text-[#151538]"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>My Bookings & Visits ({myBookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "explore"
                  ? "border-[#5B2BE0] text-[#5B2BE0]"
                  : "border-transparent text-[#8C8CA1] hover:text-[#151538]"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Rooms ({properties.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === "reports"
                  ? "border-[#5B2BE0] text-[#5B2BE0]"
                  : "border-transparent text-[#8C8CA1] hover:text-[#151538]"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>My Reports ({reports.length})</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: WISHLIST PROPERTIES GRID */}
          {/* ========================================================================= */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              {wishlistProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {wishlistProperties.map((p) => {
                    const detailUrl = `/${(p.type || "").toLowerCase() === "room" ? "rooms" : (p.type || "").toLowerCase() === "hostel" ? "hostels" : (p.type || "").toLowerCase() === "flat" ? "flats" : "pg"}/${p.id || p._id}`;
                    return (
                      <div 
                        key={p.id || p._id} 
                        className="bg-white border border-[#E8E8F0] hover:border-[#5B2BE0]/50 rounded-[20px] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image Container with Badges */}
                          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                            <img 
                              src={getImageUrl(p.image) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"} 
                              alt={p.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              <span className="bg-[#5B2BE0]/90 backdrop-blur-md text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                {p.type || "Room"}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveWishlist(p.id || p._id);
                                }}
                                className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md text-red-500 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer"
                                title="Remove from Saved"
                              >
                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                              </button>
                            </div>

                            {/* Bottom info on image */}
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                              <span className="text-[11px] font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                                {p.sharing || p.roomType || "Single / Private"}
                              </span>
                              <span className="text-[10px] font-bold text-white/90">
                                {p.area ? `${p.area}` : p.city || "Noida"}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 space-y-3 text-left">
                            <div>
                              <h3 className="font-manrope font-bold text-base text-[#151538] group-hover:text-[#5B2BE0] transition-colors line-clamp-1">
                                {p.title}
                              </h3>
                              <p className="text-xs text-[#666680] font-medium flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-[#8C8CA1] shrink-0" />
                                <span className="truncate">{p.location || (p.area ? `${p.area}, ${p.city}` : p.city)}</span>
                              </p>
                            </div>

                            {/* Facilities Pills */}
                            {p.facilities && p.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {p.facilities.slice(0, 3).map((fac: string, idx: number) => (
                                  <span key={idx} className="bg-[#F5F2FC] text-[#5B2BE0] text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    {fac}
                                  </span>
                                ))}
                                {p.facilities.length > 3 && (
                                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    +{p.facilities.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Price Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F5]">
                              <div>
                                <span className="text-[10px] font-bold text-[#8C8CA1] uppercase tracking-wider block">Monthly Rent</span>
                                <span className="font-manrope font-black text-xl text-[#151538]">
                                  ₹{Number(p.rent).toLocaleString("en-IN")}
                                  <span className="text-xs font-semibold text-[#8C8CA1]">/mo</span>
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#666680] bg-[#F8F9FB] border border-[#E8E8F0] px-2.5 py-1 rounded-lg">
                                {p.sharing || "Single"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer: View Details CTA */}
                        <div className="p-3 bg-[#FAF8FE] border-t border-[#E8E8F0]">
                          <Link
                            href={detailUrl}
                            className="w-full bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs font-manrope font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-[#5B2BE0]/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E8F0] rounded-[28px] p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-[#F3EEFF] text-[#5B2BE0] flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-manrope font-bold text-base text-[#151538]">Your Wishlist is Empty</h3>
                    <p className="text-xs text-[#666680] font-medium leading-relaxed">
                      You haven't saved any listings yet. Browse through our premium verified listings to find your ideal room!
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("explore")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5B2BE0]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Listings</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: EXPLORE ALL ROOMS GRID */}
          {/* ========================================================================= */}
          {activeTab === "explore" && (
            <div className="space-y-6">
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {properties.map((p) => {
                    const isSaved = savedListingIds.includes(p.id || p._id);
                    const detailUrl = `/${(p.type || "").toLowerCase() === "room" ? "rooms" : (p.type || "").toLowerCase() === "hostel" ? "hostels" : (p.type || "").toLowerCase() === "flat" ? "flats" : "pg"}/${p.id || p._id}`;
                    return (
                      <div 
                        key={p.id || p._id} 
                        className="bg-white border border-[#E8E8F0] hover:border-[#5B2BE0]/50 rounded-[20px] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image Container with Badges */}
                          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                            <img 
                              src={getImageUrl(p.image) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"} 
                              alt={p.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              <span className="bg-[#5B2BE0]/90 backdrop-blur-md text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                {p.type || "Room"}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const id = p.id || p._id;
                                  let updated = [...savedListingIds];
                                  if (updated.includes(id)) {
                                    updated = updated.filter(item => item !== id);
                                  } else {
                                    updated.push(id);
                                  }
                                  setSavedListingIds(updated);
                                  localStorage.setItem("saved_listings", JSON.stringify(updated));
                                  window.dispatchEvent(new Event("savedListingsUpdated"));
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                                  isSaved 
                                    ? "bg-white text-red-500" 
                                    : "bg-white/80 text-slate-600 hover:bg-white hover:text-red-500"
                                }`}
                                title={isSaved ? "Remove from Saved" : "Save to Wishlist"}
                              >
                                <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                              </button>
                            </div>

                            {/* Bottom info on image */}
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                              <span className="text-[11px] font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                                {p.sharing || p.roomType || "Single / Private"}
                              </span>
                              <span className="text-[10px] font-bold text-white/90">
                                {p.area ? `${p.area}` : p.city || "Noida"}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 space-y-3 text-left">
                            <div>
                              <h3 className="font-manrope font-bold text-base text-[#151538] group-hover:text-[#5B2BE0] transition-colors line-clamp-1">
                                {p.title}
                              </h3>
                              <p className="text-xs text-[#666680] font-medium flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-[#8C8CA1] shrink-0" />
                                <span className="truncate">{p.location || (p.area ? `${p.area}, ${p.city}` : p.city)}</span>
                              </p>
                            </div>

                            {/* Facilities Pills */}
                            {p.facilities && p.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {p.facilities.slice(0, 3).map((fac: string, idx: number) => (
                                  <span key={idx} className="bg-[#F5F2FC] text-[#5B2BE0] text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    {fac}
                                  </span>
                                ))}
                                {p.facilities.length > 3 && (
                                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    +{p.facilities.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Price Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F5]">
                              <div>
                                <span className="text-[10px] font-bold text-[#8C8CA1] uppercase tracking-wider block">Monthly Rent</span>
                                <span className="font-manrope font-black text-xl text-[#151538]">
                                  ₹{Number(p.rent).toLocaleString("en-IN")}
                                  <span className="text-xs font-semibold text-[#8C8CA1]">/mo</span>
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#666680] bg-[#F8F9FB] border border-[#E8E8F0] px-2.5 py-1 rounded-lg">
                                {p.sharing || "Single"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer: View Details CTA */}
                        <div className="p-3 bg-[#FAF8FE] border-t border-[#E8E8F0]">
                          <Link
                            href={detailUrl}
                            className="w-full bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs font-manrope font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-[#5B2BE0]/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E8F0] rounded-[28px] p-12 text-center max-w-md mx-auto space-y-3">
                  <p className="text-xs text-[#666680] font-medium">Loading properties...</p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MY BOOKINGS & VISITS */}
          {/* ========================================================================= */}
          {activeTab === "bookings" && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E8E8F0] rounded-[22px] p-5 sm:p-6 shadow-xs">
                <div>
                  <h3 className="font-manrope font-black text-xl text-[#151538]">
                    My Room Bookings & Scheduled Visits
                  </h3>
                  <p className="text-xs text-[#666680] mt-0.5">
                    Track the status of your room visits, verified host contacts, and move-in tokens.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="bg-[#5B2BE0] hover:bg-[#4A20C0] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-[#5B2BE0]/20 cursor-pointer self-start sm:self-auto"
                >
                  Explore More Rooms →
                </button>
              </div>

              {myBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {myBookings.map((b) => {
                    const isPending = b.status === "pending";
                    const isConfirmed = b.status === "confirmed";

                    return (
                      <div
                        key={b.id}
                        className="bg-white border border-[#E8E8F0] hover:border-slate-300 rounded-[22px] overflow-hidden shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
                      >
                        {/* Top Strip */}
                        <div className="p-4 bg-[#FAF8FE] border-b border-[#F0F2F5] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#5B2BE0] bg-white border border-[#E9DCFF] px-2.5 py-0.5 rounded-lg">
                              #{b.bookingCode}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600 uppercase">
                              {b.bookingType === "visit" ? "Scheduled Visit" : "Token Paid"}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isPending
                              ? "bg-amber-100 text-amber-800 border border-amber-300/40"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300/40"
                          }`}>
                            ● {b.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                          <div className="flex items-start gap-3.5">
                            <img
                              src={b.image}
                              alt={b.title}
                              className="w-20 h-20 rounded-2xl object-cover border border-[#E8E8F0] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="bg-[#EFE7FF] text-[#5B2BE0] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                                {b.type}
                              </span>
                              <h4 className="font-manrope font-bold text-sm text-[#151538] line-clamp-1 mt-1">
                                {b.title}
                              </h4>
                              <p className="text-[11px] text-[#666680] truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#8C8CA1] shrink-0" />
                                <span>{b.location}</span>
                              </p>
                              <span className="font-manrope font-black text-sm text-[#151538] block mt-1">
                                ₹{b.rent.toLocaleString()}<span className="text-xs font-normal text-[#8C8CA1]">/mo</span>
                              </span>
                            </div>
                          </div>

                          {/* Host Contact & Slot Box */}
                          <div className="bg-[#F8FAFC] border border-[#E8E8F0] rounded-xl p-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Owner / Host:</span>
                              <span className="font-bold text-[#151538]">{b.ownerName}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Visit Date & Slot:</span>
                              <span className="font-bold text-[#5B2BE0] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{b.visitDate}</span>
                              </span>
                            </div>
                            {b.tokenAmount > 0 && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-medium">Advance Token:</span>
                                <span className="font-bold text-emerald-600">₹{b.tokenAmount.toLocaleString()} Paid ✓</span>
                              </div>
                            )}

                            {/* Contact Host Buttons */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                              <a
                                href={`https://wa.me/91${b.ownerPhone}?text=${encodeURIComponent(`Hi ${b.ownerName}, I am messaging regarding my CheckRooms visit booking #${b.bookingCode} for "${b.title}".`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-[#128C7E]" />
                                <span>WhatsApp Host</span>
                              </a>
                              <a
                                href={`tel:${b.ownerPhone}`}
                                className="flex-1 bg-slate-200/70 hover:bg-slate-200 text-slate-800 font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-700" />
                                <span>Call Host</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-3 bg-[#FAF8FE] border-t border-[#F0F2F5] flex items-center justify-between">
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to cancel this visit request?")) {
                                setMyBookings(myBookings.filter((item) => item.id !== b.id));
                              }
                            }}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Cancel Request
                          </button>
                          <Link
                            href={`/${b.type === "flat" ? "flats" : b.type === "hostel" ? "hostels" : b.type === "pg" ? "pg" : "rooms"}/1`}
                            className="bg-white hover:bg-slate-50 border border-[#E8E8F0] text-[#5B2BE0] font-bold text-xs py-1.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1"
                          >
                            <span>View Room Details →</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E8F0] rounded-[28px] p-12 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#EFE7FF] text-[#5B2BE0] flex items-center justify-center mx-auto">
                    <CalendarDays className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-manrope font-bold text-base text-[#151538]">No Scheduled Visits or Bookings</h3>
                    <p className="text-xs text-[#666680] max-w-xs mx-auto">
                      Schedule a free in-person property visit or reserve a room directly from our listings!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="bg-[#5B2BE0] text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:bg-[#4A20C0] transition-all cursor-pointer shadow-md shadow-[#5B2BE0]/20"
                  >
                    Browse Available Rooms
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MY SUBMITTED REPORTS */}
          {/* ========================================================================= */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {reports.length > 0 ? (
                <div className="bg-white border border-[#ECECEC] rounded-[32px] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto text-left">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-manrope">
                          <th className="px-6 py-4">Reported Property</th>
                          <th className="px-6 py-4">Owner</th>
                          <th className="px-6 py-4">Reason</th>
                          <th className="px-6 py-4">Report Date</th>
                          <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235] font-manrope">
                        {reports.map((rep) => (
                          <tr key={rep.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-[#1E2235]">
                              {rep.listingTitle}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-bold">{rep.ownerName}</td>
                            <td className="px-6 py-4">
                              <span className="bg-red-50 text-red-600 text-[9px] font-black px-2.5 py-1 rounded-md border border-red-200/50 uppercase tracking-wide leading-none">
                                {rep.reason}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 font-medium">{rep.date}</td>
                            <td className="px-6 py-4 text-right">
                              <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                {rep.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#ECECEC] rounded-[32px] p-12 text-center max-w-md mx-auto space-y-5">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <AlertTriangle className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[#1E2235]">No Reports Submitted</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Thank you! You haven't reported any fake listings. Helping us keep the platform authentic makes CheckRooms better for everyone.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
