"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getApiUrl } from "@/data/api";
import {
  Menu,
  X,
  Home,
  Bed,
  Building,
  Building2,
  Megaphone,
  Star,
  Tag,
  HelpCircle,
  Info,
  Phone,
  ChevronRight,
  Plus,
  Heart,
  Search,
  Bell,
  SlidersHorizontal,
  MapPin,
  ArrowLeft,
  Locate,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isSavedActive, setIsSavedActive] = useState(false);
  const pathname = usePathname();
  const isSearchPage = ["/rooms", "/pg", "/hostels", "/flats"].includes(pathname);
  const [showLocationDrawer, setShowLocationDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userCity, setUserCity] = useState("Greater Noida");
  const [userState, setUserState] = useState("");
  const [userPincode, setUserPincode] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [isHostLoggedIn, setIsHostLoggedIn] = useState(false);
  const [hostName, setHostName] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("🦊");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHostLoggedIn(localStorage.getItem("owner_logged_in") === "true");
      setHostName(localStorage.getItem("owner_name") || "Host");
      setIsUserLoggedIn(localStorage.getItem("user_logged_in") === "true");
      setUserName(localStorage.getItem("user_name") || "User");
      setUserAvatar(localStorage.getItem("user_avatar") || "🦊");
    }
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(getApiUrl(`/api/location/search?q=${encodeURIComponent(searchQuery)}`));
        if (res.ok) {
          const data = await res.json();
          setLocationSuggestions(data);
        }
      } catch (err) {
        console.error("Failed to fetch location autocomplete suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchVal(params.get("city") || "");
    }
  }, [pathname]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const searchKeywords = ["Rooms", "PG", "Hostels", "Flats", "Rooms & PG"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % searchKeywords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const detectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            getApiUrl(`/api/location/reverse?lat=${latitude}&lon=${longitude}`)
          );
          const data = await res.json();
          const matchedCity = data.matchedCity || "Greater Noida";
          const matchedArea = data.area || "";
          const matchedState = data.state || "";
          const matchedPincode = data.pincode || "";
          const displayName = data.displayName || matchedCity;

          localStorage.setItem("roomswallah_user_city", matchedCity);
          localStorage.setItem("roomswallah_user_area", matchedArea);
          localStorage.setItem("roomswallah_user_state", matchedState);
          localStorage.setItem("roomswallah_user_pincode", matchedPincode);
          localStorage.setItem("roomswallah_user_lat", String(latitude));
          localStorage.setItem("roomswallah_user_lon", String(longitude));
          localStorage.setItem("roomswallah_user_display_name", displayName);
          localStorage.setItem("roomswallah_location_handled", "true");

          window.dispatchEvent(new Event("userCityUpdated"));
          setUserCity(matchedCity);
          setUserState(matchedState);
          setUserPincode(matchedPincode);
          setShowLocationDrawer(false);

          router.push(`/?city=${encodeURIComponent(matchedCity)}&area=${encodeURIComponent(matchedArea)}&state=${encodeURIComponent(matchedState)}&pincode=${matchedPincode}`);
        } catch (err) {
          console.error("Error geocoding location:", err);
          localStorage.setItem("roomswallah_user_city", "Greater Noida");
          localStorage.setItem("roomswallah_user_state", "Uttar Pradesh");
          localStorage.setItem("roomswallah_user_pincode", "201310");
          localStorage.setItem("roomswallah_location_handled", "true");
          window.dispatchEvent(new Event("userCityUpdated"));
          setUserCity("Greater Noida");
          setUserState("Uttar Pradesh");
          setUserPincode("201310");
          setShowLocationDrawer(false);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        localStorage.setItem("roomswallah_user_city", "Greater Noida");
        localStorage.setItem("roomswallah_user_state", "Uttar Pradesh");
        localStorage.setItem("roomswallah_user_pincode", "201310");
        localStorage.setItem("roomswallah_location_handled", "true");
        window.dispatchEvent(new Event("userCityUpdated"));
        setUserCity("Greater Noida");
        setUserState("Uttar Pradesh");
        setUserPincode("201310");
        setShowLocationDrawer(false);
        setLoadingLocation(false);
      }
    );
  };

  const handleSelectLocation = (loc: string | { city: string; area?: string; state?: string; pincode?: string; displayName?: string; lat?: string; lon?: string }) => {
    let city = "Greater Noida";
    let area = "";
    let state = "";
    let pincode = "";
    let lat = "";
    let lon = "";
    let displayName = "";

    if (typeof loc === "string") {
      city = loc;
      displayName = loc;
    } else {
      city = loc.city || loc.displayName || "Greater Noida";
      area = loc.area || "";
      state = loc.state || "";
      pincode = loc.pincode || "";
      lat = loc.lat || "";
      lon = loc.lon || "";
      displayName = loc.displayName || city;
    }

    localStorage.setItem("roomswallah_user_city", city);
    localStorage.setItem("roomswallah_user_area", area);
    localStorage.setItem("roomswallah_user_state", state);
    localStorage.setItem("roomswallah_user_pincode", pincode);
    localStorage.setItem("roomswallah_user_lat", lat);
    localStorage.setItem("roomswallah_user_lon", lon);
    localStorage.setItem("roomswallah_user_display_name", displayName);
    localStorage.setItem("roomswallah_location_handled", "true");

    window.dispatchEvent(new Event("userCityUpdated"));
    setUserCity(city);
    setUserState(state);
    setUserPincode(pincode);
    setSearchQuery("");
    setShowLocationDrawer(false);

    router.push(`/?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}&state=${encodeURIComponent(state)}&pincode=${pincode}`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("roomswallah_user_city");
      if (savedCity) setUserCity(savedCity);
      const savedState = localStorage.getItem("roomswallah_user_state");
      if (savedState) setUserState(savedState || "");
      const savedPincode = localStorage.getItem("roomswallah_user_pincode");
      if (savedPincode) setUserPincode(savedPincode || "");

      const handleCityUpdate = () => {
        const updatedCity = localStorage.getItem("roomswallah_user_city");
        if (updatedCity) setUserCity(updatedCity);
        const updatedState = localStorage.getItem("roomswallah_user_state");
        if (updatedState) setUserState(updatedState || "");
        const updatedPincode = localStorage.getItem("roomswallah_user_pincode");
        if (updatedPincode) setUserPincode(updatedPincode || "");
      };

      const handleOpenLocationDrawer = () => {
        setShowLocationDrawer(true);
      };

      // Check if location permission is already allowed and auto-detect
      if (navigator.permissions && navigator.geolocation) {
        navigator.permissions.query({ name: "geolocation" as PermissionName }).then((result) => {
          if (result.state === "granted") {
            detectLocation();
          }
        });
      }

      window.addEventListener("userCityUpdated", handleCityUpdate);
      window.addEventListener("storage", handleCityUpdate);
      window.addEventListener("openLocationDrawer", handleOpenLocationDrawer);
      return () => {
        window.removeEventListener("userCityUpdated", handleCityUpdate);
        window.removeEventListener("storage", handleCityUpdate);
        window.removeEventListener("openLocationDrawer", handleOpenLocationDrawer);
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateSavedState = () => {
      if (typeof window !== "undefined") {
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
          console.error("Error parsing saved listings in navbar:", err);
        }
        setSavedCount(saved.length);
        setIsSavedActive(window.location.search.includes("saved=true") && pathname === "/rooms");
      }
    };

    updateSavedState();

    window.addEventListener("storage", updateSavedState);
    window.addEventListener("savedListingsUpdated", updateSavedState);

    return () => {
      window.removeEventListener("storage", updateSavedState);
      window.removeEventListener("savedListingsUpdated", updateSavedState);
    };
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/rooms" },
    { name: "PG", href: "/pg" },
    { name: "Hostel", href: "/hostels" },
    { name: "Flats", href: "/flats" },
  ];

  interface DrawerItem {
    name: string;
    subtext: string;
    href: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    bgColor: string;
    hasArrow?: boolean;
    badge?: string | number;
  }

  const drawerItems: DrawerItem[] = [
    {
      name: "Home",
      subtext: "Explore rooms",
      href: "/",
      icon: Home,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Rooms",
      subtext: "Find rooms for rent",
      href: "/rooms",
      icon: Bed,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      hasArrow: true,
    },
    {
      name: "PG",
      subtext: "PG for boys & girls",
      href: "/pg",
      icon: Building,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
      hasArrow: true,
    },
    {
      name: "Hostel",
      subtext: "Hostels near you",
      href: "/hostels",
      icon: Building2,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      hasArrow: true,
    },
    {
      name: "Flats",
      subtext: "Flats for rent",
      href: "/flats",
      icon: Building,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hasArrow: true,
    },
    {
      name: "Saved Properties",
      subtext: "Your favorite properties",
      href: "/rooms?saved=true",
      icon: Heart,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      hasArrow: true,
    },

    {
      name: "Featured Rooms",
      subtext: "Handpicked listings",
      href: "/rooms?featured=true",
      icon: Star,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      hasArrow: true,
    },
    {
      name: "About Us",
      subtext: "Know more about us",
      href: "/about",
      icon: Info,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      hasArrow: true,
    },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-in-out flex flex-col justify-center h-auto py-2.5 md:py-0 md:h-28 bg-white/95 backdrop-blur-[16px] border-b border-[#ECECEC]/60 ${
          isScrolled ? "shadow-[0px_10px_30px_rgba(0,0,0,0.04)]" : ""
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Desktop View Layout */}
          <div className="hidden md:flex flex-col w-full py-2">
            {/* Top Row: Logo, Location, Search, Saved, List CTA */}
            <div className="flex items-center justify-between w-full h-16 gap-3 lg:gap-6">
              
              {/* Left Logo */}
              <Link href="/" className="flex items-center space-x-2 group text-left shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white shadow-md shadow-[#6C4CF1]/20 group-hover:scale-105 transition-transform duration-300">
                  <Home className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-poppins font-black text-xl tracking-tight text-[#1E2235]">
                  Rooms<span className="text-[#6C4CF1]">Wallah</span>
                </span>
              </Link>

              {/* Location Selector (Premium soft shadow & border - Responsive width to prevent overlap) */}
              <div 
                onClick={() => setShowLocationDrawer(true)} 
                className="flex items-center space-x-2 text-[#1E2235] cursor-pointer bg-[#F8FAFC]/75 hover:bg-white border border-[#ECECEC] hover:border-[#6C4CF1]/20 hover:shadow-soft px-3.5 h-12 rounded-xl transition-all duration-300 w-[180px] lg:w-[240px] shrink-0"
              >
                <span className="text-[13.5px] font-normal font-poppins truncate flex-grow text-left">
                  {userState ? `${userCity}, ${userState}` : userCity}
                </span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] rotate-90 shrink-0" />
              </div>

              {/* Search Bar Input (Polished with regular weight text and responsive width) */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowLocationDrawer(true);
                }}
                onClick={() => setShowLocationDrawer(true)}
                className="relative flex items-center bg-[#F8FAFC]/75 hover:bg-white border border-[#ECECEC] rounded-xl h-12 pl-3 pr-1.5 flex-grow max-w-[600px] mx-4 transition-all duration-300 hover:shadow-soft focus-within:border-[#6C4CF1]/40 focus-within:shadow-[0px_4px_16px_rgba(108,76,241,0.06)] focus-within:bg-white cursor-pointer"
              >
                <div className="bg-transparent text-[13.5px] font-normal text-[#94A3B8] outline-none flex-grow border-none p-0 z-10 text-left select-none">
                  {searchVal ? `"${searchVal}" in ${userCity}` : `Search "${searchKeywords[currentWordIndex]}" in ${userCity}`}
                </div>

                <button 
                  type="submit"
                  className="w-9 h-9 bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] hover:shadow-md hover:shadow-[#6C4CF1]/15 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shrink-0 z-10"
                >
                  <Search className="w-4.5 h-4.5 text-white stroke-[2.5]" />
                </button>
              </form>

              {/* Right Side Actions: Saved & Sell Button */}
              <div className="flex items-center space-x-5 lg:space-x-6 shrink-0">
                {/* Wishlist/Saved Button */}
                <Link
                  href="/rooms?saved=true"
                  className="relative flex flex-col items-center justify-center text-[#1E2235] group select-none shrink-0"
                  title="Saved Properties"
                >
                  <Heart className={`w-6 h-6 ${isSavedActive ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 font-poppins text-[#1E2235]/70 group-hover:text-[#6C4CF1]">Saved</span>
                  {savedCount > 0 && (
                    <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {savedCount}
                    </span>
                  )}
                </Link>

                {isHostLoggedIn ? (
                  <>
                    {/* Host Dashboard Link (Styled like OLX) */}
                    <Link
                      href="/welcome/dashboard"
                      className="relative flex flex-col items-center justify-center text-[#1E2235] hover:text-[#6C4CF1] group select-none shrink-0"
                      title="Host Dashboard"
                    >
                      <User className="w-6 h-6 text-[#1E2235] group-hover:text-[#6C4CF1] stroke-[1.5]" />
                      <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 font-poppins text-[#1E2235]/70 group-hover:text-[#6C4CF1]">
                        Dashboard
                      </span>
                    </Link>

                    {/* Sell/List Room Capsule Button */}
                    <Link
                      href="/welcome/dashboard"
                      className="relative inline-flex items-center justify-center px-5 h-10 rounded-full font-poppins font-black text-xs uppercase tracking-wider text-[#1E2235] bg-white border-[5px] border-transparent bg-clip-padding before:absolute before:inset-0 before:-m-[5px] before:rounded-full before:bg-gradient-to-r before:from-[#FACC15] before:via-[#00A86B] before:to-[#6C4CF1] before:-z-10 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-[#000]/5 shrink-0"
                    >
                      <span className="mr-1 text-base font-bold">+ List Room</span>
                    </Link>
                  </>
                ) : isUserLoggedIn ? (
                  <>
                    {/* Tenant Profile Link */}
                    <Link
                      href="/welcome/user-dashboard"
                      className="relative flex flex-col items-center justify-center text-[#1E2235] hover:text-[#6C4CF1] group select-none shrink-0"
                      title="User Profile"
                    >
                      <span className="text-2xl leading-none select-none filter drop-shadow-xs shrink-0 mb-0.5">
                        {userAvatar}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 font-poppins text-[#1E2235]/70 group-hover:text-[#6C4CF1]">
                        Profile
                      </span>
                    </Link>

                    {/* Sell/List Room Capsule Button */}
                    <button
                      onClick={() => alert("Only Owners can list rooms. Please logout and login/register as an Owner to list your properties.")}
                      className="relative inline-flex items-center justify-center px-5 h-10 rounded-full font-poppins font-black text-xs uppercase tracking-wider text-[#1E2235] bg-white border-[5px] border-transparent bg-clip-padding before:absolute before:inset-0 before:-m-[5px] before:rounded-full before:bg-gradient-to-r before:from-[#FACC15] before:via-[#00A86B] before:to-[#6C4CF1] before:-z-10 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-[#000]/5 shrink-0 cursor-pointer"
                    >
                      <span className="mr-1 text-base font-bold">+ List Room</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login Link (Styled like OLX) */}
                    <Link
                      href="/welcome"
                      className="relative flex flex-col items-center justify-center text-[#1E2235] hover:text-[#6C4CF1] group select-none shrink-0"
                      title="Owner/User Login"
                    >
                      <User className="w-6 h-6 text-[#1E2235] group-hover:text-[#6C4CF1] stroke-[1.5]" />
                      <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 font-poppins text-[#1E2235]/70 group-hover:text-[#6C4CF1]">
                        Login
                      </span>
                    </Link>

                    {/* Sell/List Room Capsule Button */}
                    <Link
                      href="/welcome"
                      className="relative inline-flex items-center justify-center px-5 h-10 rounded-full font-poppins font-black text-xs uppercase tracking-wider text-[#1E2235] bg-white border-[5px] border-transparent bg-clip-padding before:absolute before:inset-0 before:-m-[5px] before:rounded-full before:bg-gradient-to-r before:from-[#FACC15] before:via-[#00A86B] before:to-[#6C4CF1] before:-z-10 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-[#000]/5 shrink-0"
                    >
                      <span className="mr-1 text-base font-bold">+ List Room</span>
                    </Link>
                  </>
                )}
              </div>

            </div>

            {/* Bottom Row: Categories bar */}
            <div className="w-full h-11 border-t border-[#F0F2F5]/80 flex items-center justify-start bg-white/50 gap-4 mt-1">
              <span className="text-xs font-black text-[#1E2235]/90 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:text-[#6C4CF1] shrink-0">
                <Menu className="w-4 h-4 text-[#1E2235]/80" />
                All Categories
              </span>
              <div className="h-4 w-[1px] bg-[#ECECEC] shrink-0" />
              <nav className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.name === "Home" && pathname === "/");
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-normal px-4 py-1 rounded-full border transition-all whitespace-nowrap ${
                        isActive 
                          ? "bg-[#6C4CF1]/10 border-[#6C4CF1]/30 text-[#6C4CF1] font-medium" 
                          : "bg-white border-[#ECECEC] text-[#1E2235] hover:bg-[#F8FAFC] hover:border-slate-300"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <Link 
                  href="/rooms" 
                  className="text-sm font-normal px-4 py-1 rounded-full border bg-white border-[#ECECEC] text-[#1E2235] hover:bg-[#F8FAFC] hover:border-slate-300 transition-all whitespace-nowrap"
                >
                  Roommates
                </Link>
                <Link 
                  href="/rooms" 
                  className="text-sm font-normal px-4 py-1 rounded-full border bg-white border-[#ECECEC] text-[#1E2235] hover:bg-[#F8FAFC] hover:border-slate-300 transition-all whitespace-nowrap"
                >
                  Room Wanted
                </Link>
              </nav>
            </div>
          </div>

          {/* Mobile View Layout (Exactly like screenshot) */}
          <div className="flex md:hidden flex-col w-full py-1 gap-2.5">
            {/* Top Row: Logo, Location & Menu */}
            <div className="flex items-start justify-between w-full px-1">
              {/* Left: Logo and Location selector below it */}
              <div className="flex flex-col items-start gap-1">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-1.5 text-left group">
                  <div className="w-7 h-7 rounded-lg bg-[#6C4CF1] flex items-center justify-center text-white shadow-sm shadow-[#6C4CF1]/20">
                    <Home className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <span className="font-poppins font-black text-lg tracking-tight text-[#1E2235]">
                    Rooms<span className="text-[#6C4CF1]">Wallah</span>
                  </span>
                </Link>

                {/* Location selector */}
                <div onClick={() => setShowLocationDrawer(true)} className="flex items-center space-x-1 text-[#1E2235]/90 cursor-pointer">
                  <span className="text-xs font-semibold font-poppins">
                    {userState ? `${userCity}, ${userState}` : userCity}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#1E2235]/60 rotate-90" />
                </div>
              </div>

              {/* Right: Hamburger Menu */}
              <button
                onClick={() => setIsOpen(true)}
                className="p-1 rounded-lg text-[#1E2235] active:scale-95 transition-all cursor-pointer"
                aria-label="Toggle Menu"
              >
                <Menu className="w-6 h-6 text-[#1E2235] stroke-[2.5]" />
              </button>
            </div>

            {/* Bottom Row: Search Bar & Wishlist */}
            <div className="flex items-center gap-3 w-full px-1">
              {/* Mobile Search Card */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowLocationDrawer(true);
                }}
                onClick={() => setShowLocationDrawer(true)}
                className="relative flex items-center bg-white border border-black rounded-[4px] flex-grow h-11 px-3 shadow-xs cursor-pointer"
              >
                <Search className="w-4.5 h-4.5 text-black shrink-0" />
                <div className="bg-transparent text-sm font-normal text-black/60 outline-none ml-2 flex-grow border-none p-0 text-left select-none">
                  {searchVal ? `"${searchVal}" in ${userCity}` : `Search "${searchKeywords[currentWordIndex]}"`}
                </div>
              </form>

              {/* Wishlist/Saved Icon (Heart outline, black color) */}
              <Link
                href="/rooms?saved=true"
                className="relative flex items-center justify-center text-black cursor-pointer select-none shrink-0"
                title="Saved Properties"
              >
                <Heart className={`w-6 h-6 ${isSavedActive ? "fill-black text-black" : "text-black"}`} strokeWidth={1.5} />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                    {savedCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer (Reference 3 inspired) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 w-[85vw] sm:w-[320px] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-hidden rounded-l-[32px]"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 shrink-0">
                  <div className="w-8.5 h-8.5 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                    <Home className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-poppins font-black text-lg tracking-tight text-[#1E2235]">
                    Rooms<span className="text-[#6C4CF1]">Wallah</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 active:scale-90 transition-all border border-border flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              {/* Navigation Links with subtext and styled icons (Matching Image 3) */}
              <div className="flex-1 py-4 px-4 overflow-y-auto space-y-1 no-scrollbar">
                {(() => {
                  const dynamicDrawerItems = [...drawerItems];
                  if (isUserLoggedIn) {
                    dynamicDrawerItems.push({
                      name: "User Profile",
                      subtext: "View saved & reported listings",
                      href: "/welcome/user-dashboard",
                      icon: User,
                      iconColor: "text-rose-600",
                      bgColor: "bg-rose-50",
                      hasArrow: true,
                    });
                  }
                  return dynamicDrawerItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                          isActive
                            ? "bg-primary-light/50 text-primary font-bold"
                            : "text-foreground hover:bg-black/5"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bgColor} ${item.iconColor}`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                              {item.name}
                              {item.badge && (
                                <span className="bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] text-muted font-semibold mt-0.5">
                              {item.subtext}
                            </span>
                          </div>
                        </div>
                        {item.hasArrow && <ChevronRight className="w-4 h-4 text-muted/60" />}
                      </Link>
                    );
                  });
                })()}
              </div>

              {/* Bottom Action Box & Skyline Graphic */}
              <div className="p-4 border-t border-border bg-[#F5F3FF]/70 relative flex flex-col justify-between overflow-hidden min-h-[140px]">
                {/* City skyline illustration at the very bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-10 opacity-30 pointer-events-none z-0">
                  <svg className="w-full h-full text-primary" viewBox="0 0 300 40" fill="currentColor">
                    <rect x="10" y="20" width="12" height="20" />
                    <rect x="25" y="10" width="16" height="30" />
                    <rect x="45" y="25" width="10" height="15" />
                    <rect x="58" y="15" width="14" height="25" />
                    <rect x="75" y="28" width="8" height="12" />
                    <rect x="85" y="22" width="12" height="18" />
                    <rect x="100" y="5" width="18" height="35" />
                    <rect x="122" y="25" width="10" height="15" />
                    <rect x="135" y="18" width="15" height="22" />
                    <rect x="155" y="28" width="8" height="12" />
                    <rect x="165" y="22" width="12" height="18" />
                    <rect x="180" y="12" width="16" height="28" />
                    <rect x="200" y="25" width="10" height="15" />
                    <rect x="212" y="18" width="14" height="22" />
                    <rect x="230" y="8" width="18" height="32" />
                    <rect x="252" y="22" width="10" height="18" />
                    <rect x="265" y="15" width="12" height="25" />
                    <rect x="280" y="28" width="8" height="12" />
                  </svg>
                </div>

                {/* List Your Room Card */}
                <Link
                  href={isHostLoggedIn ? "/welcome/dashboard" : isUserLoggedIn ? "/welcome/user-dashboard" : "/welcome"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border/80 shadow-soft hover:shadow-md transition-all relative z-10 w-full text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-foreground">
                      {isHostLoggedIn ? "Host Dashboard" : isUserLoggedIn ? "User Profile Dashboard" : "List Your Room"}
                    </span>
                    <span className="text-[9px] text-muted font-medium mt-0.5 max-w-[150px]">
                      {isHostLoggedIn ? "Manage listings & profile panel" : isUserLoggedIn ? "View saved properties & reports" : "Reach thousands of students and tenants"}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white active:scale-95 transition-all">
                    <Plus className="w-4.5 h-4.5" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Custom full-screen Location selection drawer overlay (matches OLX style) */}
      <AnimatePresence>
        {showLocationDrawer && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-[100000] bg-[#F8FAFC] flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center space-x-4 px-4 py-4 bg-white border-b border-[#F0F2F5] shadow-xs shrink-0 text-left">
              <button 
                onClick={() => setShowLocationDrawer(false)}
                className="p-1 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-[#1E2235] cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 text-[#1E2235]" />
              </button>
              <h2 className="font-poppins font-black text-base text-[#1E2235] tracking-wide uppercase">
                Location
              </h2>
            </div>
            {/* Search Input Box */}
            <div className="p-4 bg-white border-b border-[#F0F2F5]/60 shrink-0 text-left space-y-3.5">
              {/* Box 1: Location Input Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location (City/Area)</label>
                <div className="relative flex items-center bg-white border border-black rounded-[4px] h-12 px-3 shadow-xs focus-within:border-black focus-within:border-2 transition-all">
                  <MapPin className="w-5 h-5 text-[#6C4CF1] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search city, area or locality"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm font-normal text-[#1E2235] outline-none ml-2.5 flex-grow placeholder:text-[#94A3B8] border-none p-0 focus:ring-0 focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Box 2: Search Input Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Find Rooms, PG, Hostels, Flats</label>
                <div className="relative flex items-center bg-white border border-black rounded-[4px] h-12 px-3 shadow-xs focus-within:border-black focus-within:border-2 transition-all">
                  <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
                  <input
                    type="text"
                    placeholder="Type what you are looking for..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="bg-transparent text-sm font-normal text-[#1E2235] outline-none ml-2.5 flex-grow placeholder:text-[#94A3B8] border-none p-0 focus:ring-0 focus:outline-none"
                  />
                  {searchVal && (
                    <button 
                      onClick={() => setSearchVal("")}
                      className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Search submit button */}
              <button
                type="button"
                onClick={() => {
                  const targetCity = searchQuery.trim() || userCity;
                  router.push(`/rooms?city=${encodeURIComponent(targetCity)}&search=${encodeURIComponent(searchVal.trim())}`);
                  setShowLocationDrawer(false);
                }}
                className="w-full bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-xs font-bold py-2.5 rounded-[4px] uppercase tracking-wider shadow-sm transition-all text-center active:scale-98 cursor-pointer mt-1"
              >
                Search Properties
              </button>
            </div>

            {/* Scrollable Body list */}
            <div className="flex-grow overflow-y-auto pb-8">
              
              {/* If searchQuery is entered, render suggestions */}
              {searchQuery.trim() ? (
                <div className="flex flex-col">
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : locationSuggestions.length > 0 ? (
                    locationSuggestions.map((sug, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectLocation(sug)}
                        className="flex items-center space-x-3.5 px-5 py-4 bg-white hover:bg-slate-50 cursor-pointer border-b border-[#F0F2F5]/40 text-left"
                      >
                        <MapPin className="w-5 h-5 text-neutral-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[14.5px] font-semibold text-[#1E2235] font-poppins">{sug.displayName}</span>
                          <span className="text-[10px] text-[#94A3B8] font-medium mt-0.5">
                            City: {sug.city} {sug.pincode ? `| Pincode: ${sug.pincode}` : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div 
                      onClick={() => handleSelectLocation(searchQuery.trim())}
                      className="flex items-center space-x-3.5 px-5 py-4 bg-white hover:bg-slate-50 cursor-pointer border-b border-[#F0F2F5]/40 text-left"
                    >
                      <MapPin className="w-5 h-5 text-[#0A58CA] shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#0A58CA] font-poppins">Select "{searchQuery.trim()}"</span>
                        <span className="text-[10px] text-[#94A3B8] font-medium mt-0.5">Use custom location name</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Use current location GPS */}
                  <div 
                    onClick={detectLocation}
                    className="flex items-center space-x-3.5 px-5 py-4 bg-white cursor-pointer active:bg-slate-50 border-b border-[#F0F2F5]/40 text-left"
                  >
                    {loadingLocation ? (
                      <div className="w-5.5 h-5.5 border-2 border-[#0A58CA] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <Locate className="w-5.5 h-5.5 text-[#0A58CA] shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#0A58CA] font-poppins">
                        {loadingLocation ? "Locating..." : "Use current location"}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">
                        {loadingLocation ? "Detecting location coordinates" : "Detect automatically via GPS"}
                      </span>
                    </div>
                  </div>

                  {/* POPULAR LOCATIONS */}
                  <div className="flex flex-col">
                    <h3 className="text-[10px] sm:text-[11px] text-[#94A3B8] font-black uppercase tracking-wider px-5 pt-5 pb-2 text-left bg-[#F8FAFC]">
                      Popular Locations
                    </h3>
                    {[
                      { displayName: "Greater Noida, Uttar Pradesh", city: "Greater Noida", state: "Uttar Pradesh" },
                      { displayName: "Patna, Bihar", city: "Patna", state: "Bihar" },
                      { displayName: "Delhi, India", city: "Delhi", state: "Delhi" },
                      { displayName: "Noida, Uttar Pradesh", city: "Noida", state: "Uttar Pradesh" }
                    ].map((loc, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectLocation(loc)}
                        className="flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer border-b border-[#F0F2F5]/40 text-left"
                      >
                        <MapPin className="w-4.5 h-4.5 text-[#94A3B8] shrink-0" />
                        <span className="text-[13.5px] font-bold text-[#1E2235]">{loc.displayName}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
