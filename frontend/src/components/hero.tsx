"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full h-auto bg-[#5D38A4] mt-20 md:mt-36 overflow-hidden flex items-center min-h-[360px] md:min-h-[420px] shadow-md border-b border-white/5">
      {/* Desktop Background Image (Right 50%) */}
      <div className="absolute right-0 top-0 bottom-0 w-[50%] hidden md:block z-0">
        <Image
          src="/assets/auto-building.jpg"
          alt="RoomsWallah Cozy Room"
          fill
          priority
          className="object-cover object-[30%_center]"
          sizes="50vw"
        />
        {/* Smooth purple fade from left to right */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #5D38A4 0%, rgba(93,56,164,0.7) 20%, transparent 45%)"
          }}
        />
      </div>

      {/* Mobile/Tablet Background Image (Full bleed with overlay) */}
      <div className="absolute inset-0 md:hidden z-0">
        <Image
          src="/assets/auto-building.jpg"
          alt="RoomsWallah Cozy Room"
          fill
          priority
          className="object-cover object-[35%_center]"
          sizes="100vw"
        />
        {/* Blends image to solid purple on the left where the text is */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #5D38A4 0%, rgba(93,56,164,0.85) 30%, transparent 60%)"
          }}
        />
      </div>

      {/* Left Text Content (sitting on top of the backgrounds) - Centered using standard max-width */}
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-12 flex items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-[60%] text-left py-10 md:py-16 space-y-4 md:space-y-6"
        >
          {/* Tag/Logo Subtitle */}
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/90">
            ROOMSWALLAH
          </div>

          {/* Heading */}
          <h1 className="font-poppins font-extrabold text-[26px] xs:text-[30px] sm:text-[36px] md:text-[40px] text-white leading-[1.25] tracking-tight">
            Find Your Perfect Room, <br />
            Zero Brokerage.
          </h1>

          {/* Subtitle */}
          <p className="text-[12px] sm:text-[14px] text-white/80 font-medium max-w-[420px] leading-relaxed">
            Get your budget beds with zero brokerage.
          </p>

          {/* Find Room Button */}
          <div className="pt-4 sm:pt-5">
            <Link
              href="/rooms"
              className="inline-flex items-center justify-center bg-[#F5B01A] hover:bg-[#E09D0D] text-slate-900 text-xs sm:text-sm font-extrabold px-7 py-3 rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Find Rooms
            </Link>
          </div>

          {/* Slider Dots */}
          <div className="flex items-center space-x-1.5 pt-4">
            <span className="w-5.5 h-1.5 rounded-full bg-white transition-all duration-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all duration-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all duration-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all duration-300" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
