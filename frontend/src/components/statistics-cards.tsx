"use client";

import { Home, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function StatisticsCards() {
  const stats = [
    {
      id: 1,
      icon: Home,
      value: "50K+",
      label: "Rooms Listed",
    },
    {
      id: 2,
      icon: User,
      value: "10K+",
      label: "Verified Owners",
    },
    {
      id: 3,
      icon: MapPin,
      value: "25+",
      label: "Cities",
    },
  ];

  return (
    <div className="flex flex-row gap-2 pt-2 justify-between w-full overflow-x-auto no-scrollbar sm:flex-nowrap">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="flex items-center space-x-2 bg-[#0B1530]/40 backdrop-blur-md border border-white/10 px-2.5 py-2.5 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.15)] flex-1 min-w-0 sm:w-[170px] md:w-[176px] shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[13px] sm:text-[17px] font-black text-white leading-tight font-poppins truncate">{stat.value}</span>
              <span className="text-[8px] sm:text-[10px] text-white/60 font-bold mt-0.5 whitespace-nowrap truncate">{stat.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
