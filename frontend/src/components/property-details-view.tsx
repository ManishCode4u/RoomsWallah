"use client";

import { useState, useEffect, ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Check,
  Wifi,
  Wind,
  Utensils,
  Car,
  Shield,
  Dumbbell,
  BookOpen,
  FolderLock,
  FlameKindling,
  ChevronLeft,
  Share2,
  Heart,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Info,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { PropertyListing } from "@/data/listings";
import { getApiUrl } from "@/data/api";
import BookingModal from "./booking-modal";
import Navbar from "./navbar";
import MobileNav from "./mobile-nav";
import Footer from "./footer";

interface PropertyDetailsViewProps {
  property: PropertyListing;
  backHref: string;
  categoryLabel: string;
}

const amenityIconMap: Record<string, ComponentType<{ className?: string }>> = {
  "Wi-Fi": Wifi,
  "AC": Wind,
  "Food Included": Utensils,
  "Cleaning": Check,
  "Parking": Car,
  "Geyser": FlameKindling,
  "Security": Shield,
  "CCTV Security": ShieldCheck,
  "Gym": Dumbbell,
  "Library": BookOpen,
  "Lockers": FolderLock,
};

const getWhatsAppLink = (phoneOrUrl: string, title: string) => {
  if (!phoneOrUrl) return "#";
  if (phoneOrUrl.startsWith("http")) {
    return phoneOrUrl;
  }
  // Clean raw phone number (remove spaces, dashes, etc.)
  const cleaned = phoneOrUrl.replace(/\D/g, "");
  // If it's a 10 digit Indian number, append 91 prefix
  const phoneWithCountry = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  
  const message = encodeURIComponent(`Hi, I'm interested in your property listing: "${title}" posted on RoomsWallah. Is it still available?`);
  return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${message}`;
};

export default function PropertyDetailsView({
  property,
  backHref,
  categoryLabel,
}: PropertyDetailsViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<"Fake Listing" | "Wrong Information" | "Duplicate Listing" | "Spam">("Fake Listing");
  const [reportMessage, setReportMessage] = useState("");

  const registerInquiry = async (type: "call" | "whatsapp") => {
    try {
      await fetch(getApiUrl(`/api/listings/${property.id}/inquiry`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ type })
      });
    } catch (e) {
      console.error("Failed to log inquiry:", e);
    }
  };

  // Load saved status from localStorage and set dynamic page title for SEO on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("saved_listings") || "[]");
      setIsSaved(saved.includes(property.id));
      if (property.title) {
        document.title = `${property.title} - RoomsWallah`;
      }
    }
  }, [property.id, property.title]);

  const handleToggleSave = () => {
    let saved = JSON.parse(localStorage.getItem("saved_listings") || "[]");
    const nextSaved = !isSaved;
    if (nextSaved) {
      if (!saved.includes(property.id)) saved.push(property.id);
    } else {
      saved = saved.filter((id: string) => id !== property.id);
    }
    localStorage.setItem("saved_listings", JSON.stringify(saved));
    setIsSaved(nextSaved);
    window.dispatchEvent(new Event("savedListingsUpdated"));
  };

  // Touch Swipe handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const thumbnails = (property as any).images && (property as any).images.length > 0
    ? (property as any).images
    : [property.image];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? thumbnails.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === thumbnails.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <main className="flex-grow pt-32 lg:pt-40 pb-28">
        <div className="max-w-[1280px] mx-auto px-6 w-full space-y-6">
          
          {/* ========================================================================= */}
          {/* HEADER: BACK NAVIGATION & SHARE/FAVORITE ACTIONS */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EBEFF8]">
            <div className="flex items-center space-x-3.5 text-left">
              <Link 
                href={backHref} 
                className="w-10 h-10 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center text-[#1E2235] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft className="w-5 h-5 text-[#1E2235]" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-[#6C4CF1] font-bold uppercase tracking-wider bg-[#F0EDFF] px-2 py-0.5 rounded">
                    {property.type}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide">
                    {property.tag} &bull; {categoryLabel}
                  </span>
                </div>
                <h2 className="font-bold text-sm sm:text-base text-[#1E2235] mt-1.5 leading-tight">
                  {property.title}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowReportModal(true)}
                className="w-10 h-10 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer shadow-xs active:scale-90"
                title="Report Listing"
              >
                <AlertTriangle className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={handleToggleSave}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
                  isSaved ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-[#ECECEC] text-[#94A3B8] hover:text-[#1E2235] hover:border-slate-300"
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="w-10 h-10 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center text-[#94A3B8] hover:text-primary hover:border-slate-300 transition-all cursor-pointer shadow-xs active:scale-90"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TWO COLUMN CONTENT: LEFT DETAILS (8 cols) + RIGHT CONTACT BAR (4 cols) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Media, Highlights, Info */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* IMAGE SLIDER VIEWPORT */}
              <div 
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-[16/10] w-full rounded-[32px] overflow-hidden bg-slate-950 border border-[#ECECEC] shadow-md group select-none cursor-pointer active:cursor-grabbing"
              >
                <Image
                  src={thumbnails[activeIndex]}
                  alt={`${property.title} - view ${activeIndex + 1}`}
                  fill
                  priority
                  className="object-contain transition-all duration-500 pointer-events-none"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                {/* Left/Right Slider Controller Buttons */}
                <button
                  onClick={handlePrev}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 backdrop-blur-xs active:scale-95 z-20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 backdrop-blur-xs active:scale-95 z-20"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Image Count Badge */}
                <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] font-medium px-3 py-1 rounded-lg flex items-center space-x-1 backdrop-blur-xs shadow-sm select-none">
                  <span>📷</span>
                  <span>{activeIndex + 1} / {thumbnails.length}</span>
                </div>

                {/* Featured Tag */}
                <div className="absolute top-4 left-4 bg-[#6C4CF1] text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                  Featured
                </div>
              </div>

              {/* THUMBNAIL ROW (Slidewise Indicators) */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {thumbnails.map((thumb: string, idx: number) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative aspect-[4/3] w-[75px] sm:w-[90px] rounded-xl overflow-hidden bg-muted border shrink-0 transition-all duration-200 hover:scale-102 ${
                        isActive 
                          ? "border-[#6C4CF1] ring-2 ring-[#6C4CF1]/20 scale-98" 
                          : "border-[#ECECEC] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={thumb}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  );
                })}
              </div>

              {/* PRIMARY TITLE INFO & VERIFICATION */}
              <div className="bg-white rounded-[28px] border border-[#ECECEC] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] text-left space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center space-x-1 shrink-0">
                      <span className="text-[#F59E0B] leading-none">★</span>
                      <span>{property.rating} / 5.0</span>
                    </div>
                    <span className="bg-[#ECFDF5] text-[#10B981] text-[10px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center space-x-1 uppercase border border-[#DEF7EC] shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Verified Property</span>
                    </span>
                  </div>
                  
                  <h1 className="font-bold text-xl sm:text-2xl md:text-3xl text-[#1E2235] tracking-tight leading-tight">
                    {property.title}
                  </h1>

                  <p className="text-xs sm:text-[13px] text-[#64748B] font-medium flex items-center space-x-1.5 pt-0.5">
                    <MapPin className="w-4 h-4 text-[#94A3B8] shrink-0" />
                    <span>{property.area}, {property.city}, Uttar Pradesh</span>
                  </p>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* KEY STATS/HIGHLIGHTS GRID (VISUALLY HIGHLIGHTED) */}
              {/* ========================================================================= */}
              <div className="space-y-3 text-left">
                <h3 className="font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">
                  Key Highlights
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {/* Rent Card */}
                  <div className="bg-white border border-[#EBEFF8] rounded-2xl p-4 flex flex-col justify-between text-left shadow-[0px_2px_8px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-all">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">
                      {property.type === "hostel" ? "Yearly Rent" : "Monthly Rent"}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-[#6C4CF1] mt-1.5">₹{property.rent.toLocaleString("en-IN")}</span>
                    <span className="text-[9.5px] text-[#94A3B8] font-medium mt-0.5 block">Zero Brokerage</span>
                  </div>

                  {/* Security Deposit Card */}
                  <div className="bg-white border border-[#EBEFF8] rounded-2xl p-4 flex flex-col justify-between text-left shadow-[0px_2px_8px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-all">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Security Deposit</span>
                    <span className="text-lg sm:text-xl font-bold text-[#1E2235] mt-1.5">
                      ₹{property.deposit !== undefined ? property.deposit.toLocaleString("en-IN") : (property.rent * 1.5).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9.5px] text-[#94A3B8] font-medium mt-0.5 block">Refundable on checkout</span>
                  </div>

                  {/* Sharing Room Type */}
                  <div className="bg-white border border-[#EBEFF8] rounded-2xl p-4 flex flex-col justify-between text-left shadow-[0px_2px_8px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-all">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Sharing Option</span>
                    <span className="text-lg sm:text-xl font-bold text-[#1E2235] mt-1.5">{property.sharing || "Single Room"}</span>
                    <span className="text-[9.5px] text-[#94A3B8] font-medium mt-0.5 block">Room Type</span>
                  </div>

                  {/* Furnishing Status */}
                  <div className="bg-white border border-[#EBEFF8] rounded-2xl p-4 flex flex-col justify-between text-left shadow-[0px_2px_8px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-all">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Furnishing</span>
                    <span className="text-lg sm:text-xl font-bold text-[#1E2235] mt-1.5">{property.furnishing}</span>
                    <span className="text-[9.5px] text-[#94A3B8] font-medium mt-0.5 block">Fitted Interiors</span>
                  </div>

                  {/* Food / Mess facility */}
                  <div className="bg-white border border-[#EBEFF8] rounded-2xl p-4 flex flex-col justify-between text-left shadow-[0px_2px_8px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-all">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Meals / Mess</span>
                    <span className="text-lg sm:text-xl font-bold text-[#1E2235] mt-1.5">
                      {property.amenities.includes("Food Included") ? "Food Included" : "Not Included"}
                    </span>
                    <span className="text-[9.5px] text-[#94A3B8] font-medium mt-0.5 block">Hygienic Kitchen</span>
                  </div>

                  {/* Preferred Tenants */}
                  <div className="bg-white border border-[#EBEFF8] rounded-2xl p-4 flex flex-col justify-between text-left shadow-[0px_2px_8px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-all">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Preferred For</span>
                    <span className={`text-lg sm:text-xl font-bold mt-1.5 block ${
                      property.tag.includes("Girls") ? "text-pink-600" :
                      property.tag.includes("Boys") ? "text-emerald-600" : "text-blue-600"
                    }`}>{property.tag}</span>
                    <span className="text-[9.5px] text-[#94A3B8] font-medium mt-0.5 block">Tenant Tag</span>
                  </div>
                </div>
              </div>

              {/* AMENITIES SECTION */}
              <div className="space-y-3 text-left pt-2">
                <h3 className="font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">
                  Amenities & Facilities
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIconMap[amenity] || Check;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center space-x-3 p-3 bg-white border border-[#ECECEC] rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.01)] hover:border-[#6C4CF1]/20 transition-colors"
                      >
                        <div className="w-8.5 h-8.5 rounded-lg bg-[#F0EDFF] text-[#6C4CF1] flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-medium text-[#1E2235]">
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PROPERTY DESCRIPTION */}
              <div className="space-y-3 text-left pt-2">
                <h3 className="font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">
                  About this Property
                </h3>
                <div className="bg-white rounded-2xl border border-[#ECECEC] p-5 shadow-[0px_2px_8px_rgba(0,0,0,0.01)] space-y-2">
                  <p className={`text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal ${readMore ? "" : "line-clamp-3"}`}>
                    {property.description}
                  </p>
                  <button 
                    onClick={() => setReadMore(!readMore)}
                    className="text-xs font-semibold text-[#6C4CF1] flex items-center space-x-1 hover:underline cursor-pointer pt-1"
                  >
                    <span>{readMore ? "Read Less" : "Read More"}</span>
                    <span className={`transition-transform duration-200 text-[9px] ${readMore ? "rotate-180" : ""}`}>▼</span>
                  </button>
                </div>
              </div>

              {/* HOUSE RULES */}
              {property.rules && (
                <div className="space-y-3 text-left pt-2">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">
                    House Rules
                  </h3>
                  <div className="bg-white rounded-2xl border border-[#ECECEC] p-5 shadow-[0px_2px_8px_rgba(0,0,0,0.01)]">
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal whitespace-pre-line">
                      {property.rules}
                    </p>
                  </div>
                </div>
              )}

              {/* LOCATION & ADDRESS DETAILS */}
              <div className="space-y-3 text-left pt-2">
                <h3 className="font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">
                  Location & Neighborhood
                </h3>
                
                <div className="bg-white rounded-[24px] border border-[#ECECEC] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] space-y-4">
                   <div className="flex items-start space-x-3">
                     <MapPin className="w-5 h-5 text-[#6C4CF1] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide block leading-none">Full Address</span>
                        <p className="text-xs sm:text-sm text-[#1E2235] font-semibold leading-relaxed">
                          {property.address || `${property.area}, ${property.city}`}{property.pincode ? `, Pincode: ${property.pincode}` : ""}
                        </p>
                      </div>
                   </div>

                   {/* Highlights / Landmarks Block */}
                   <div className="bg-[#F8FAFC] border border-[#F0F2F5] rounded-xl p-3.5 space-y-2">
                     <span className="text-[9px] text-[#6C4CF1] font-semibold uppercase tracking-wider block">Key Landmarks & Connectivity</span>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#64748B] font-medium">
                       <div className="flex items-center space-x-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CF1]" />
                         <span>Located in: <strong className="text-[#1E2235]">{property.area}</strong></span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CF1]" />
                         <span>City: <strong className="text-[#1E2235]">{property.city}</strong></span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CF1]" />
                         <span>Near Metro Link & Public Transit</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CF1]" />
                         <span>Local Market & Food Hubs nearby</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>

              {/* OWNER CONTACT CARD */}
              <div className="space-y-3 text-left pt-2 lg:hidden">
                <h3 className="font-bold text-xs sm:text-sm text-[#1E2235] uppercase tracking-wider">
                  Contact Property Owner
                </h3>
                
                <div className="bg-white rounded-[24px] border border-[#ECECEC] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] space-y-4">
                  <div className="flex items-center space-x-3.5 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div className="text-left flex-grow min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium uppercase block leading-none">Property Owner</span>
                      <span className="text-sm font-semibold text-[#1E2235] truncate block mt-1">{property.ownerName}</span>
                      <span className="text-[10px] text-emerald-600 font-medium block mt-1.5 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse mr-1" />
                        <span>Online & Active</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:from-[#FCD34D] hover:to-[#F59E0B] text-slate-900 font-black py-4 rounded-xl flex items-center justify-center space-x-2 text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 border border-amber-300/20"
                    >
                      <Sparkles className="w-4 h-4 text-slate-900 fill-slate-900/10" />
                      <span>Book Room Now</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={`tel:${property.ownerPhone}`}
                        onClick={() => registerInquiry("call")}
                        className="bg-white hover:bg-slate-50 border border-neutral-300 text-neutral-700 font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer text-center shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>Call Owner</span>
                      </a>

                      <a
                        href={getWhatsAppLink(property.ownerWhatsApp, property.title)}
                        onClick={() => registerInquiry("whatsapp")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10 text-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 fill-white/10" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY CONTACT WIDGET CONTAINER (DESKTOP) */}
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 space-y-5">
              
              {/* BOOKING & CONTACT CARD */}
              <div className="bg-white rounded-[28px] border border-[#ECECEC] p-6 shadow-md text-left space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Starting From</span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-bold text-[#1E2235]">₹{property.rent.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-[#94A3B8] font-normal">/{property.type === "hostel" ? "year" : "month"}</span>
                  </div>
                  <span className="text-[10px] text-[#10B981] font-medium bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-wide">
                    Zero Brokerage Charged
                  </span>
                </div>

                <div className="border-t border-[#F0F2F5] pt-4.5 space-y-4">
                  {/* Listed by / Owner Info */}
                  <div className="flex items-center space-x-3 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div className="text-left flex-grow min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium uppercase block leading-none">Property Owner</span>
                      <span className="text-xs font-semibold text-[#1E2235] truncate block mt-1">{property.ownerName}</span>
                    </div>
                    <span className="bg-[#ECFDF5] text-[#10B981] text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase border border-[#DEF7EC] shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Booking schedule guides */}
                  <div className="space-y-2.5 text-xs text-[#64748B] font-medium">
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4 text-[#6C4CF1] shrink-0" />
                      <span>Schedule a Visit: Mon - Sun (9 AM - 8 PM)</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Info className="w-4 h-4 text-[#6C4CF1] shrink-0" />
                      <span>Contact directly for negotiation & availability</span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col gap-3 pt-1.5">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:from-[#FCD34D] hover:to-[#F59E0B] text-slate-900 font-black py-4 rounded-xl flex items-center justify-center space-x-2 text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 border border-amber-300/20"
                  >
                    <Sparkles className="w-4 h-4 text-slate-900 fill-slate-900/10" />
                    <span>Book Room Now</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${property.ownerPhone}`}
                      onClick={() => registerInquiry("call")}
                      className="bg-white hover:bg-slate-50 border border-neutral-300 text-neutral-700 font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer text-center"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>Call Owner</span>
                    </a>

                    <a
                      href={getWhatsAppLink(property.ownerWhatsApp, property.title)}
                      onClick={() => registerInquiry("whatsapp")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-sm text-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 fill-white/10" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>


            </aside>

          </div>

        </div>
      </main>



      <Footer />

      {/* Lightbox Fullscreen Preview */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 animate-fade-in">
          {/* Close button */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div className="relative max-w-full max-h-[80vh] w-[90vw] h-[80vh] flex items-center justify-center">
            <img 
              src={thumbnails[activeIndex]} 
              alt="Fullscreen preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Right Arrow */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>

          {/* Image Counter */}
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider mt-4">
            Image {activeIndex + 1} of {thumbnails.length}
          </span>
        </div>
      )}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />

      {/* ========================================================================= */}
      {/* REPORT MODAL */}
      {/* ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 text-left animate-fade-in">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setShowReportModal(false)} />
          
          <div className="bg-white border border-[#ECECEC] rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-scale-in">
            {/* Close button */}
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="border-l-3 border-red-500 pl-3 mb-4">
              <h3 className="font-poppins font-black text-base text-[#1E2235] tracking-tight">
                Report this Listing ⚠️
              </h3>
              <p className="font-poppins text-[11px] text-slate-500 font-bold mt-0.5">
                Help us keep RoomsWallah safe and authentic
              </p>
            </div>

            <div className="space-y-4 font-poppins">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Reason for Reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                >
                  <option value="Fake Listing">Fake Listing / Scammer</option>
                  <option value="Wrong Information">Wrong Information / Photos</option>
                  <option value="Duplicate Listing">Duplicate Listing</option>
                  <option value="Spam">Spam / Abuse / Harassment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Tell us what is wrong with this listing (optional)..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2235] px-4.5 py-3.5 rounded-2xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E2235] font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Post report to backend database
                      const response = await fetch(getApiUrl(`/api/listings/${property.id}/report`), {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          reason: reportReason,
                          message: reportMessage
                        })
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Failed to submit report to backend");
                      }

                      // Also maintain local storage for user dashboard backward compatibility
                      const reps = localStorage.getItem("roomswallah_reports") || "[]";
                      let parsedReps = JSON.parse(reps);
                      const newReport = {
                        id: Math.random().toString(36).substring(2, 9),
                        listingId: property.id,
                        listingTitle: property.title,
                        ownerName: (property as any).owner?.fullName || property.ownerName || "Property Owner",
                        reason: reportReason,
                        date: new Date().toLocaleDateString("en-IN"),
                        status: "Pending"
                      };
                      parsedReps.unshift(newReport);
                      localStorage.setItem("roomswallah_reports", JSON.stringify(parsedReps));

                      alert("Thank you! Your report has been submitted to the Admin for review.");
                      setReportMessage("");
                      setShowReportModal(false);
                    } catch (e) {
                      console.error("Failed to submit report:", e);
                      alert("Error submitting report. Please try again.");
                    }
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider cursor-pointer shadow-md active:scale-98 transition-all duration-200"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
