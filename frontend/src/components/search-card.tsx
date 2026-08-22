"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  MapPin, 
  ChevronDown, 
  Search 
} from "lucide-react";

export default function SearchCard() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState(""); // All Types, room, pg, hostel, flat
  const [budget, setBudget] = useState("Any Budget");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPath = type === "pg" ? "/pg" : type === "hostel" ? "/hostels" : type === "flat" ? "/flats" : "/rooms";
    router.push(
      `${targetPath}?city=${encodeURIComponent(city.trim())}&area=${encodeURIComponent(area.trim())}&type=${type}&budget=${encodeURIComponent(budget)}`
    );
  };

  return (
    <section className="relative z-30 px-4 sm:px-6 -mt-[40px] md:-mt-[50px] max-w-5xl w-full mx-auto">
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full bg-white border-2 border-black md:border md:border-[#ECECEC] rounded-[4px] md:rounded-[24px] overflow-hidden shadow-soft"
      >
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-0 w-full items-center">
          
          {/* Input 1: City */}
          <div className="relative h-14 md:h-16 flex items-center px-4.5 border-b border-black md:border-b-0 md:border-r md:border-[#ECECEC] hover:bg-slate-50/50 transition-colors">
            <MapPin className="w-5 h-5 text-[#6C4CF1] shrink-0" />
            <div className="flex flex-col text-left ml-2.5 flex-1 min-w-0">
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider leading-none">City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Type City..."
                className="bg-transparent text-sm sm:text-base font-normal text-[#1E2235] mt-1.5 outline-none w-full border-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Input 2: Area */}
          <div className="relative h-14 md:h-16 flex items-center px-4.5 border-b border-black md:border-b-0 md:border-r md:border-[#ECECEC] hover:bg-slate-50/50 transition-colors">
            <MapPin className="w-5 h-5 text-[#6C4CF1] shrink-0" />
            <div className="flex flex-col text-left ml-2.5 flex-1 min-w-0">
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider leading-none">Area</span>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Type Area..."
                className="bg-transparent text-sm sm:text-base font-normal text-[#1E2235] mt-1.5 outline-none w-full border-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Input 3: Property Type */}
          <div className="relative h-14 md:h-16 flex items-center px-4.5 border-b border-black md:border-b-0 md:border-r md:border-[#ECECEC] hover:bg-slate-50/50 transition-colors">
            <Home className="w-5 h-5 text-[#6C4CF1] shrink-0" />
            <div className="flex flex-col text-left ml-2.5 flex-1 min-w-0">
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider leading-none">Property Type</span>
              <span className="text-sm sm:text-base font-normal text-[#1E2235] truncate mt-1.5">
                {type === "room" ? "Room" : type === "pg" ? "PG" : type === "hostel" ? "Hostel" : type === "flat" ? "Flat" : "All Types"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
          <div className="relative h-14 md:h-16 flex items-center px-4.5 border-b border-black md:border-b-0 md:border-r md:border-[#ECECEC] hover:bg-slate-50/50 transition-colors">
            <span className="text-base font-bold text-[#6C4CF1] shrink-0 leading-none">₹</span>
            <div className="flex flex-col text-left ml-2 flex-1 min-w-0">
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider leading-none">Budget</span>
              <span className="text-sm sm:text-base font-normal text-[#1E2235] truncate mt-1.5">
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
            type="submit"
            className="bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white flex items-center justify-center space-x-2 h-14 md:h-16 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full"
          >
            <Search className="w-4.5 h-4.5 text-white" />
            <span>Search</span>
          </button>

        </form>
      </motion.div>
    </section>
  );
}
