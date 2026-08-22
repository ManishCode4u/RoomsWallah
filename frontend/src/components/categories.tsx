"use client";

import Link from "next/link";
import { 
  Bed, 
  Building, 
  Building2, 
  ClipboardList, 
  Users, 
  BedDouble,
  ChevronRight
} from "lucide-react";

export default function Categories() {
  const categories = [
    { 
      label: "Rooms", 
      icon: Bed, 
      color: "text-[#FF5A5F] bg-[#FFF0F0] border border-[#FF5A5F]/20 group-hover:bg-[#FF5A5F] group-hover:text-white group-hover:border-[#FF5A5F] shadow-xs shadow-[#FF5A5F]/5 group-hover:shadow-md group-hover:shadow-[#FF5A5F]/20", 
      href: "/rooms?type=room" 
    },
    { 
      label: "PG", 
      icon: Building, 
      color: "text-[#8B5CF6] bg-[#F5F3FF] border border-[#8B5CF6]/20 group-hover:bg-[#8B5CF6] group-hover:text-white group-hover:border-[#8B5CF6] shadow-xs shadow-[#8B5CF6]/5 group-hover:shadow-md group-hover:shadow-[#8B5CF6]/20", 
      href: "/pg" 
    },
    { 
      label: "Hostel", 
      icon: BedDouble, 
      color: "text-[#F59E0B] bg-[#FFFBEB] border border-[#F59E0B]/20 group-hover:bg-[#F59E0B] group-hover:text-white group-hover:border-[#F59E0B] shadow-xs shadow-[#F59E0B]/5 group-hover:shadow-md group-hover:shadow-[#F59E0B]/20", 
      href: "/hostels" 
    },
    { 
      label: "Flats", 
      icon: Building2, 
      color: "text-[#10B981] bg-[#ECFDF5] border border-[#10B981]/20 group-hover:bg-[#10B981] group-hover:text-white group-hover:border-[#10B981] shadow-xs shadow-[#10B981]/5 group-hover:shadow-md group-hover:shadow-[#10B981]/20", 
      href: "/flats" 
    },
    { 
      label: "Room Wanted", 
      icon: ClipboardList, 
      color: "text-[#0284C7] bg-[#F0F9FF] border border-[#0284C7]/20 group-hover:bg-[#0284C7] group-hover:text-white group-hover:border-[#0284C7] shadow-xs shadow-[#0284C7]/5 group-hover:shadow-md group-hover:shadow-[#0284C7]/20", 
      href: "/rooms?wanted=true" 
    },
    { 
      label: "Roommates", 
      icon: Users, 
      color: "text-[#EC4899] bg-[#FDF2F8] border border-[#EC4899]/20 group-hover:bg-[#EC4899] group-hover:text-white group-hover:border-[#EC4899] shadow-xs shadow-[#EC4899]/5 group-hover:shadow-md group-hover:shadow-[#EC4899]/20", 
      href: "/rooms?roommates=true" 
    },
  ];

  return (
    <section className="max-w-[1280px] mx-auto text-left px-6 -mt-6 sm:-mt-8 md:mt-6 lg:mt-8 relative z-20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-lg md:text-xl text-[#1E2235] tracking-tight">
          Browse by Category
        </h2>
        <Link
          href="/rooms?type=all"
          className="text-[12px] font-bold text-[#6C4CF1] flex items-center space-x-1 hover:underline cursor-pointer group"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="flex flex-row flex-nowrap justify-start md:justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 overflow-x-auto no-scrollbar pb-3.5 md:pb-0 w-full">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={idx}
              href={cat.href}
              className="group flex flex-col items-center justify-center shrink-0 cursor-pointer min-w-[76px] sm:min-w-[96px] text-center active:scale-95 transition-all duration-200"
            >
              {/* Category Card containing only the icon */}
              <div className={`w-[68px] h-[68px] sm:w-[84px] sm:h-[84px] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${cat.color}`}>
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 transition-transform duration-300 group-hover:rotate-3" />
              </div>
              
              {/* Small, non-bold text label below the card */}
              <span className="text-[11px] sm:text-xs font-semibold text-neutral-600 mt-2.5 transition-colors duration-250 truncate w-full text-center group-hover:text-[#6C4CF1]">
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
