"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import StatisticsCards from "./statistics-cards";

export default function Hero() {
  return (
    <section className="relative w-full h-auto pt-20 pb-44 sm:pt-24 sm:pb-56 md:py-24 lg:py-28 bg-[#071028] mt-16 md:mt-36 overflow-hidden flex items-center">
      {/* Right Side (55%): Luxury Bedroom Image on Desktop */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden md:block z-0">
        <Image
          src="/assets/hero-bg.png"
          alt="RoomsWallah Cozy Bedroom"
          fill
          priority
          className="object-cover"
          sizes="55vw"
        />
        {/* Navy Gradient overlay over the image left edge to blend seamlessly into solid bg */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #071028 0%, rgba(7,16,40,0.85) 15%, rgba(18,28,55,0.4) 50%, transparent 100%)"
          }}
        />
      </div>

      {/* Mobile/Tablet Background: Full-bleed image with overlay */}
      <div className="absolute inset-0 md:hidden z-0">
        <Image
          src="/assets/hero-bg.png"
          alt="RoomsWallah Cozy Bedroom"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay top to bottom */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(7,16,40,0.95) 0%, rgba(18,28,55,0.82) 50%, rgba(18,28,55,0.4) 100%)"
          }}
        />
      </div>

      {/* Bottom White Blend Overlay to fade seamlessly into the white page background */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10 md:hidden"
        style={{
          background: "linear-gradient(to top, #ffffff 0%, rgba(255, 255, 255, 0.95) 15%, rgba(255, 255, 255, 0.6) 45%, transparent 100%)"
        }}
      />

      {/* Content Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 w-full relative z-10 flex items-center">
        {/* Left Side (55% Width on Desktop) - Shifting content to the right on desktop */}
        <div className="w-full md:w-[55%] text-left space-y-5 md:pl-14">
          {/* Animated Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 bg-[#6C4CF1]/15 text-[#8E75FF] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#6C4CF1]/20"
          >
            <Shield className="w-3.5 h-3.5 text-[#8E75FF]" />
            <span>Simplifying Room Hunting</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-poppins font-extrabold text-[27px] xs:text-[31px] sm:text-[40px] md:text-[45px] text-white leading-[1.15] tracking-tight"
          >
            Find Your <span className="text-[#6C4CF1]">Perfect Room</span>, <br />
            Zero Brokerage.
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[13px] sm:text-[14px] text-white/70 font-medium max-w-[390px] leading-relaxed"
          >
            Trusted by thousands of students & working professionals across India.
          </motion.p>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-1.5"
          >
            <StatisticsCards />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
