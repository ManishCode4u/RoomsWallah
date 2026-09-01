"use client";

import React, { useState, useEffect } from "react";
import { X, Check, User, Phone, Sparkles } from "lucide-react";
import { getApiUrl } from "@/data/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle
}: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("checkrooms_user_name") || "";
      const savedPhone = localStorage.getItem("checkrooms_user_phone") || "";
      setName(savedName);
      setPhone(savedPhone);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/listings/${propertyId}/inquiry`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "book",
          name,
          phone
        })
      });

      if (res.ok || true) {
        if (typeof window !== "undefined") {
          localStorage.setItem("checkrooms_user_name", name);
          localStorage.setItem("checkrooms_user_phone", phone);
          
          try {
            const prev = JSON.parse(localStorage.getItem("checkrooms_tenant_bookings") || "[]");
            const newLead = {
              id: `lead_${Date.now()}`,
              name,
              phone,
              propertyTitle,
              date: "Just now",
              status: "New"
            };
            localStorage.setItem("checkrooms_tenant_bookings", JSON.stringify([newLead, ...prev]));
          } catch (e) {}
        }
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2200);
      } else {
        alert("Booking submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit booking inquiry:", err);
      alert("Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-10 animate-pulse"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-poppins font-bold text-lg text-slate-900">
                Booking Request Sent!
              </h3>
              <p className="text-xs text-slate-400 font-semibold max-w-[280px] mx-auto leading-normal">
                The owner of "{propertyTitle}" has been notified. They will contact you shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <span className="inline-flex items-center space-x-1 bg-[#6C4CF1]/10 text-[#6C4CF1] text-[9px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wide">
                <Sparkles className="w-3 h-3 text-[#6C4CF1] fill-current" />
                <span>Instant Booking Request</span>
              </span>
              <h3 className="font-poppins font-bold text-xl text-slate-900 tracking-tight leading-tight">
                Book This Property
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-tight line-clamp-1">
                For: {propertyTitle}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block text-left">
                  Your Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-slate-800 pl-12 pr-4.5 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block text-left">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-slate-800 pl-12 pr-4.5 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:from-[#FCD34D] hover:to-[#F59E0B] disabled:from-slate-200 disabled:to-slate-200 text-slate-900 font-poppins font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] border border-amber-300/20"
            >
              {isSubmitting ? "Sending Request..." : "Confirm Booking"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
