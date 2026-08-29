"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getApiUrl, getImageUrl } from "@/data/api";
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
  User,
  Clock
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
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editLine1, setEditLine1] = useState("");
  const [editLine2, setEditLine2] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLine1, setNewLine1] = useState("");
  const [newLine2, setNewLine2] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newState, setNewState] = useState("");
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);


  const addRecentSearch = (term: string) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 5);
      if (typeof window !== "undefined") {
        localStorage.setItem("roomswallah_recent_searches", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("roomswallah_recent_searches");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHostLoggedIn(localStorage.getItem("owner_logged_in") === "true");
      setHostName(localStorage.getItem("owner_name") || "Host");
      setIsUserLoggedIn(localStorage.getItem("user_logged_in") === "true");
      setUserName(localStorage.getItem("user_name") || "User");
      setUserAvatar(localStorage.getItem("user_avatar") || "🦊");

      // Load recent searches
      const saved = localStorage.getItem("roomswallah_recent_searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {}
      }

      // Load saved addresses
      const savedAddrs = localStorage.getItem("roomswallah_user_addresses");
      if (savedAddrs) {
        try {
          setAddresses(JSON.parse(savedAddrs));
        } catch (e) {}
      } else {
        const initialAddresses = [
          {
            id: "addr-1",
            label: "Home",
            selected: true,
            distance: "2.5 km",
            icon: "Home",
            addressLine1: "Flat 402, Building C, Sector 62,",
            addressLine2: "Noida, Uttar Pradesh 201301",
            city: "Noida",
            area: "Sector 62",
            state: "Uttar Pradesh"
          },
          {
            id: "addr-2",
            label: "Office",
            selected: false,
            distance: "8.1 km",
            icon: "MapPin",
            addressLine1: "Tower B, Cyber City, Sector 62,",
            addressLine2: "Noida, Uttar Pradesh 201301",
            city: "Noida",
            area: "Sector 62",
            state: "Uttar Pradesh"
          }
        ];
        setAddresses(initialAddresses);
        localStorage.setItem("roomswallah_user_addresses", JSON.stringify(initialAddresses));
      }
    }
  }, []);

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(item => item.id !== id);
    setAddresses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("roomswallah_user_addresses", JSON.stringify(updated));
    }
    setActiveDropdownId(null);
  };

  const handleEditAddress = (id: string) => {
    const item = addresses.find(addr => addr.id === id);
    if (item) {
      setEditingAddressId(id);
      setEditLabel(item.label);
      setEditLine1(item.addressLine1);
      setEditLine2(item.addressLine2);
    }
    setActiveDropdownId(null);
  };

  const saveEditedAddress = (id: string) => {
    const updated = addresses.map(item => {
      if (item.id === id) {
        return {
          ...item,
          label: editLabel,
          addressLine1: editLine1,
          addressLine2: editLine2
        };
      }
      return item;
    });
    setAddresses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("roomswallah_user_addresses", JSON.stringify(updated));
    }
    setEditingAddressId(null);
  };

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
          
          if (!res.ok) {
            throw new Error("Reverse geocoding response error");
          }
          
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

          // Save current location into saved addresses list
          const currentAddr = {
            id: "addr-" + Date.now(),
            label: "Current Location",
            selected: true,
            distance: "0.0 km",
            icon: "MapPin",
            addressLine1: matchedArea || matchedCity,
            addressLine2: `${matchedCity}, ${matchedState} ${matchedPincode}`,
            city: matchedCity,
            area: matchedArea || matchedCity,
            state: matchedState
          };

          setAddresses((prev) => {
            const updated = prev.map(addr => ({ ...addr, selected: false }));
            const finalAddresses = [currentAddr, ...updated];
            localStorage.setItem("roomswallah_user_addresses", JSON.stringify(finalAddresses));
            return finalAddresses;
          });

          window.dispatchEvent(new Event("userCityUpdated"));
          setUserCity(matchedCity);
          setUserState(matchedState);
          setUserPincode(matchedPincode);
          setShowLocationDrawer(false);
          setShowSearchDrawer(false);

          router.push(`/?city=${encodeURIComponent(matchedCity)}&area=${encodeURIComponent(matchedArea)}&state=${encodeURIComponent(matchedState)}&pincode=${matchedPincode}`);
        } catch (err) {
          console.error("Error geocoding location:", err);
          alert("Unable to detect your current location. Please try again or search manually.");
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        let errorMsg = "Unable to detect your current location. Please try again or search manually.";
        
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location permission was denied. Please allow location access in your browser settings or search for your location manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "Unable to detect your current location. Please try again or search manually.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "Location detection timed out. Please try again.";
        }
        
        alert(errorMsg);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
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
    setShowSearchDrawer(false);

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
                <span className="relative inline-flex items-center font-poppins font-black text-xl tracking-tight select-none">
                  <span className="relative inline-block text-[#1E2235]">
                    R
                    <svg 
                      className="absolute -bottom-[1px] left-[1px] w-[2.2em] h-[0.4em] text-[#1E2235]" 
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
                  <span className="text-[#6C4CF1]">Wallah</span>
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
              <div 
                onClick={() => setShowSearchDrawer(true)}
                className="relative flex items-center bg-[#F8FAFC]/75 hover:bg-white border border-[#ECECEC] rounded-xl h-12 pl-3 pr-1.5 flex-grow max-w-[600px] mx-4 transition-all duration-300 hover:shadow-soft cursor-pointer"
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
              </div>

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
                  <span className="relative inline-flex items-center font-poppins font-black text-lg tracking-tight select-none">
                    <span className="relative inline-block text-[#1E2235]">
                      R
                      <svg 
                        className="absolute -bottom-[1px] left-[1px] w-[2.2em] h-[0.4em] text-[#1E2235]" 
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
                    <span className="text-[#6C4CF1]">Wallah</span>
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
              <div 
                onClick={() => setShowSearchDrawer(true)}
                className="relative flex items-center bg-white border border-black rounded-[4px] flex-grow h-11 px-3 shadow-xs cursor-pointer animate-fadeIn"
              >
                <Search className="w-4.5 h-4.5 text-black shrink-0" />
                <div className="bg-transparent text-sm font-normal text-black/60 outline-none ml-2 flex-grow border-none p-0 text-left select-none">
                  {searchVal ? `"${searchVal}" in ${userCity}` : `Search "${searchKeywords[currentWordIndex]}"`}
                </div>
              </div>

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
          <motion.div
            key="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
          />
        )}

        {isOpen && (
          <motion.div
            key="menu-drawer"
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
                <span className="relative inline-flex items-center font-poppins font-black text-lg tracking-tight select-none">
                  <span className="relative inline-block text-[#1E2235]">
                    R
                    <svg 
                      className="absolute -bottom-[1px] left-[1px] w-[2.2em] h-[0.4em] text-[#1E2235]" 
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
                  <span className="text-[#6C4CF1]">Wallah</span>
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
        )}
      </AnimatePresence>
      {/* Select Your Location Drawer */}
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
            <div className="flex items-center space-x-4 px-4 py-4 bg-white border-b border-[#F0F2F5]/80 shrink-0 text-left">
              <button 
                onClick={() => setShowLocationDrawer(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-800 cursor-pointer"
              >
                <ArrowLeft className="w-5.5 h-5.5" />
              </button>
              <h2 className="font-poppins font-bold text-lg text-slate-800">
                Select Your Location
              </h2>
            </div>

            {/* Scrollable Body */}
            <div className="flex-grow overflow-y-auto bg-slate-50/50 p-4 space-y-4">
              
              {/* Search bar input */}
              <div className="relative flex items-center bg-white border border-[#E2E8F0] rounded-2xl h-12 px-4.5 shadow-sm focus-within:border-[#6C4CF1]/40 focus-within:shadow-[0px_4px_16px_rgba(108,76,241,0.04)] transition-all">
                <input
                  type="text"
                  placeholder="Search an area or address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm font-normal text-slate-800 outline-none flex-grow placeholder:text-[#94A3B8] border-none p-0 focus:ring-0 focus:outline-none"
                />
                <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
              </div>

              {/* Location suggestions (if search query is typed) */}
              {searchQuery.trim() ? (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-[#6C4CF1] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : locationSuggestions.length > 0 ? (
                    locationSuggestions.map((sug, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectLocation(sug)}
                        className="flex items-center space-x-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer text-left transition-colors"
                      >
                        <MapPin className="w-4.5 h-4.5 text-[#6C4CF1] shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-800 truncate">{sug.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            City: {sug.city} {sug.pincode ? `| Pin: ${sug.pincode}` : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div 
                      onClick={() => handleSelectLocation(searchQuery.trim())}
                      className="flex items-center space-x-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer text-left transition-colors text-[#6C4CF1]"
                    >
                      <MapPin className="w-4.5 h-4.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Select "{searchQuery.trim()}"</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Use typed custom location</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Two Buttons Side by Side */}
                  <div className="grid grid-cols-2 gap-3 shrink-0 animate-fadeIn">
                    <button
                      onClick={detectLocation}
                      disabled={loadingLocation}
                      className="flex items-center justify-center space-x-2 bg-white border border-[#E2E8F0] hover:border-[#6C4CF1]/20 hover:shadow-xs py-3 px-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 active:scale-95 transition-all cursor-pointer"
                    >
                      {loadingLocation ? (
                        <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <Locate className="w-4.5 h-4.5 text-[#10B981] shrink-0" />
                      )}
                      <span className="truncate">{loadingLocation ? "Detecting location..." : "Use Current Location"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAddForm(prev => !prev);
                      }}
                      className={`flex items-center justify-center space-x-2 border py-3 px-2 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer ${showAddForm ? 'bg-[#6C4CF1] border-[#6C4CF1] text-white' : 'bg-white border-[#E2E8F0] text-slate-700 hover:border-[#6C4CF1]/20'}`}
                    >
                      <Plus className={`w-4.5 h-4.5 shrink-0 ${showAddForm ? 'text-white' : 'text-[#10B981]'}`} />
                      <span className="truncate">Add New Address</span>
                    </button>
                  </div>

                  {/* Add New Address Form (State-driven inputs for all address components) */}
                  {showAddForm && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4.5 space-y-3.5 text-left shadow-soft animate-fadeIn">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">New Address Details</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          placeholder="Label (e.g. Work, Gym, Friend's Place)"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1]/40 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 1 (Flat/Building, Street)"
                          value={newLine1}
                          onChange={(e) => setNewLine1(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1]/40 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 2 (Locality, Sector, Landmark)"
                          value={newLine2}
                          onChange={(e) => setNewLine2(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1]/40 transition-all"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1]/40 transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Area"
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1]/40 transition-all"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6C4CF1]/40 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-1">
                        <button
                          onClick={() => {
                            if (!newLabel || !newCity) {
                              alert("Please enter at least Address Label and City.");
                              return;
                            }
                            const newAddr = {
                              id: "addr-" + Date.now(),
                              label: newLabel,
                              selected: true,
                              distance: "1.2 km",
                              icon: "MapPin",
                              addressLine1: newLine1,
                              addressLine2: newLine2,
                              city: newCity,
                              area: newArea || newCity,
                              state: newState || "Uttar Pradesh"
                            };

                            const updated = addresses.map(addr => ({ ...addr, selected: false }));
                            const finalAddresses = [newAddr, ...updated];
                            setAddresses(finalAddresses);
                            localStorage.setItem("roomswallah_user_addresses", JSON.stringify(finalAddresses));

                            // Select this new address as current location
                            localStorage.setItem("roomswallah_user_city", newAddr.city);
                            localStorage.setItem("roomswallah_user_state", newAddr.state);
                            localStorage.setItem("roomswallah_user_display_name", `${newAddr.area}, ${newAddr.city}`);
                            localStorage.setItem("roomswallah_location_handled", "true");
                            window.dispatchEvent(new Event("userCityUpdated"));
                            setUserCity(newAddr.city);
                            setUserState(newAddr.state);
                            setShowLocationDrawer(false);
                            
                            // Reset inputs
                            setNewLabel("");
                            setNewLine1("");
                            setNewLine2("");
                            setNewCity("");
                            setNewArea("");
                            setNewState("");
                            setShowAddForm(false);

                            router.push(`/?city=${encodeURIComponent(newAddr.city)}&area=${encodeURIComponent(newAddr.area)}&state=${encodeURIComponent(newAddr.state)}`);
                          }}
                          className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          Add Address
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SAVED ADDRESSES Title */}
                  <div className="text-left pt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                      SAVED ADDRESSES
                    </span>

                    {/* Address List */}
                    <div className="space-y-3">
                      {addresses.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs">
                          No saved addresses found.
                        </div>
                      ) : (
                        addresses.map((item, idx) => {
                          const ItemIcon = item.icon === "Home" ? Home : MapPin;
                          const isEditing = editingAddressId === item.id;
                          return (
                            <div 
                              key={item.id || idx}
                              onClick={() => {
                                if (isEditing) return; // Prevent selection click while editing
                                
                                // Mark this address as selected
                                const updated = addresses.map(addr => ({
                                  ...addr,
                                  selected: addr.id === item.id
                                }));
                                setAddresses(updated);
                                localStorage.setItem("roomswallah_user_addresses", JSON.stringify(updated));

                                localStorage.setItem("roomswallah_user_city", item.city);
                                localStorage.setItem("roomswallah_user_state", item.state);
                                localStorage.setItem("roomswallah_user_display_name", `${item.area}, ${item.city}`);
                                localStorage.setItem("roomswallah_location_handled", "true");
                                window.dispatchEvent(new Event("userCityUpdated"));
                                setUserCity(item.city);
                                setUserState(item.state);
                                setShowLocationDrawer(false);
                                router.push(`/?city=${encodeURIComponent(item.city)}&area=${encodeURIComponent(item.area)}&state=${encodeURIComponent(item.state)}`);
                              }}
                              className={`flex items-start space-x-3 p-4 bg-white border ${item.selected ? 'border-[#6C4CF1]/40 shadow-xs' : 'border-[#E2E8F0] hover:border-[#6C4CF1]/20'} hover:shadow-xs rounded-2xl cursor-pointer transition-all relative text-left`}
                            >
                              <div className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-xl p-2 shrink-0 w-12.5">
                                <ItemIcon className="w-4.5 h-4.5 text-slate-500" />
                                <span className="text-[9px] font-black text-slate-500 mt-1.5 truncate w-full text-center">
                                  {item.distance}
                                </span>
                              </div>

                              <div className="flex-grow min-w-0 pr-6 space-y-1">
                                {isEditing ? (
                                  <div className="space-y-2 mt-1 w-full" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={editLabel}
                                      onChange={(e) => setEditLabel(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C4CF1]"
                                      placeholder="Address Name (e.g. Home)"
                                    />
                                    <input
                                      type="text"
                                      value={editLine1}
                                      onChange={(e) => setEditLine1(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-600 focus:outline-none focus:border-[#6C4CF1]"
                                      placeholder="Address Line 1"
                                    />
                                    <input
                                      type="text"
                                      value={editLine2}
                                      onChange={(e) => setEditLine2(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-600 focus:outline-none focus:border-[#6C4CF1]"
                                      placeholder="Address Line 2"
                                    />
                                    <div className="flex space-x-2 pt-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          saveEditedAddress(item.id);
                                        }}
                                        className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-all active:scale-95"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setEditingAddressId(null);
                                        }}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all active:scale-95"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[13.5px] font-bold text-slate-800 font-poppins">{item.label}</span>
                                      {item.selected && (
                                        <span className="bg-[#E6F4EA] text-[#137333] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90 origin-left">
                                          SELECTED
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 leading-tight">
                                      {item.addressLine1}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400 leading-tight truncate">
                                      {item.addressLine2}
                                    </p>
                                  </>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="absolute top-4 right-3 z-30">
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveDropdownId(activeDropdownId === item.id ? null : item.id);
                                    }}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-90 transition-all cursor-pointer"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>

                                  {activeDropdownId === item.id && (
                                    <div className="absolute right-0 mt-1 w-24 bg-white border border-[#E2E8F0] rounded-lg shadow-md z-40 py-1 text-left">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleEditAddress(item.id);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors font-semibold"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDeleteAddress(item.id);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors font-semibold"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dedicated Search Drawer */}
      <AnimatePresence>
        {showSearchDrawer && (
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
                onClick={() => setShowSearchDrawer(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-[#1E2235] cursor-pointer"
              >
                <ArrowLeft className="w-5.5 h-5.5" />
              </button>
              <h2 className="font-poppins font-bold text-lg text-slate-800">
                Search
              </h2>
            </div>

            {/* Search Input Box */}
            <div className="p-4 bg-white border-b border-[#F0F2F5]/60 shrink-0 text-left space-y-3.5">
              {/* Box 1: Search Input Box (Find Rooms, PG, Flats) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Find Rooms, PG, Hostels, Flats</label>
                <div className="relative flex items-center bg-white border border-[#E2E8F0] rounded-xl h-12 px-4 shadow-sm focus-within:border-[#6C4CF1]/40 focus-within:shadow-[0px_4px_16px_rgba(108,76,241,0.04)] transition-all">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="bg-transparent text-sm font-normal text-slate-800 outline-none ml-3 flex-grow placeholder:text-[#94A3B8] border-none p-0 focus:ring-0 focus:outline-none"
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
                  const targetCity = userCity;
                  const targetSearch = searchVal.trim();

                  if (targetSearch) {
                    addRecentSearch(targetSearch);
                  }

                  router.push(`/rooms?city=${encodeURIComponent(targetCity)}&search=${encodeURIComponent(targetSearch)}`);
                  setShowSearchDrawer(false);
                }}
                className="w-full bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-xs font-bold py-2.5 rounded-[4px] uppercase tracking-wider shadow-sm transition-all text-center active:scale-98 cursor-pointer mt-1"
              >
                Search Properties
              </button>
            </div>

            {/* Recent Searches */}
            <div className="flex-grow overflow-y-auto pb-8 bg-slate-50/50">
              {recentSearches.length > 0 && (
                <div className="flex flex-col px-5 pt-4 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent searches</span>
                    <button 
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs font-bold text-[#0A58CA] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchVal(term);
                          const targetCity = userCity;
                          addRecentSearch(term);
                          router.push(`/rooms?city=${encodeURIComponent(targetCity)}&search=${encodeURIComponent(term)}`);
                          setShowSearchDrawer(false);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
