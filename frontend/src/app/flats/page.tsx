"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Search, 
  Heart, 
  ChevronDown,
  Home,
  SlidersHorizontal,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import { PropertyListing } from "@/data/listings";
import { getApiUrl, getImageUrl } from "@/data/api";

const MotionLink = motion.create(Link);

function FlatsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [area, setArea] = useState(searchParams.get("area") === "Select Area" ? "" : (searchParams.get("area") || ""));
  const [type, setType] = useState(searchParams.get("type") || "flat");
  const [budget, setBudget] = useState(searchParams.get("budget") || "Any Budget");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setBudget("Any Budget");
    const targetPath = newType === "pg" ? "/pg" : newType === "hostel" ? "/hostels" : newType === "flat" ? "/flats" : "/rooms";
    router.push(
      `${targetPath}?city=${city}&area=${area}&type=${newType}&budget=Any Budget`
    );
  };

  const getBudgetOptions = () => {
    if (type === "room") {
      return [
        { value: "Any Budget", label: "Any Budget" },
        { value: "3000", label: "Under ₹3,000" },
        { value: "5000", label: "Under ₹5,000" },
        { value: "8000", label: "Under ₹8,000" },
        { value: "12000", label: "Under ₹12,000" },
        { value: "15000", label: "Under ₹15,000" },
      ];
    } else if (type === "pg") {
      return [
        { value: "Any Budget", label: "Any Budget" },
        { value: "4000", label: "Under ₹4,000" },
        { value: "6000", label: "Under ₹6,000" },
        { value: "9000", label: "Under ₹9,000" },
        { value: "12000", label: "Under ₹12,000" },
        { value: "15000", label: "Under ₹15,000" },
      ];
    } else if (type === "hostel") {
      return [
        { value: "Any Budget", label: "Any Budget" },
        { value: "5000", label: "Under ₹5,000" },
        { value: "8000", label: "Under ₹8,000" },
        { value: "12000", label: "Under ₹12,000" },
        { value: "16000", label: "Under ₹16,000" },
        { value: "20000", label: "Under ₹20,000" },
      ];
    } else if (type === "flat") {
      return [
        { value: "Any Budget", label: "Any Budget" },
        { value: "6000", label: "Under ₹6,000" },
        { value: "10000", label: "Under ₹10,000" },
        { value: "15000", label: "Under ₹15,000" },
        { value: "20000", label: "Under ₹20,000" },
        { value: "25000", label: "Under ₹25,000" },
      ];
    } else {
      return [
        { value: "Any Budget", label: "Any Budget" },
        { value: "5000", label: "Under ₹5,000" },
        { value: "10000", label: "Under ₹10,000" },
        { value: "15000", label: "Under ₹15,000" },
        { value: "20000", label: "Under ₹20,000" },
      ];
    }
  };

  const handleSearchSubmit = () => {
    setShowMobileSearch(false);
    const targetPath = type === "pg" ? "/pg" : type === "hostel" ? "/hostels" : type === "flat" ? "/flats" : "/rooms";
    router.push(
      `${targetPath}?city=${city}&area=${area}&type=${type}&budget=${budget}`
    );
  };

  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [selectedFurnishings, setSelectedFurnishings] = useState<string[]>([]);
  const [selectedPreferred, setSelectedPreferred] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sortBy, setSortBy] = useState("Relevance");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Saved Listings Client State
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProperties = async () => {
      let apiListings: PropertyListing[] = [];
      try {
        const savedLat = localStorage.getItem("checkrooms_user_lat") || "";
        const savedLon = localStorage.getItem("checkrooms_user_lon") || "";
        const queryParams = [];
        if (savedLat) queryParams.push(`lat=${savedLat}`);
        if (savedLon) queryParams.push(`lon=${savedLon}`);
        const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        const res = await fetch(getApiUrl(`/api/listings${queryString}`));
        if (res.ok) {
          const data = await res.json();
          apiListings = (data || []).map((item: any) => ({
            ...item,
            id: item._id || item.id
          }));
        }
      } catch (err) {
        console.error("Failed to fetch listings from backend:", err);
      }

      let localProps: PropertyListing[] = [];
      if (typeof window !== "undefined") {
        try {
          localProps = JSON.parse(localStorage.getItem("checkrooms_properties") || "[]");
        } catch (e) {}
      }

      const apiIds = new Set(apiListings.map((p) => p.id));
      const combined = [...apiListings, ...localProps.filter((p) => !apiIds.has(p.id))];
      setProperties(combined);

      // Load promoted listing IDs
      let promoSlots: any[] = [];
      try {
        const resSlots = await fetch(getApiUrl("/api/promotions/slots"));
        if (resSlots.ok) {
          const slotsData = await resSlots.json();
          if (Array.isArray(slotsData) && slotsData.length > 0) {
            promoSlots = slotsData;
            if (typeof window !== "undefined") {
              localStorage.setItem("checkrooms_promotions", JSON.stringify(slotsData));
            }
          }
        }
      } catch (e) {
        console.error("Error loading promo slots from backend:", e);
      }

      if (promoSlots.length === 0 && typeof window !== "undefined") {
        try {
          promoSlots = JSON.parse(localStorage.getItem("checkrooms_promotions") || "[]");
        } catch (e) {}
      }
      const activePromoted = new Set<string>(
        promoSlots
          .filter((slot: any) => slot.status === "Active" && slot.listingId)
          .map((slot: any) => slot.listingId)
      );
      setPromotedIds(activePromoted);
    };

    fetchProperties();

    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("saved_listings") || "[]");
      const cleaned = Array.isArray(saved) ? saved.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id)) : [];
      if (cleaned.length !== saved.length) {
        localStorage.setItem("saved_listings", JSON.stringify(cleaned));
        setSavedIds(cleaned);
      } else {
        setSavedIds(saved);
      }
      window.addEventListener("checkroomsPropertiesUpdated", fetchProperties);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("checkroomsPropertiesUpdated", fetchProperties);
      }
    };
  }, []);

  useEffect(() => {
    document.title = "Flats for Rent | CheckRooms";
  }, []);

  useEffect(() => {
    const handleToggle = () => setShowMobileSearch((prev) => !prev);
    window.addEventListener("toggleMobileSearch", handleToggle);
    return () => window.removeEventListener("toggleMobileSearch", handleToggle);
  }, []);

  useEffect(() => {
    const paramCity = searchParams.get("city") || "";
    const paramArea = searchParams.get("area") === "Select Area" ? "" : (searchParams.get("area") || "");
    const typeVal = searchParams.get("type");
    const paramType = typeVal === null ? "flat" : (typeVal === "" ? "all" : typeVal);
    const paramBudget = searchParams.get("budget") || "Any Budget";
    const paramSharing = searchParams.get("sharing") || "";
    const paramPreferred = searchParams.get("preferred") || "";

    setCity(paramCity);
    setArea(paramArea);
    setType(paramType);
    setBudget(paramBudget);

    if (paramSharing) {
      if (paramSharing.toLowerCase() === "shared" || paramSharing.toLowerCase() === "sharing") {
        setSelectedRoomTypes(["Shared Room"]);
      } else {
        setSelectedRoomTypes([paramSharing]);
      }
    } else {
      setSelectedRoomTypes([]);
    }

    if (paramPreferred) {
      setSelectedPreferred([paramPreferred]);
    } else {
      setSelectedPreferred([]);
    }
  }, [searchParams]);

  const toggleSaveProperty = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated = [...savedIds];
    if (updated.includes(id)) {
      updated = updated.filter(item => item !== id);
    } else {
      updated.push(id);
    }
    setSavedIds(updated);
    localStorage.setItem("saved_listings", JSON.stringify(updated));
    window.dispatchEvent(new Event("savedListingsUpdated"));
  };

  // Collapse/Expand state for filter categories
  const [collapses, setCollapses] = useState({
    budget: false,
    roomType: false,
    furnishing: false,
    preferredFor: false,
    amenities: true,
  });

  const toggleCollapse = (key: keyof typeof collapses) => {
    setCollapses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    setSelectedRoomTypes([]);
    setSelectedFurnishings([]);
    setSelectedPreferred([]);
    setMaxPrice(25000);
    setSortBy("Relevance");
  };

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (list.includes(val)) {
      setList(list.filter((x) => x !== val));
    } else {
      setList([...list, val]);
    }
  };

  const matchSmartLocation = (item: PropertyListing, queryStr: string) => {
    if (!queryStr || !queryStr.trim()) return true;
    const q = queryStr.trim().toLowerCase();
    
    const c = (item.city || "").toLowerCase();
    const a = (item.area || "").toLowerCase();
    const addr = (item.address || "").toLowerCase();
    const t = (item.title || "").toLowerCase();
    const p = (item.pincode || "").toLowerCase();

    // Noida vs Greater Noida strict differentiation
    if (q === "noida" && c.includes("greater noida")) return false;
    if (c === "noida" && q.includes("greater noida")) return false;

    // Direct full substring match
    if (c.includes(q) || a.includes(q) || addr.includes(q) || t.includes(q) || (p && p.includes(q))) return true;

    // Split query into tokens and require ALL of them to match (except noise words)
    const noiseWords = new Set(["in", "near", "at", "the", "for", "and", "room", "rooms", "flat", "flats", "pg", "hostel", "hostels"]);
    const tokens = q.split(/[\s,]+/).filter((tok) => tok.length >= 2 && !noiseWords.has(tok));
    
    if (tokens.length > 0) {
      return tokens.every((tok) => {
        // If token is "noida" and city is "greater noida", they shouldn't match unless query also has "greater"
        if (tok === "noida" && c.includes("greater noida") && !q.includes("greater")) {
          return a.includes(tok) || addr.includes(tok) || t.includes(tok) || (p && p.includes(tok));
        }
        return c.includes(tok) || a.includes(tok) || addr.includes(tok) || t.includes(tok) || (p && p.includes(tok));
      });
    }
    
    return false;
  };

  // Filter and Sort properties
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Type check
      if (type && type !== "all") {
        if (item.type !== type) return false;
      }

      // Filter by city & area with smart location matching
      if (city && !matchSmartLocation(item, city)) return false;
      if (area && !matchSmartLocation(item, area)) return false;

      // Filter by budget dropdown
      if (budget !== "Any Budget" && item.rent > parseInt(budget)) return false;

      // Filter by budget range slider (treat max slider value 25000 as Any Budget)
      if (maxPrice < 25000 && item.rent > maxPrice) return false;

      // Filter by Room Type
      if (selectedRoomTypes.length > 0) {
        const isMatched = selectedRoomTypes.some((type) => {
          if (type === "Single Room" && item.sharing?.includes("Single")) return true;
          if (type === "Shared Room" && item.sharing?.includes("Sharing")) return true;
          if (type === "1BHK" && item.title.toLowerCase().includes("1bhk")) return true;
          if (type === "2BHK" && item.title.toLowerCase().includes("2bhk")) return true;
          if (type === "3BHK+" && (item.title.toLowerCase().includes("3bhk") || item.title.toLowerCase().includes("4bhk"))) return true;
          return false;
        });
        if (!isMatched) return false;
      }

      // Filter by Furnishing
      if (selectedFurnishings.length > 0) {
        if (!selectedFurnishings.includes(item.furnishing)) return false;
      }

      // Filter by Preferred For
      if (selectedPreferred.length > 0) {
        const isMatched = selectedPreferred.some((preferred) => {
          if (preferred.toLowerCase().includes("boys") && item.tag.toLowerCase().includes("boys")) return true;
          if (preferred.toLowerCase().includes("girls") && item.tag.toLowerCase().includes("girls")) return true;
          if (preferred.toLowerCase().includes("family") && (item.tag.toLowerCase().includes("family") || item.tag.toLowerCase().includes("couple"))) return true;
          return false;
        });
        if (!isMatched) return false;
      }

      return true;
    }).sort((a, b) => {
      // 1. Promoted listings first
      const aPromoted = promotedIds.has(a.id);
      const bPromoted = promotedIds.has(b.id);
      if (aPromoted && !bPromoted) return -1;
      if (!aPromoted && bPromoted) return 1;

      // 2. Sort by chosen criteria
      if (sortBy === "PriceLowHigh") {
        return a.rent - b.rent;
      }
      if (sortBy === "PriceHighLow") {
        return b.rent - a.rent;
      }
      if (sortBy === "Rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });
  }, [selectedRoomTypes, selectedFurnishings, selectedPreferred, maxPrice, properties, city, area, budget, type, promotedIds, sortBy]);

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 lg:pt-40 pb-16 bg-[#F8F9FC]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 w-full space-y-6">
          
          {/* PAGE HEADER: TITLE + BREADCRUMBS & COMPACT HEADER SEARCH */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 md:p-8 rounded-[32px] border border-[#ECECEC] shadow-[0px_4px_24px_rgba(0,0,0,0.02)]">
            <div className="text-left space-y-2 shrink-0">
              <h1 className="font-poppins font-bold text-2xl md:text-3xl text-[#1E2235] tracking-tight">
                Flats for Rent
              </h1>
              <div className="flex items-center space-x-2 text-xs md:text-[13px] font-medium text-[#94A3B8]">
                <Link href="/" className="hover:text-[#6C4CF1] transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#1E2235]">Flats</span>
              </div>
            </div>

            {/* Compact Header Search bar */}
            <div className={`flex-1 max-w-3xl lg:ml-6 ${showMobileSearch ? "block animate-fadeIn" : "hidden lg:block"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-0 border border-[#ECECEC] rounded-2xl md:rounded-[24px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Input 1: City */}
                <div className="relative h-14 sm:h-16 flex items-center px-4 border-b border-[#F0F2F5] sm:border-b-0 sm:border-r hover:bg-slate-50/50 transition-colors">
                  <MapPin className="w-5 h-5 text-[#6C4CF1] shrink-0" />
                  <div className="flex flex-col text-left ml-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider leading-none">City</span>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Type City..."
                      className="bg-transparent text-sm sm:text-base font-semibold text-[#1E2235] mt-1 outline-none w-full border-none p-0 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Input 2: Area */}
                <div className="relative h-14 sm:h-16 flex items-center px-4 border-b border-[#F0F2F5] sm:border-b-0 md:border-r md:border-[#ECECEC] hover:bg-slate-50/50 transition-colors">
                  <MapPin className="w-5 h-5 text-[#6C4CF1] shrink-0" />
                  <div className="flex flex-col text-left ml-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider leading-none">Area</span>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Type Area..."
                      className="bg-transparent text-sm sm:text-base font-semibold text-[#1E2235] mt-1 outline-none w-full border-none p-0 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Input 3: Property Type */}
                <div className="relative h-14 sm:h-16 flex items-center px-4 border-b border-[#F0F2F5] sm:border-b-0 sm:border-r hover:bg-slate-50/50 transition-colors">
                  <Home className="w-5 h-5 text-[#6C4CF1] shrink-0" />
                  <div className="flex flex-col text-left ml-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider leading-none">Property Type</span>
                    <span className="text-sm sm:text-base font-semibold text-[#1E2235] truncate mt-1">
                      {type === "room" ? "Room" : type === "pg" ? "PG" : type === "hostel" ? "Hostel" : type === "flat" ? "Flat" : "All Types"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="room">Room</option>
                    <option value="pg">PG</option>
                    <option value="hostel">Hostel</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>

                {/* Input 4: Budget */}
                <div className="relative h-14 sm:h-16 flex items-center px-4 border-b border-[#F0F2F5] sm:border-b-0 hover:bg-slate-50/50 transition-colors md:col-span-1">
                  <span className="text-base font-bold text-[#6C4CF1] shrink-0 leading-none">₹</span>
                  <div className="flex flex-col text-left ml-2 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider leading-none">Budget</span>
                    <span className="text-sm sm:text-base font-semibold text-[#1E2235] truncate mt-1">
                      {budget === "Any Budget" ? "Any Budget" : `Under ₹${parseInt(budget).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {getBudgetOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button 
                  onClick={handleSearchSubmit}
                  className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white flex items-center justify-center space-x-1.5 h-14 sm:h-16 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 col-span-1 cursor-pointer"
                >
                  <Search className="w-4.5 h-4.5 text-white" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN PAGE BODY: SIDEBAR FILTERS (25%) + PROPERTIES GRID (75%) */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* 1. SIDEBAR FILTERS COLUMN */}
            <aside className={`w-full lg:w-[290px] bg-white rounded-[32px] border border-[#ECECEC] p-7 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] space-y-6 shrink-0 text-left lg:sticky lg:top-36 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F5]">
                <h3 className="font-poppins font-bold text-base text-[#1E2235]">Filters</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleReset}
                    className="text-xs sm:text-sm font-semibold text-[#6C4CF1] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden text-xs font-bold bg-[#6C4CF1] text-white px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Filter Section: Budget */}
              <div className="space-y-4 pb-4 border-b border-[#F0F2F5]">
                <button 
                  onClick={() => toggleCollapse("budget")}
                  className="flex items-center justify-between w-full font-poppins font-bold text-sm text-[#1E2235]"
                >
                  <span>Max Budget</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-[#94A3B8] transition-transform duration-200 ${collapses.budget ? "rotate-180" : ""}`} />
                </button>
                
                {!collapses.budget && (
                  <div className="space-y-3 pt-1">
                    <input 
                      type="range" 
                      min="5000" 
                      max="35000" 
                      step="500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#F0EDFF] rounded-lg appearance-none cursor-pointer accent-[#6C4CF1]"
                    />
                    <div className="flex justify-between items-center text-xs text-[#94A3B8] font-bold">
                      <span>₹0</span>
                      <span className="text-[#6C4CF1] text-sm font-bold">
                        {maxPrice === 25000 ? "Any Price" : `₹${maxPrice.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Section: BHK Type */}
              <div className="space-y-4 pb-4 border-b border-[#F0F2F5]">
                <button 
                  onClick={() => toggleCollapse("roomType")}
                  className="flex items-center justify-between w-full font-poppins font-bold text-sm text-[#1E2235]"
                >
                  <span>BHK / Size</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-[#94A3B8] transition-transform duration-200 ${collapses.roomType ? "rotate-180" : ""}`} />
                </button>
                
                {!collapses.roomType && (
                  <div className="space-y-3.5 pt-1">
                    {["1BHK", "2BHK", "3BHK+", "Single Room", "Shared Room"].map((type) => {
                      const isChecked = selectedRoomTypes.includes(type);
                      return (
                        <label key={type} className="flex items-center space-x-3 text-[13px] sm:text-sm text-[#64748B] hover:text-[#1E2235] font-medium cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFilter(selectedRoomTypes, setSelectedRoomTypes, type)}
                            className="w-4.5 h-4.5 rounded border-[#ECECEC] text-[#6C4CF1] focus:ring-[#6C4CF1] cursor-pointer"
                          />
                          <span>{type}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter Section: Furnishing */}
              <div className="space-y-4 pb-4 border-b border-[#F0F2F5]">
                <button 
                  onClick={() => toggleCollapse("furnishing")}
                  className="flex items-center justify-between w-full font-poppins font-bold text-sm text-[#1E2235]"
                >
                  <span>Furnishing</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-[#94A3B8] transition-transform duration-200 ${collapses.furnishing ? "rotate-180" : ""}`} />
                </button>
                
                {!collapses.furnishing && (
                  <div className="space-y-3.5 pt-1">
                    {["Fully Furnished", "Semi Furnished", "Unfurnished"].map((furnish) => {
                      const isChecked = selectedFurnishings.includes(furnish);
                      return (
                        <label key={furnish} className="flex items-center space-x-3 text-[13px] sm:text-sm text-[#64748B] hover:text-[#1E2235] font-medium cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFilter(selectedFurnishings, setSelectedFurnishings, furnish)}
                            className="w-4.5 h-4.5 rounded border-[#ECECEC] text-[#6C4CF1] focus:ring-[#6C4CF1] cursor-pointer"
                          />
                          <span>{furnish}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter Section: Preferred For */}
              <div className="space-y-4 pb-4 border-b border-[#F0F2F5]">
                <button 
                  onClick={() => toggleCollapse("preferredFor")}
                  className="flex items-center justify-between w-full font-poppins font-bold text-sm text-[#1E2235]"
                >
                  <span>Preferred For</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-[#94A3B8] transition-transform duration-200 ${collapses.preferredFor ? "rotate-180" : ""}`} />
                </button>
                
                {!collapses.preferredFor && (
                  <div className="space-y-3.5 pt-1">
                    {["Family", "Boys", "Girls"].map((pref) => {
                      const isChecked = selectedPreferred.includes(pref);
                      return (
                        <label key={pref} className="flex items-center space-x-3 text-[13px] sm:text-sm text-[#64748B] hover:text-[#1E2235] font-medium cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFilter(selectedPreferred, setSelectedPreferred, pref)}
                            className="w-4.5 h-4.5 rounded border-[#ECECEC] text-[#6C4CF1] focus:ring-[#6C4CF1] cursor-pointer"
                          />
                          <span>{pref}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter Section: Amenities */}
              <div className="space-y-4">
                <button 
                  onClick={() => toggleCollapse("amenities")}
                  className="flex items-center justify-between w-full font-poppins font-bold text-sm text-[#1E2235]"
                >
                  <span>Amenities</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-[#94A3B8] transition-transform duration-200 ${collapses.amenities ? "rotate-180" : ""}`} />
                </button>
                
                {!collapses.amenities && (
                  <div className="space-y-3.5 pt-1">
                    {["Lift", "Car Parking", "Power Backup", "Security", "Balcony"].map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-3 text-[13px] sm:text-sm text-[#64748B] hover:text-[#1E2235] font-medium cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          className="w-4.5 h-4.5 rounded border-[#ECECEC] text-[#6C4CF1] focus:ring-[#6C4CF1] cursor-pointer"
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* 2. PROPERTIES GRID COLUMN */}
            <div className="flex-1 space-y-6 text-left w-full">
              {/* Filter Count & Sorting header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white px-5 py-4 sm:px-6 sm:py-5 rounded-[24px] sm:rounded-[28px] border border-[#ECECEC] shadow-[0px_4px_24px_rgba(0,0,0,0.02)]">
                <span className="text-sm sm:text-base font-bold text-[#1E2235] text-left w-full sm:w-auto">
                  Showing <span className="text-[#6C4CF1]">{filteredProperties.length}</span> Flat{filteredProperties.length !== 1 ? "s" : ""}{city ? ` in ${city}` : ""}
                </span>
                
                <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto shrink-0">
                  {/* Filters toggle button for Mobile */}
                  <button 
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className={`flex lg:hidden items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      showMobileFilters
                        ? "bg-[#6C4CF1] border-[#6C4CF1] text-white"
                        : "bg-[#F0EDFF] border-[#6C4CF1]/20 text-[#6C4CF1]"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>

                  <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider hidden sm:inline">Sort by:</span>
                  <div className="relative flex-grow sm:flex-grow-0">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-[#EBEFF8] shadow-sm rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#64748B] hover:text-[#1E2235] focus:outline-none cursor-pointer pr-8 appearance-none w-full"
                    >
                      <option value="Relevance">Relevance</option>
                      <option value="PriceLowHigh">Price: Low to High</option>
                      <option value="PriceHighLow">Price: High to Low</option>
                      <option value="Rating">Top Rated</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid content */}
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {filteredProperties.map((prop, idx) => {
                    const isPromoted = promotedIds.has(prop.id);
                    const typePath = (prop.type || "flat").toLowerCase();
                    const detailsUrl = `/${typePath === "room" ? "rooms" : typePath === "hostel" ? "hostels" : typePath === "flat" ? "flats" : "pg"}/${prop.id}`;
                    const isSaved = savedIds.includes(prop.id);
                    
                    return (
                      <MotionLink
                        key={prop.id}
                        href={detailsUrl}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                        className={`group relative flex flex-col bg-white rounded-[24px] border transition-all duration-300 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0px_16px_36px_rgba(108,76,241,0.08)] hover:-translate-y-1 cursor-pointer pointer-events-auto ${
                          isPromoted
                            ? "border-amber-300 ring-1 ring-amber-300/60"
                            : "border-[#ECECEC] hover:border-[#6C4CF1]/40"
                        }`}
                      >
                        {/* Image Container */}
                        <div className="aspect-[16/11] sm:aspect-[4/3] w-full relative overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={getImageUrl(prop.image)}
                            alt={prop.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                            {isPromoted && (
                              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3 text-white fill-white/20 animate-pulse" />
                                <span>Featured</span>
                              </div>
                            )}
                            <div className="bg-emerald-500/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <CheckCircle className="w-3 h-3 text-white" />
                              <span>Verified</span>
                            </div>
                          </div>

                          {/* Floating Heart Button */}
                          <button
                            onClick={(e) => toggleSaveProperty(prop.id, e)}
                            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border shadow-sm cursor-pointer active:scale-90 transition-all z-20 backdrop-blur-xs ${
                              isSaved
                                ? "bg-red-50/95 border-red-200 text-red-500"
                                : "bg-white/90 border-black/5 text-neutral-500 hover:text-red-500 hover:bg-white"
                            }`}
                            title={isSaved ? "Remove from saved" : "Save property"}
                          >
                            <Heart className={`w-4.5 h-4.5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                          </button>

                          {/* Rent Overlay Pill */}
                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-left z-10 shadow-sm border border-white/10">
                            <span className="text-[10px] font-medium text-white/80 block leading-none">Rent</span>
                            <div className="flex items-baseline space-x-1 mt-0.5">
                              <span className="text-base sm:text-lg font-bold leading-tight font-poppins">
                                ₹{prop.rent.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-white/75 font-normal">
                                /mo
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Info Content Box */}
                        <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3 bg-white">
                          <div className="space-y-2">
                            {/* Badges / Meta Chips */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {prop.sharing && (
                                <span className="text-[10px] sm:text-[11px] font-bold text-[#6C4CF1] bg-[#F0EDFF] px-2.5 py-0.5 rounded-md">
                                  {prop.sharing}
                                </span>
                              )}
                              {prop.furnishing && (
                                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                  {prop.furnishing}
                                </span>
                              )}
                              {prop.tag && (
                                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                                  {prop.tag}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-poppins font-bold text-base sm:text-[17px] text-[#1E2235] group-hover:text-[#6C4CF1] transition-colors line-clamp-1 leading-snug">
                              {prop.title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center space-x-1.5 text-slate-500 leading-none">
                              <MapPin className="w-3.5 h-3.5 text-[#6C4CF1] shrink-0" />
                              <span className="text-xs sm:text-[13px] font-medium truncate">
                                {prop.area}, {prop.city}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Action CTA */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-left">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Zero Brokerage</span>
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                Direct Owner
                              </span>
                            </div>
                            <div className="bg-[#6C4CF1] group-hover:bg-[#5B3FE6] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1 transition-all shadow-sm">
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </MotionLink>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-[#ECECEC] rounded-[32px] p-8 shadow-sm">
                  <p className="text-sm text-[#94A3B8] font-bold">
                    No flats match your active filters. Try resetting the filters or adjusting the budget slider.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}

export default function FlatsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6C4CF1]" />
      </div>
    }>
      <FlatsPageContent />
    </Suspense>
  );
}
