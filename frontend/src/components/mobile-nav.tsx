"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Threshold check: always show near the top (within 80px)
      if (currentScrollY > 80) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down -> hide navbar
          setIsVisible(false);
        } else {
          // Scrolling up -> show navbar
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/rooms", icon: Search },
    { name: "List Room", href: "/welcome", icon: Plus },
    { name: "Saved", href: "/rooms?saved=true", icon: Heart },
    { name: "Profile", href: "/welcome", icon: User },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-[0px_-4px_16px_rgba(0,0,0,0.04)] px-2 pb-safe-bottom transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-full"}`}>
      <div className="flex justify-between items-center h-[68px] max-w-md mx-auto relative pb-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-1 text-center cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className={`transition-colors duration-250 flex items-center justify-center h-[24px] ${
                  isActive ? "text-[#1E2235]" : "text-[#6B7280]"
                }`}
              >
                {item.name === "List Room" ? (
                  <div className={`w-[20px] h-[20px] rounded-[4px] border-[2px] flex items-center justify-center transition-colors duration-250 ${
                    isActive ? "border-[#1E2235] bg-[#1E2235] text-white" : "border-[#6B7280] text-[#6B7280]"
                  }`}>
                    <Plus className="w-3 h-3 stroke-[3.5]" />
                  </div>
                ) : (
                  <Icon className={`w-[22px] h-[22px] ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 leading-none font-medium font-poppins transition-colors duration-250 ${
                  isActive ? "text-[#1E2235]" : "text-[#6B7280]"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
