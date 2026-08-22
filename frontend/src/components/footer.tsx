import Link from "next/link";
import Image from "next/image";
import { 
  Instagram, 
  Mail, 
  MapPin, 
  Phone,
  Home 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/roomswallah", name: "Instagram" },
  ];

  return (
    <footer className="bg-[#0B0F19] border-t border-slate-950 mt-auto pb-24 md:pb-8 text-slate-400">
      <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-4">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
          
          {/* Column 1: Logo & Info (6 cols) */}
          <div className="col-span-2 lg:col-span-6 space-y-5">
            <Link href="/" className="flex items-center space-x-2.5 group text-left shrink-0 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C4CF1] to-[#8E75FF] flex items-center justify-center text-white shadow-md shadow-[#6C4CF1]/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Home className="w-5.5 h-5.5 stroke-[2.5]" />
              </div>
              <span className="font-poppins font-black text-2xl tracking-tight text-white">
                Rooms<span className="text-[#6C4CF1]">Wallah</span>
              </span>
            </Link>
            
            <p className="text-[13px] text-slate-400 leading-relaxed font-medium max-w-[340px]">
              Helping students and working professionals find verified rooms, PGs and hostels with ease.
            </p>

            {/* Email contact block */}
            <div className="flex items-center space-x-3 text-slate-400 pt-1">
              <div className="w-8.5 h-8.5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-none mb-1">Email Us</span>
                <a href="mailto:hello@roomswallah.com" className="text-white hover:text-[#6C4CF1] font-bold text-[13px] transition-colors">
                  hello@roomswallah.com
                </a>
              </div>
            </div>
            
            {/* Social Icons (Instagram Only) */}
            <div className="flex space-x-3 pt-1">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-8.5 h-8.5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-[#6C4CF1] hover:text-white transition-all duration-300 active:scale-90"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Explore (3 cols) */}
          <div className="col-span-1 lg:col-span-3 space-y-4.5">
            <h4 className="font-poppins font-bold text-sm text-white relative pb-2.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-[3px] after:bg-[#6C4CF1] after:rounded-full uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-3 font-semibold text-[13px]">
              <li>
                <Link href="/rooms" className="text-slate-400 hover:text-white transition-colors">
                  Rooms for Rent
                </Link>
              </li>
              <li>
                <Link href="/pg?gender=boys" className="text-slate-400 hover:text-white transition-colors">
                  PG for Boys
                </Link>
              </li>
              <li>
                <Link href="/pg?gender=girls" className="text-slate-400 hover:text-white transition-colors">
                  PG for Girls
                </Link>
              </li>
              <li>
                <Link href="/hostels" className="text-slate-400 hover:text-white transition-colors">
                  Hostels
                </Link>
              </li>
              <li>
                <Link href="/rooms?type=sharing" className="text-slate-400 hover:text-white transition-colors">
                  Shared Rooms
                </Link>
              </li>
              <li>
                <Link href="/rooms?bhk=1,2" className="text-slate-400 hover:text-white transition-colors">
                  1BHK / 2BHK
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company (3 cols) */}
          <div className="col-span-1 lg:col-span-3 space-y-4.5">
            <h4 className="font-poppins font-bold text-sm text-white relative pb-2.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-[3px] after:bg-[#6C4CF1] after:rounded-full uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3 font-semibold text-[13px]">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Skyline Silhouette Image Grid */}
        <div className="w-full mt-10 border-b border-slate-800 pb-2 overflow-hidden select-none">
          <svg className="w-full h-[100px] text-[#1E293B] opacity-30" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background skyline shapes */}
            <path d="M0 120V90H30V75H70V100H100V60H140V120H0Z" fill="#131B2E" />
            <path d="M120 120V80H160V50H210V85H240V70H280V120H120Z" fill="#1A2338" opacity="0.75" />
            <path d="M260 120V75H310V40H350V90H390V60H430V120H260Z" fill="#222E4A" />
            <path d="M410 120V80H460V55H500V95H540V70H590V120H410Z" fill="#131B2E" />
            <path d="M570 120V90H600V75H640V100H670V60H710V120H570Z" fill="#222E4A" opacity="0.9" />
            <path d="M690 120V70H730V45H780V80H820V65H860V120H690Z" fill="#1A2338" />
            <path d="M840 120V85H890V50H930V95H970V60H1010V120H840Z" fill="#222E4A" />
            <path d="M990 120V95H1030V70H1070V105H1100V80H1150V90H1200V120H990Z" fill="#131B2E" />

            {/* Trees */}
            <circle cx="50" cy="110" r="8" fill="#2A3B5E" />
            <rect x="49" y="110" width="2" height="10" fill="#1F2C47" />
            <circle cx="290" cy="112" r="6" fill="#2A3B5E" />
            <rect x="289" y="112" width="2" height="8" fill="#1F2C47" />
            <circle cx="830" cy="110" r="7" fill="#2A3B5E" />
            <rect x="829" y="110" width="2" height="10" fill="#1F2C47" />

            {/* Purple Pin */}
            <g transform="translate(485, 45) scale(0.65)">
              <path d="M10 0C4.477 0 0 4.477 0 10C0 17.5 10 28 10 28C10 28 20 17.5 20 10C20 4.477 15.523 0 10 0ZM10 13.5C8.067 13.5 6.5 11.933 6.5 10C6.5 8.067 8.067 6.5 10 6.5C11.933 6.5 13.5 8.067 13.5 10C13.5 11.933 11.933 13.5 10 13.5Z" fill="#6C4CF1" />
            </g>
            {/* Yellow Pin */}
            <g transform="translate(850, 42) scale(0.65)">
              <path d="M10 0C4.477 0 0 4.477 0 10C0 17.5 10 28 10 28C10 28 20 17.5 20 10C20 4.477 15.523 0 10 0ZM10 13.5C8.067 13.5 6.5 11.933 6.5 10C6.5 8.067 8.067 6.5 10 6.5C11.933 6.5 13.5 8.067 13.5 10C13.5 11.933 11.933 13.5 10 13.5Z" fill="#FFC940" />
            </g>
          </svg>
        </div>

        {/* Copyright info */}
        <div className="pt-5 text-center text-xs text-slate-500 font-bold">
          &copy; {currentYear} RoomsWallah. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
