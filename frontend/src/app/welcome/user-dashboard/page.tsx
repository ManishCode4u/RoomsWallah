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
  Check
} from "lucide-react";
import { getApiUrl } from "@/data/api";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function UserDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"wishlist" | "reports">("wishlist");

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
      setEmail(localStorage.getItem("user_email") || "tenant@roomswallah.com");
      setPhone(localStorage.getItem("user_phone") || "+91 XXXXX XXXXX");
      setAvatar(localStorage.getItem("user_avatar") || "🦊");
      
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
        repList = JSON.parse(localStorage.getItem("roomswallah_reports") || "[]");
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

      <main className="flex-grow pt-32 pb-20 font-poppins">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 w-full space-y-8">
          
          {/* ========================================================================= */}
          {/* USER CARD CONTAINER (Visual Excellence Grid) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#ECECEC] rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 text-center sm:text-left">
              {/* Avatar Selector and display */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-50 flex items-center justify-center text-5xl sm:text-6xl border-4 border-white shadow-md select-none">
                  {avatar}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1E2235] tracking-tight">{name}</h2>
                  <span className="bg-rose-50 text-rose-500 border border-rose-200/50 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                    Tenant Account
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-bold">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{phone}</span>
                  </div>
                </div>

                {/* Avatar changer list */}
                <div className="pt-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Choose Cartoon Avatar:
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {cuteAvatars.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => changeAvatar(emoji)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-slate-100 active:scale-90 transition-all cursor-pointer border ${
                          avatar === emoji ? "border-rose-500 bg-rose-50/50 scale-105" : "border-[#ECECEC] bg-white"
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
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-red-50 border border-[#ECECEC] hover:border-red-200 text-slate-600 hover:text-red-500 font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-xs md:self-start"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TABS SELECTOR */}
          {/* ========================================================================= */}
          <div className="flex space-x-2 border-b border-[#EBEFF8] pb-0.5">
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === "wishlist"
                  ? "border-[#6C4CF1] text-[#6C4CF1]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>My Wishlist ({wishlistProperties.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === "reports"
                  ? "border-[#6C4CF1] text-[#6C4CF1]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProperties.map((p) => (
                    <div 
                      key={p.id || p._id} 
                      className="bg-white border border-[#ECECEC] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <Link href={`/${(p.type || "").toLowerCase() === "room" ? "rooms" : (p.type || "").toLowerCase() === "hostel" ? "hostels" : (p.type || "").toLowerCase() === "flat" ? "flats" : "pg"}/${p.id || p._id}`} className="block relative aspect-video overflow-hidden">
                        <img 
                          src={p.image || "/assets/room1.png"} 
                          alt={p.title} 
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-[#6C4CF1] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          {p.type || "Room"}
                        </span>
                      </Link>

                      <div className="p-5 text-left space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#1E2235] line-clamp-1">
                            {p.title}
                          </h4>
                          <div className="flex items-center text-slate-400 text-xs font-semibold gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{p.area ? `${p.area}, ${p.city}` : p.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F5]">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Rent</span>
                            <span className="text-base font-extrabold text-[#6C4CF1]">₹{p.rent}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">/month</span>
                          </div>
                          <button
                            onClick={() => handleRemoveWishlist(p.id || p._id)}
                            className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-200 cursor-pointer active:scale-95"
                            title="Remove from Saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#ECECEC] rounded-[32px] p-12 text-center max-w-md mx-auto space-y-5">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <Heart className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[#1E2235]">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      You haven't saved any listings yet. Browse through our premium recommendations to find your dream room!
                    </p>
                  </div>
                  <Link 
                    href="/rooms" 
                    className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#6C4CF1]/10 transition-all active:scale-95"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Listings</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MY SUBMITTED REPORTS */}
          {/* ========================================================================= */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {reports.length > 0 ? (
                <div className="bg-white border border-[#ECECEC] rounded-[32px] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto text-left">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-[#ECECEC] text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-poppins">
                          <th className="px-6 py-4">Reported Property</th>
                          <th className="px-6 py-4">Owner</th>
                          <th className="px-6 py-4">Reason</th>
                          <th className="px-6 py-4">Report Date</th>
                          <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F2F5] text-xs font-semibold text-[#1E2235] font-poppins">
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
                      Thank you! You haven't reported any fake listings. Helping us keep the platform authentic makes RoomsWallah better for everyone.
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
