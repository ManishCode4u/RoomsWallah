import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Home, Mail, CheckCircle2, UserCheck, Settings } from "lucide-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  title: "Privacy Policy - User Data & Security | CheckRooms",
  description: "Read the Privacy Policy of CheckRooms. Learn how we collect, protect, and process user data, listings, and privacy preferences.",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy | CheckRooms",
    description: "Read the Privacy Policy of CheckRooms. Learn how we collect, protect, and process user data.",
    url: `${siteUrl}/privacy-policy`,
    siteName: "CheckRooms",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 lg:pt-40 pb-16 bg-[#F8F9FC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-[#94A3B8] mb-6">
            <Link href="/" className="hover:text-[#6C4CF1] transition-colors flex items-center space-x-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-[#1E2235] font-semibold">Privacy Policy</span>
          </div>

          <div className="space-y-8">
            {/* Title */}
            <div className="text-center space-y-3">
              <h1 className="font-poppins font-black text-3xl sm:text-4xl text-[#1E2235] tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto font-medium">
                Last updated: July 16, 2026. Learn how CheckRooms collects, uses, protects, and discloses your personal data.
              </p>
            </div>

            {/* Core Content Layout */}
            <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#ECECEC] shadow-[0px_4px_24px_rgba(0,0,0,0.02)] space-y-8 text-left">
              
              {/* Introduction */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Shield className="w-6 h-6 fill-[#6C4CF1]/10" />
                  <h2 className="font-poppins font-bold text-xl text-[#1E2235]">
                    1. Introduction & Overview
                  </h2>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  Welcome to CheckRooms. We respect your privacy and want you to understand how we handle your information. This Privacy Policy applies to our website, mobile interface, and any services offered under the CheckRooms brand.
                </p>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  By using our platform to search for rooms, PG accommodations, hostels, or listing your property, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Information We Collect */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Lock className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    2. Information We Collect
                  </h3>
                </div>
                
                <div className="space-y-3 pl-1">
                  <h4 className="font-poppins font-bold text-sm text-[#1E2235]">
                    A. Information You Provide Directly:
                  </h4>
                  <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                    <li><strong>Account Registration Details:</strong> When you list properties, we collect your name, phone number, WhatsApp configuration URL, and email address.</li>
                    <li><strong>Property Information:</strong> If you list a room, PG, or hostel, we collect detailed property descriptions, rent amounts, city, area location coordinates, amenities list, and uploaded photos.</li>
                    <li><strong>Communications:</strong> Any message, inquiry, or feedback you submit directly via contact nodes or support channels.</li>
                  </ul>
                </div>

                <div className="space-y-3 pl-1 pt-2">
                  <h4 className="font-poppins font-bold text-sm text-[#1E2235]">
                    B. Information Collected Automatically:
                  </h4>
                  <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                    <li><strong>Usage Data:</strong> We track your interactions on the site (e.g., search queries, active category filters, properties saved to your favorites, clicks, and page transitions).</li>
                    <li><strong>Location Information:</strong> We store selected cities (like Greater Noida, Noida, Delhi) to deliver filtered regional content.</li>
                    <li><strong>Device & Log Data:</strong> Technical logs containing IP addresses, browser specs, operating systems, and timestamp operations.</li>
                  </ul>
                </div>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* How We Use Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Eye className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    3. How We Use Your Information
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  CheckRooms uses the collected data to provide a seamless search and listing experience. Specifically, we use information:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                  <li>To verify listings and verify owner identities for trust & safety.</li>
                  <li>To establish direct contact channels (via Phone calls or pre-configured WhatsApp chat templates) between prospective tenants and hosts.</li>
                  <li>To remember your preferences, like displaying your saved properties instantly using localized storage systems.</li>
                  <li>To monitor technical performance, resolve bugs, and enhance website interface responsiveness.</li>
                  <li>To display contextual, relevant rental alerts and sponsored native advertising modules.</li>
                </ul>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Data Sharing */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <UserCheck className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    4. Information Sharing & Third Parties
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  We believe in zero-brokerage transparency. We protect your data and do not engage in selling or leasing user databases.
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                  <li><strong>Public Listings:</strong> Property details, owner names, phone numbers, and WhatsApp links you submit are visible publicly to help potential tenants contact you directly.</li>
                  <li><strong>Legal Compliance:</strong> We may disclose data if legally required by government authorities, court warrants, or to protect the safety and rights of other platform users.</li>
                </ul>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Cookies & Storage */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Settings className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    5. Cookies & Local Browser Storage
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  We use cookies and browser <code>localStorage</code> (such as storing favorite IDs under key <code>saved_listings</code>) to persist user state and configurations. This avoids requiring you to log in repeatedly to see saved listings. You can clear your browser storage or reject cookies at any time, but some features might not function correctly.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Security */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Lock className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    6. Security Protocols
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  We utilize commercial-grade security protocols (SSL/HTTPS encryption) to protect data transmitted over our portal. However, please remember that no system on the internet is completely impregnable. Ensure you do not share sensitive financial information on public listing chats.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Contact Us Box */}
              <div className="bg-[#F0EDFF]/50 border border-[#6C4CF1]/10 rounded-2xl p-5 sm:p-6 space-y-2.5">
                <h4 className="font-poppins font-bold text-sm text-[#1E2235] flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-[#6C4CF1]" />
                  Need Privacy Support?
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
                  If you have any questions about this Privacy Policy, wish to request account deletion, or want to verify what data is stored on our systems, please write to us at:
                </p>
                <a href="mailto:privacy@checkrooms.com" className="text-sm font-bold text-[#6C4CF1] hover:underline block w-fit pt-0.5">
                  privacy@checkrooms.com
                </a>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}
