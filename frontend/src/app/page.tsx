"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  CircleDollarSign,
  ArrowRight,
  Home,
  CheckCircle,
  PhoneCall,
  Heart,
  Wifi,
  Utensils,
  Wind,
  Smartphone,
  Sparkles,
  ArrowRightLeft,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  GraduationCap,
  ClipboardList,
  Building2,
  Megaphone,
  ChevronRight,
  Navigation,
  X
} from "lucide-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Categories from "@/components/categories";
import { PropertyListing } from "@/data/listings";
import { getApiUrl, getImageUrl } from "@/data/api";


export default function HomeLayout() {
  const [propertyType, setPropertyType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("Greater Noida");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 15;
    setShowRightArrow(!isAtEnd);
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  const [promotions, setPromotions] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [allCitiesCount, setAllCitiesCount] = useState<number>(4);
  const [guideData, setGuideData] = useState<{
    title: string;
    description: string;
    videoUrl: string;
  } | null>(null);

  // Sync selectedCity with URL search params and localStorage Updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Sync from URL search params on mount
      const urlParams = new URLSearchParams(window.location.search);
      const urlCity = urlParams.get("city");
      if (urlCity) {
        localStorage.setItem("checkrooms_user_city", urlCity);
        const urlState = urlParams.get("state");
        if (urlState) localStorage.setItem("checkrooms_user_state", urlState);
        const urlArea = urlParams.get("area");
        if (urlArea) localStorage.setItem("checkrooms_user_area", urlArea);
        const urlPincode = urlParams.get("pincode");
        if (urlPincode) localStorage.setItem("checkrooms_user_pincode", urlPincode);
        setSelectedCity(urlCity);
      } else {
        // 2. Sync from localStorage if no URL params
        const savedCity = localStorage.getItem("checkrooms_user_city");
        if (savedCity) {
          setSelectedCity(savedCity);
        }
      }

      // 3. Listen to active city updates dispatched from navbar
      const handleCityChange = () => {
        const updatedCity = localStorage.getItem("checkrooms_user_city");
        if (updatedCity) {
          setSelectedCity(updatedCity);
        }
      };

      window.addEventListener("userCityUpdated", handleCityChange);
      return () => {
        window.removeEventListener("userCityUpdated", handleCityChange);
      };
    }
  }, []);

  useEffect(() => {
    const fetchPromotionsAndCities = async () => {
      try {
        const res = await fetch(getApiUrl("/api/promotions"));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPromotions(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch promotions from backend:", err);
      }

      try {
        // Fetch all listings to calculate unique cities count dynamically
        const resListings = await fetch(getApiUrl("/api/listings"));
        if (resListings.ok) {
          const dataListings = await resListings.json();
          if (Array.isArray(dataListings)) {
            const cities = dataListings.map((item: any) => item.city?.trim()).filter(Boolean);
            const uniqueCities = new Set(cities.map(c => c.toLowerCase()));
            if (uniqueCities.size > 0) {
              setAllCitiesCount(uniqueCities.size);
            }

            // Clean up saved listings: Filter out any saved IDs that do not exist in the database anymore!
            const allListingIds = new Set(dataListings.map((item: any) => item._id || item.id));
            const saved = JSON.parse(localStorage.getItem("saved_listings") || "[]");
            if (Array.isArray(saved) && saved.length > 0) {
              const cleaned = saved.filter((id: string) => allListingIds.has(id));
              if (cleaned.length !== saved.length) {
                localStorage.setItem("saved_listings", JSON.stringify(cleaned));
                setSavedIds(cleaned);
                window.dispatchEvent(new Event("savedListingsUpdated"));
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic city count:", err);
      }
    };
    fetchPromotionsAndCities();
  }, []);
  useEffect(() => {
    const fetchProperties = async () => {
      let apiListings: PropertyListing[] = [];
      try {
        const savedCity = localStorage.getItem("checkrooms_user_city") || "";
        const savedState = localStorage.getItem("checkrooms_user_state") || "";
        const savedPincode = localStorage.getItem("checkrooms_user_pincode") || "";
        const savedLat = localStorage.getItem("checkrooms_user_lat") || "";
        const savedLon = localStorage.getItem("checkrooms_user_lon") || "";

        let queryParams = [];
        if (savedCity && savedCity !== "India") {
          queryParams.push(`city=${encodeURIComponent(savedCity)}`);
        }
        if (savedState) {
          queryParams.push(`state=${encodeURIComponent(savedState)}`);
        }
        if (savedPincode) {
          queryParams.push(`pincode=${encodeURIComponent(savedPincode)}`);
        }
        if (savedLat) {
          queryParams.push(`lat=${savedLat}`);
        }
        if (savedLon) {
          queryParams.push(`lon=${savedLon}`);
        }
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

      // Filter localProps by selectedCity too
      if (selectedCity && selectedCity !== "India") {
        localProps = localProps.filter(p => 
          p.city?.trim().toLowerCase().includes(selectedCity.trim().toLowerCase())
        );
      }

      const apiIds = new Set(apiListings.map((p) => p.id));
      const combined = [
        ...apiListings, 
        ...localProps.filter((p) => !apiIds.has(p.id))
      ];
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
      window.addEventListener("checkroomsPropertiesUpdated", fetchProperties);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("checkroomsPropertiesUpdated", fetchProperties);
      }
    };
  }, [selectedCity]);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await fetch(getApiUrl("/api/admin/guide"));
        if (res.ok) {
          const data = await res.json();
          if (data && data.videoUrl) {
            setGuideData(data);
          }
        }
      } catch (e) {
        console.error("Error fetching guide settings on homepage:", e);
      }
    };
    fetchGuide();

    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("saved_listings") || "[]");
      const cleaned = Array.isArray(saved) ? saved.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id)) : [];
      if (cleaned.length !== saved.length) {
        localStorage.setItem("saved_listings", JSON.stringify(cleaned));
        setSavedIds(cleaned);
      } else {
        setSavedIds(saved);
      }
      
      const savedCity = localStorage.getItem("checkrooms_user_city");
      if (savedCity) {
        setSelectedCity(savedCity);
      }

      const handleCityChange = () => {
        const city = localStorage.getItem("checkrooms_user_city");
        if (city) {
          setSelectedCity(city);
        }
      };
      window.addEventListener("userCityUpdated", handleCityChange);
      window.addEventListener("storage", handleCityChange);
      return () => {
        window.removeEventListener("userCityUpdated", handleCityChange);
        window.removeEventListener("storage", handleCityChange);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handled = localStorage.getItem("checkrooms_location_handled");
    if (handled === "true") return;

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowLocationModal(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const detectLocation = () => {
    if (typeof window === "undefined") return;
    setLoadingLocation(true);

    const handleIPFallback = async (reason: string) => {
      console.warn(`Attempting IP-based location fallback due to: ${reason}`);
      try {
        const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
        if (!res.ok) {
          throw new Error("IP location service returned non-OK response");
        }
        const data = await res.json();
        const detectedCity = data.city || data.locality || "";
        
        let matchedCity = "Greater Noida";
        const cityLower = detectedCity.toLowerCase();
        if (cityLower.includes("greater noida")) {
          matchedCity = "Greater Noida";
        } else if (cityLower.includes("noida")) {
          matchedCity = "Noida";
        } else if (cityLower.includes("delhi") || cityLower.includes("new delhi")) {
          matchedCity = "Delhi";
        } else if (cityLower.includes("gurgaon") || cityLower.includes("gurugram")) {
          matchedCity = "Gurugram";
        } else if (detectedCity) {
          matchedCity = detectedCity;
        }

        const matchedArea = data.locality || data.city || "";
        const matchedState = data.principalSubdivision || "";
        const matchedPincode = data.postcode || "";
        const displayName = data.locality && data.city ? `${data.locality}, ${data.city}` : (data.city || matchedCity);
        const latitude = data.latitude || 28.4595;
        const longitude = data.longitude || 77.4984;

        localStorage.setItem("checkrooms_user_city", matchedCity);
        localStorage.setItem("checkrooms_user_area", matchedArea);
        localStorage.setItem("checkrooms_user_state", matchedState);
        localStorage.setItem("checkrooms_user_pincode", matchedPincode);
        localStorage.setItem("checkrooms_user_lat", String(latitude));
        localStorage.setItem("checkrooms_user_lon", String(longitude));
        localStorage.setItem("checkrooms_user_display_name", displayName);
        localStorage.setItem("checkrooms_location_handled", "true");

        window.dispatchEvent(new Event("userCityUpdated"));
        setShowLocationModal(false);
      } catch (err) {
        console.error("IP fallback also failed:", err);
        // If IP fallback also fails, set default to Greater Noida to keep app functional
        localStorage.setItem("checkrooms_user_city", "Greater Noida");
        localStorage.setItem("checkrooms_location_handled", "true");
        window.dispatchEvent(new Event("userCityUpdated"));
        setShowLocationModal(false);
      } finally {
        setLoadingLocation(false);
      }
    };

    if (!navigator.geolocation) {
      handleIPFallback("Geolocation API not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          let matchedCity = "Greater Noida";
          let matchedArea = "";
          let matchedState = "";
          let matchedPincode = "";
          let displayName = "";

          try {
            const res = await fetch(
              getApiUrl(`/api/location/reverse?lat=${latitude}&lon=${longitude}`)
            );
            
            if (!res.ok) {
              throw new Error("Reverse geocoding response error");
            }
            
            const data = await res.json();
            matchedCity = data.matchedCity || "Greater Noida";
            matchedArea = data.area || "";
            matchedState = data.state || "";
            matchedPincode = data.pincode || "";
            displayName = data.displayName || matchedCity;
          } catch (geocodeErr) {
            console.warn("Backend geocoding failed, falling back to client-side reverse geocoding:", geocodeErr);
            const fallbackRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (!fallbackRes.ok) {
              throw new Error("All reverse geocoding services failed");
            }
            const data = await fallbackRes.json();
            const detectedCity = data.city || data.locality || "";
            matchedCity = detectedCity;
            const cityLower = detectedCity.toLowerCase();
            if (cityLower.includes("greater noida")) {
              matchedCity = "Greater Noida";
            } else if (cityLower.includes("noida")) {
              matchedCity = "Noida";
            } else if (cityLower.includes("delhi") || cityLower.includes("new delhi")) {
              matchedCity = "Delhi";
            } else if (cityLower.includes("gurgaon") || cityLower.includes("gurugram")) {
              matchedCity = "Gurugram";
            } else if (detectedCity) {
              matchedCity = detectedCity;
            }

            matchedArea = data.locality || data.city || "";
            matchedState = data.principalSubdivision || "";
            matchedPincode = data.postcode || "";
            displayName = data.locality && data.city ? `${data.locality}, ${data.city}` : (data.city || matchedCity);
          }

          localStorage.setItem("checkrooms_user_city", matchedCity);
          localStorage.setItem("checkrooms_user_area", matchedArea);
          localStorage.setItem("checkrooms_user_state", matchedState);
          localStorage.setItem("checkrooms_user_pincode", matchedPincode);
          localStorage.setItem("checkrooms_user_lat", String(latitude));
          localStorage.setItem("checkrooms_user_lon", String(longitude));
          localStorage.setItem("checkrooms_user_display_name", displayName);
          localStorage.setItem("checkrooms_location_handled", "true");

          window.dispatchEvent(new Event("userCityUpdated"));
          setShowLocationModal(false);
        } catch (err) {
          console.error("Error geocoding location:", err);
          handleIPFallback("GPS geocoding failed");
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        handleIPFallback(`Geolocation API error: code ${err.code}, message ${err.message}`);
      }
    );
  };

  const handleOtherAddress = () => {
    localStorage.setItem("checkrooms_location_handled", "true");
    setShowLocationModal(false);
    window.dispatchEvent(new Event("openLocationDrawer"));
  };

  const handleCloseModal = () => {
    localStorage.setItem("checkrooms_location_handled", "true");
    setShowLocationModal(false);
  };

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

  const getCityCount = (cityName: string) => {
    return properties.filter(
      (p) => p.city?.trim().toLowerCase() === cityName.toLowerCase()
    ).length;
  };

  // Sort properties so that promoted ones always come first
  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      const aPromoted = promotedIds.has(a.id);
      const bPromoted = promotedIds.has(b.id);
      if (aPromoted && !bPromoted) return -1;
      if (!aPromoted && bPromoted) return 1;
      return 0;
    });
  }, [properties, promotedIds]);

  // Filter properties based on type selection, selected city, and search term, then slice to get top 8 matching ones
  const filteredFeatured = useMemo(() => {
    return sortedProperties
      .filter((prop: PropertyListing) => {
        // Type filter (room, pg, hostel, flat)
        if (propertyType !== "all" && prop.type !== propertyType) return false;
        
        // City filter
        if (selectedCity && selectedCity !== "India") {
          const propCity = (prop.city || "").trim().toLowerCase();
          const selCity = selectedCity.trim().toLowerCase();
          if (!propCity.includes(selCity) && !selCity.includes(propCity)) return false;
        }

        // Search text filter
        if (activeSearchTerm) {
          const term = activeSearchTerm.toLowerCase().trim();
          const matches = (
            prop.title.toLowerCase().includes(term) ||
            (prop.area || "").toLowerCase().includes(term) ||
            (prop.city || "").toLowerCase().includes(term) ||
            (prop.description || "").toLowerCase().includes(term)
          );
          if (!matches) return false;
        }

        return true;
      })
      .slice(0, 8);
  }, [sortedProperties, propertyType, selectedCity, activeSearchTerm]);

  // Filter properties based on type selection, selected city, and search term, without slicing
  const freshRecommendations = useMemo(() => {
    return sortedProperties
      .filter((prop: PropertyListing) => {
        // Type filter (room, pg, hostel, flat)
        if (propertyType !== "all" && prop.type !== propertyType) return false;
        
        // City filter
        if (selectedCity && selectedCity !== "India") {
          const propCity = (prop.city || "").trim().toLowerCase();
          const selCity = selectedCity.trim().toLowerCase();
          if (!propCity.includes(selCity) && !selCity.includes(propCity)) return false;
        }

        // Search text filter
        if (activeSearchTerm) {
          const term = activeSearchTerm.toLowerCase().trim();
          const matches = (
            prop.title.toLowerCase().includes(term) ||
            (prop.area || "").toLowerCase().includes(term) ||
            (prop.city || "").toLowerCase().includes(term) ||
            (prop.description || "").toLowerCase().includes(term)
          );
          if (!matches) return false;
        }

        return true;
      });
  }, [sortedProperties, propertyType, selectedCity, activeSearchTerm]);

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#F8F9FC] text-[#6B7280]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app"}#organization`,
                  "name": "CheckRooms",
                  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app",
                  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app"}/assets/logo.png`,
                  "description": "Find verified rooms, flats, PGs, and hostels with zero brokerage on CheckRooms.",
                  "email": "hello@checkrooms.com",
                  "sameAs": [
                    "https://instagram.com/checkrooms",
                    "https://facebook.com/checkrooms",
                    "https://linkedin.com/company/checkrooms",
                    "https://twitter.com/checkrooms"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app"}#website`,
                  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app",
                  "name": "CheckRooms",
                  "description": "Find rooms, flats, PGs and hostels near you with zero brokerage.",
                  "publisher": {
                    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app"}#organization`
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app"}/rooms?search={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
        <Hero />


        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-[36px] sm:py-[48px] md:py-[72px] space-y-[36px] sm:space-y-[48px] md:space-y-[72px]">
          {/* ========================================================================= */}
          {/* RELATED PROPERTIES SECTION (OLX STYLE ROW) */}
          {/* ========================================================================= */}
          <section className="max-w-[1280px] mx-auto text-left px-4 md:px-0">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-1.5">
                <h2 className="font-semibold text-lg md:text-xl text-[#1E2235]">
                  Related Properties
                </h2>
              </div>
              <Link
                href="/rooms?type=all"
                className="text-[11px] sm:text-xs font-bold text-[#6C4CF1] hover:text-[#5B3FE6] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Horizontal Scrollable Row */}
            {filteredFeatured.length > 0 ? (
              <div className="relative w-full">
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex overflow-x-auto gap-4 pb-4 scrollbar-none snap-x snap-mandatory"
                >
                  {filteredFeatured.map((prop: PropertyListing) => {
                    const isPromoted = promotedIds.has(prop.id);
                    const typePath = (prop.type || "room").toLowerCase();
                    const detailsUrl = `/${typePath === "room" ? "rooms" : typePath === "hostel" ? "hostels" : typePath === "flat" ? "flats" : "pg"}/${prop.id}`;
                    const isSaved = savedIds.includes(prop.id);
                    return (
                      <Link
                        key={prop.id}
                        href={detailsUrl}
                        className={`block w-[220px] sm:w-[250px] md:w-[280px] shrink-0 rounded-[20px] bg-white border border-[#ECECEC] shadow-sm hover:shadow-md hover:border-[#6C4CF1]/30 transition-all duration-300 overflow-hidden text-left snap-start group cursor-pointer relative hover:-translate-y-0.5 ${
                          isPromoted ? "ring-1 ring-amber-400" : ""
                        }`}
                      >
                        {/* Image Container */}
                        <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={getImageUrl(prop.image)}
                            alt={prop.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 40vw, 20vw"
                          />
                          
                          {/* Verified Badge */}
                          <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm">
                            <CheckCircle className="w-3 h-3 text-white" />
                            <span>Verified</span>
                          </div>

                          {/* Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleSaveProperty(prop.id, e)}
                            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center border shadow-xs cursor-pointer active:scale-90 transition-all z-20 backdrop-blur-xs ${
                              isSaved
                                ? "bg-red-50 border-red-100 text-red-500"
                                : "bg-white/90 border-black/10 text-neutral-500 hover:text-red-500"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                          </button>

                          {/* Rent overlay on image */}
                          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-left z-10 border border-white/10">
                            <span className="text-[9px] font-medium block text-white/80 leading-none">Rent</span>
                            <span className="text-sm sm:text-base font-bold font-poppins block mt-0.5 leading-none">
                              ₹{prop.rent.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-white/80">/{prop.type === "hostel" ? "yr" : "mo"}</span>
                            </span>
                          </div>

                          {isPromoted && (
                            <div className="absolute top-2.5 right-12 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
                              Featured
                            </div>
                          )}
                        </div>

                        {/* Info Content Box */}
                        <div className="p-3.5 flex-grow flex flex-col justify-between space-y-2 bg-white">
                          <div className="space-y-1">
                            {/* Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {prop.sharing && (
                                <span className="text-[10px] font-bold text-[#6C4CF1] bg-[#F0EDFF] px-2 py-0.5 rounded-md">
                                  {prop.sharing}
                                </span>
                              )}
                              {prop.furnishing && (
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {prop.furnishing}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-poppins font-bold text-sm sm:text-[15px] text-[#1E2235] group-hover:text-[#6C4CF1] transition-colors line-clamp-1 leading-snug pt-0.5">
                              {prop.title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center space-x-1 text-slate-500 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#6C4CF1] shrink-0" />
                              <span className="text-xs font-medium truncate">
                                {prop.area}, {prop.city}
                              </span>
                            </div>
                          </div>

                          {/* Send Now Button */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="w-full bg-[#6C4CF1] group-hover:bg-[#5B3FE6] text-white text-xs font-bold py-1.5 rounded-xl text-center transition-all shadow-sm flex items-center justify-center space-x-1">
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Floating Stationary Swipe/Scroll Right Indicator */}
                {showRightArrow && (
                  <button 
                    type="button"
                    onClick={scrollRight}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white flex items-center justify-center z-30 shadow-lg cursor-pointer active:scale-95 transition-all animate-bounce-horizontal border border-[#5B3FE6]/20"
                  >
                    <ChevronRight className="w-4.5 h-4.5 text-white stroke-[3]" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-white border border-[#ECECEC] rounded-[28px] p-6 text-center w-full shadow-soft">
                <MapPin className="w-8 h-8 text-[#6C4CF1]/40 mb-2 animate-bounce" />
                <h3 className="text-sm font-bold text-[#1E2235] font-poppins">No rooms found in {selectedCity}</h3>
                <p className="text-[11px] text-[#94A3B8] mt-1 max-w-xs">
                  Try choosing another city in the header to view recommendations.
                </p>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* FRESH RECOMMENDATIONS (OLX STYLE GRID) */}
          {/* ========================================================================= */}
          <section className="max-w-[1280px] mx-auto text-left space-y-6 pt-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-1.5">
                <h2 className="font-semibold text-lg md:text-xl text-[#1E2235] tracking-tight">
                  All Property
                </h2>
              </div>
              <Link
                href="/rooms?type=all"
                className="text-[11px] sm:text-xs font-bold text-[#6C4CF1] hover:text-[#5B3FE6] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Grid Layout: 1 column on tiny mobile, 2 on mobile, 3 on tablet, 4 on desktop */}
            {freshRecommendations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {freshRecommendations.slice(0, 20).map((prop: PropertyListing) => {
                    const isPromoted = promotedIds.has(prop.id);
                    const typePath = (prop.type || "room").toLowerCase();
                    const detailsUrl = `/${typePath === "room" ? "rooms" : typePath === "hostel" ? "hostels" : typePath === "flat" ? "flats" : "pg"}/${prop.id}`;
                    const isSaved = savedIds.includes(prop.id);
                    
                    return (
                      <Link
                        key={prop.id}
                        href={detailsUrl}
                        className={`block rounded-[20px] bg-white border border-[#ECECEC] shadow-sm hover:shadow-lg hover:border-[#6C4CF1]/30 transition-all duration-300 overflow-hidden text-left group cursor-pointer relative hover:-translate-y-1 ${
                          isPromoted ? "ring-1 ring-amber-400" : ""
                        }`}
                      >
                        {/* Image Container */}
                        <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={getImageUrl(prop.image)}
                            alt={prop.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          
                          {/* Verified Badge */}
                          <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm">
                            <CheckCircle className="w-3 h-3 text-white" />
                            <span>Verified</span>
                          </div>

                          {/* Floating Heart Icon Button (Wishlist) */}
                          <button
                            type="button"
                            onClick={(e) => toggleSaveProperty(prop.id, e)}
                            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center border shadow-xs cursor-pointer active:scale-90 transition-all z-20 backdrop-blur-xs ${
                              isSaved
                                ? "bg-red-50 border-red-100 text-red-500"
                                : "bg-white/90 border-black/10 text-neutral-500 hover:text-red-500"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                          </button>

                          {/* Rent overlay on image */}
                          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-left z-10 border border-white/10">
                            <span className="text-[9px] font-medium block text-white/80 leading-none">Rent</span>
                            <span className="text-sm sm:text-base font-bold font-poppins block mt-0.5 leading-none">
                              ₹{prop.rent.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-white/80">/{prop.type === "hostel" ? "yr" : "mo"}</span>
                            </span>
                          </div>

                          {isPromoted && (
                            <div className="absolute top-2.5 right-12 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
                              Featured
                            </div>
                          )}
                        </div>

                        {/* Info Content Box */}
                        <div className="p-4 flex-grow flex flex-col justify-between space-y-2.5 bg-white">
                          <div className="space-y-1">
                            {/* Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {prop.sharing && (
                                <span className="text-[10px] font-bold text-[#6C4CF1] bg-[#F0EDFF] px-2 py-0.5 rounded-md">
                                  {prop.sharing}
                                </span>
                              )}
                              {prop.furnishing && (
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {prop.furnishing}
                                </span>
                              )}
                              {prop.tag && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {prop.tag}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-poppins font-bold text-sm sm:text-base text-[#1E2235] group-hover:text-[#6C4CF1] transition-colors line-clamp-1 leading-snug pt-0.5">
                              {prop.title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center space-x-1 text-slate-500 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#6C4CF1] shrink-0" />
                              <span className="text-xs font-medium truncate">
                                {prop.area}, {prop.city}
                              </span>
                            </div>
                          </div>

                          {/* Send Now Button */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Direct Owner
                            </span>
                            <div className="bg-[#6C4CF1] group-hover:bg-[#5B3FE6] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center space-x-1">
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {freshRecommendations.length > 20 && (
                  <div className="flex justify-center mt-10 w-full">
                    <Link
                      href="/rooms?type=all"
                      className="px-10 py-3.5 bg-[#002f34] hover:bg-[#001f22] text-white font-bold rounded-md text-xs active:scale-95 transition-all shadow-md select-none font-poppins flex items-center justify-center cursor-pointer uppercase tracking-wider"
                    >
                      <span>Load More</span>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-white border border-[#ECECEC] rounded-[28px] p-6 text-center w-full shadow-soft">
                <MapPin className="w-8 h-8 text-[#6C4CF1]/40 mb-2 animate-bounce" />
                <h3 className="text-sm font-bold text-[#1E2235] font-poppins">No recommendations found</h3>
                <p className="text-[11px] text-[#94A3B8] mt-1 max-w-xs">
                  We couldn't find any rooms in this location matching your criteria.
                </p>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* POPULAR CITIES */}
          {/* ========================================================================= */}
          <section className="max-w-[1280px] mx-auto text-left space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg md:text-xl text-[#1E2235] tracking-tight">
                  Popular Cities
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Find your next home nearby
                </p>
              </div>
              <Link 
                href="/rooms"
                className="bg-[#E6F7F0] text-[#00A86B] font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#D4F2E4] transition-all cursor-pointer select-none"
              >
                <span>All {allCitiesCount}</span>
                <span className="font-mono text-sm leading-none">&rarr;</span>
              </Link>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {/* Delhi Card */}
              <Link 
                href="/rooms?city=Delhi"
                className="group relative col-span-2 md:col-span-1 aspect-[16/10] md:aspect-[4/3] rounded-[24px] md:rounded-[28px] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 block"
              >
                <Image
                  src="/assets/delhi.png"
                  alt="Delhi"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10" />
                
                {/* Most Popular Badge */}
                <div className="absolute top-4 left-4 bg-[#056B49] text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider z-20 shadow-sm">
                  Most Popular
                </div>

                {/* Card Text */}
                <div className="absolute bottom-4 left-4 z-20 text-left">
                  <h3 className="font-poppins font-black text-xl text-white tracking-tight leading-none mb-1.5">
                    Delhi
                  </h3>
                  <p className="text-xs text-white/80 font-semibold">
                    {getCityCount("Delhi")} room{getCityCount("Delhi") !== 1 ? "s" : ""} available
                  </p>
                </div>
              </Link>

              {/* Patna Card */}
              <Link 
                href="/rooms?city=Patna"
                className="group relative col-span-1 aspect-[4/5] md:aspect-[4/3] rounded-[24px] md:rounded-[28px] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 block"
              >
                <Image
                  src="/assets/patna.png"
                  alt="Patna"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10" />

                {/* Card Text */}
                <div className="absolute bottom-4 left-4 z-20 text-left">
                  <h3 className="font-poppins font-black text-xl text-white tracking-tight leading-none mb-1.5">
                    Patna
                  </h3>
                  <p className="text-xs text-white/80 font-semibold">
                    {getCityCount("Patna")} room{getCityCount("Patna") !== 1 ? "s" : ""} available
                  </p>
                </div>
              </Link>

              {/* Noida Card */}
              <Link 
                href="/rooms?city=Noida"
                className="group relative col-span-1 aspect-[4/5] md:aspect-[4/3] rounded-[24px] md:rounded-[28px] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 block"
              >
                <Image
                  src="/assets/noida.png"
                  alt="Noida"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10" />

                {/* Card Text */}
                <div className="absolute bottom-4 left-4 z-20 text-left">
                  <h3 className="font-poppins font-black text-xl text-white tracking-tight leading-none mb-1.5">
                    Noida
                  </h3>
                  <p className="text-xs text-white/80 font-semibold">
                    {getCityCount("Noida")} room{getCityCount("Noida") !== 1 ? "s" : ""} available
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* WHY CHECKROOMS? SECTION */}
          {/* ========================================================================= */}
          <section className="max-w-[1280px] w-full mx-auto px-4 md:px-0 text-left space-y-6">
            <div className="space-y-1">
              <h2 className="font-poppins font-extrabold text-2xl md:text-3xl text-[#1E2235] tracking-tight">
                Why CheckRooms?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                Built for Indian students & professionals
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {/* Card 1: Verified Owners */}
              <div className="col-span-2 md:col-span-1 bg-white rounded-[28px] border border-black/[0.08] p-5 sm:p-6 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-5 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] hover:border-blue-200/80 hover:shadow-[0px_12px_32px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="font-poppins font-bold text-[#1E2235] text-[14px] sm:text-base leading-tight">
                    Verified owners only
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-relaxed">
                    Every listing is geo-tagged and manually verified to prevent fraud.
                  </p>
                </div>
              </div>

              {/* Card 2: Zero Commission */}
              <div className="col-span-1 md:col-span-1 bg-white rounded-[28px] border border-black/[0.08] p-5 sm:p-6 flex flex-col items-start gap-3 md:gap-5 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] hover:border-blue-200/80 hover:shadow-[0px_12px_32px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <Zap className="w-5.5 h-5.5 md:w-6 md:h-6 stroke-[2]" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="font-poppins font-bold text-[#1E2235] text-[14px] sm:text-base leading-tight">
                    Zero commission
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-relaxed">
                    Pay once, talk directly to the owner via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Card 3: Student First */}
              <div className="col-span-1 md:col-span-1 bg-white rounded-[28px] border border-black/[0.08] p-5 sm:p-6 flex flex-col items-start gap-3 md:gap-5 shadow-[0px_4px_16px_rgba(0,0,0,0.01)] hover:border-blue-200/80 hover:shadow-[0px_12px_32px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <GraduationCap className="w-5.5 h-5.5 md:w-6 md:h-6 stroke-[2]" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="font-poppins font-bold text-[#1E2235] text-[14px] sm:text-base leading-tight">
                    Student first
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-relaxed">
                    Filters for PGs near coaching hubs and universities.
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* ========================================================================= */}
          {/* THREE BOTTOM COLUMNS BANNERS */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1280px] mx-auto">
            {/* Box 1: Ad 1 or Fallback 1 */}
            {(() => {
              const activeAds = promotions.filter((p) => p.status === "active");
              const currentAd = activeAds[0];

              if (!currentAd) {
                return (
                  <div className="bg-[#F2F4FF] border border-[#E3E8FF] rounded-[28px] p-6 sm:p-8 flex items-center justify-between relative overflow-hidden min-h-[180px] shadow-sm text-left">
                    <div className="z-10 max-w-[240px] space-y-4">
                      <h3 className="font-poppins font-bold text-lg sm:text-[20px] text-[#111827] leading-tight">
                        Find Best PGs & Hostels
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed font-medium">
                        Search premium fully-managed PG accommodations and student hostels near you.
                      </p>
                      <Link
                        href="/rooms"
                        className="inline-block bg-[#6366F1] text-white text-[11px] font-bold px-5 py-3 rounded-full hover:bg-[#4F46E5] active:scale-95 transition-all uppercase tracking-wider shadow-sm"
                      >
                        Explore Hostels & PGs
                      </Link>
                    </div>
                    <div className="absolute right-4 bottom-4 w-28 h-28 text-[#D9E1FC] pointer-events-none flex items-center justify-center">
                      <Building2 className="w-full h-full stroke-[1.2]" />
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-[#F2F4FF] border border-[#E3E8FF] rounded-[28px] p-6 sm:p-8 flex items-center justify-between relative overflow-hidden min-h-[180px] shadow-sm text-left group hover:border-[#6C4CF1]/30 transition-all duration-300">
                  <div className="z-10 max-w-[200px] sm:max-w-[240px] space-y-3">
                    <span className="bg-[#6C4CF1]/15 text-[#6C4CF1] text-[9.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider block w-fit">
                      {currentAd.badge || "Sponsored"}
                    </span>
                    <h3 className="font-poppins font-bold text-lg sm:text-[20px] text-[#111827] leading-tight line-clamp-1">
                      {currentAd.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed font-medium line-clamp-2">
                      {currentAd.subtitle}
                    </p>
                    <a
                      href={currentAd.buttonLink.startsWith("http") ? currentAd.buttonLink : `https://${currentAd.buttonLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#6C4CF1] text-white text-[11px] font-bold px-5 py-3 rounded-full hover:bg-[#5B3FE6] active:scale-95 transition-all uppercase tracking-wider shadow-sm"
                    >
                      {currentAd.buttonText || "Visit Sponsor"}
                    </a>
                  </div>
                  
                  {(currentAd.badge || currentAd.image) ? (
                    <div className="absolute right-4 bottom-4 w-24 h-24 rounded-2xl overflow-hidden border border-[#E3E8FF] bg-white group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={getImageUrl(currentAd.badge || currentAd.image)}
                        alt={currentAd.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="absolute right-4 bottom-4 w-28 h-28 text-[#D9E1FC] pointer-events-none flex items-center justify-center">
                      <Megaphone className="w-full h-full stroke-[1.2]" />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Box 2: Ad 2 or Fallback 2 */}
            {(() => {
              const activeAds = promotions.filter((p) => p.status === "active");
              const currentAd = activeAds[1];

              if (!currentAd) {
                return (
                  <div className="bg-[#FCF8F2] border border-[#F5EDE0] rounded-[28px] p-6 sm:p-8 flex items-center justify-between relative overflow-hidden min-h-[180px] shadow-sm text-left">
                    <div className="z-10 max-w-[240px] space-y-4">
                      <h3 className="font-poppins font-bold text-lg sm:text-[20px] text-[#111827] leading-tight">
                        Rent Rooms & Flats
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed font-medium">
                        Discover verified single/shared rooms, co-living spaces, and flats with zero brokerage.
                      </p>
                      <Link
                        href="/rooms"
                        className="inline-block bg-[#D97706] text-white text-[11px] font-bold px-5 py-3 rounded-full hover:bg-[#B45309] active:scale-95 transition-all uppercase tracking-wider shadow-sm"
                      >
                        Browse Rooms & Flats
                      </Link>
                    </div>
                    <div className="absolute right-4 bottom-4 w-28 h-28 text-[#FDECD4] pointer-events-none flex items-center justify-center">
                      <Home className="w-full h-full stroke-[1.2]" />
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-[#FCF8F2] border border-[#F5EDE0] rounded-[28px] p-6 sm:p-8 flex items-center justify-between relative overflow-hidden min-h-[180px] shadow-sm text-left group hover:border-[#D97706]/30 transition-all duration-300">
                  <div className="z-10 max-w-[200px] sm:max-w-[240px] space-y-3">
                    <span className="bg-[#D97706]/15 text-[#D97706] text-[9.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider block w-fit">
                      {currentAd.badge || "Sponsored"}
                    </span>
                    <h3 className="font-poppins font-bold text-lg sm:text-[20px] text-[#111827] leading-tight line-clamp-1">
                      {currentAd.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed font-medium line-clamp-2">
                      {currentAd.subtitle}
                    </p>
                    <a
                      href={currentAd.buttonLink.startsWith("http") ? currentAd.buttonLink : `https://${currentAd.buttonLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#D97706] text-white text-[11px] font-bold px-5 py-3 rounded-full hover:bg-[#B45309] active:scale-95 transition-all uppercase tracking-wider shadow-sm"
                    >
                      {currentAd.buttonText || "Visit Sponsor"}
                    </a>
                  </div>
                  
                  {(currentAd.badge || currentAd.image) ? (
                    <div className="absolute right-4 bottom-4 w-24 h-24 rounded-2xl overflow-hidden border border-[#F5EDE0] bg-white group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={getImageUrl(currentAd.badge || currentAd.image)}
                        alt={currentAd.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="absolute right-4 bottom-4 w-28 h-28 text-[#FDECD4] pointer-events-none flex items-center justify-center">
                      <Megaphone className="w-full h-full stroke-[1.2]" />
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        </div>
      </main>

      <Footer />
      <MobileNav />

      {/* Custom Geolocation Modal Triggered on Scroll (matches Image 2 style) */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0">
          <div className="relative bg-white w-full max-w-[450px] rounded-t-[28px] rounded-b-none border-t border-x border-[#ECECEC] shadow-premium overflow-hidden transform scale-100 transition-all p-6 pb-10 pt-8 flex flex-col text-center min-h-[48vh] justify-between">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer select-none"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Custom SVG Location Illustration */}
            <div className="w-full flex items-center justify-center mt-2">
              <svg className="w-44 h-26" viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Map lines */}
                <path d="M20 90 L180 90" stroke="#ECEFF5" strokeWidth="3" strokeLinecap="round" />
                <path d="M40 30 L160 30" stroke="#ECEFF5" strokeWidth="2" strokeLinecap="round" />
                <path d="M30 30 L50 90" stroke="#ECEFF5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M170 30 L150 90" stroke="#ECEFF5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M100 20 L100 90" stroke="#ECEFF5" strokeWidth="2" strokeLinecap="round" />
                {/* Map green/blue background shapes */}
                <path d="M10 70 C 30 70, 30 90, 10 90 Z" fill="#E2F2EB" />
                <path d="M190 70 C 170 70, 170 90, 190 90 Z" fill="#E2F2EB" />
                {/* Red path trace */}
                <path d="M50 85 C 70 85, 90 75, 100 55" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
                {/* Glow shadow under the pin */}
                <ellipse cx="100" cy="85" rx="10" ry="3.5" fill="#1E2235" fillOpacity="0.12" />
                {/* Red map pin */}
                <g transform="translate(100, 52) scale(0.95)">
                  <path d="M0 0 C-10 -10 -16 -24 -16 -34 C-16 -46 -6 -54 0 -54 C6 -54 16 -46 16 -34 C16 -24 10 -10 0 0 Z" fill="#EF4444" />
                  <circle cx="0" cy="-34" r="6" fill="white" />
                </g>
              </svg>
            </div>

            {/* Content info */}
            <h3 className="font-poppins font-bold text-[18px] text-[#002f34] tracking-tight leading-tight mt-4 px-2">
              Where do you want to find rooms?
            </h3>
            <p className="text-[12.5px] text-[#406367] font-semibold max-w-[270px] mx-auto mt-2.5 leading-relaxed px-2">
              To enjoy all that CheckRooms has to offer you, we need to know where to look for them.
            </p>

            {/* Buttons row */}
            <div className="flex items-center gap-3 mt-6 w-full px-2">
              <button 
                onClick={handleOtherAddress}
                className="flex-1 py-3 border-2 border-[#002f34] text-[#002f34] font-bold rounded-md text-xs bg-white hover:bg-slate-50 active:scale-95 transition-all text-center cursor-pointer select-none font-poppins"
              >
                Other Address
              </button>
              <button 
                onClick={detectLocation}
                disabled={loadingLocation}
                className="flex-1 py-3 bg-[#002f34] hover:bg-[#001f22] text-white font-bold rounded-md text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none font-poppins disabled:opacity-85"
              >
                {loadingLocation ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 fill-white rotate-45 shrink-0" />
                )}
                <span>{loadingLocation ? "Locating..." : "Near Me"}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// IMPORTANT
// The attached reference image is the single source of truth.
// Maintain 98–99% visual similarity.
// Do not redesign any section.
// Do not change spacing.
// Do not change typography.
// Do not change colors.
// Do not change proportions.
// Only make responsive adjustments where necessary.
