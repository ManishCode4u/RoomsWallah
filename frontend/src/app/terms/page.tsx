import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle, Scale, Home, Mail, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for RoomsWallah. Understand our platform rules, owner guidelines, tenant policies, and account terms.",
};

export default function TermsPage() {
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
            <span className="text-[#1E2235] font-semibold">Terms of Service</span>
          </div>

          <div className="space-y-8">
            {/* Title */}
            <div className="text-center space-y-3">
              <h1 className="font-poppins font-black text-3xl sm:text-4xl text-[#1E2235] tracking-tight">
                Terms of Service
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto font-medium">
                Last updated: July 16, 2026. Please review these rules before listing or searching on RoomsWallah.
              </p>
            </div>

            {/* Core Content Layout */}
            <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#ECECEC] shadow-[0px_4px_24px_rgba(0,0,0,0.02)] space-y-8 text-left">
              
              {/* Acceptance of Terms */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <FileText className="w-6 h-6 fill-[#6C4CF1]/10" />
                  <h2 className="font-poppins font-bold text-xl text-[#1E2235]">
                    1. Acceptance of Terms & Services
                  </h2>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  By accessing, browsing, or using the RoomsWallah portal (including category filters, details view, property listings, and welcome listings), you agree to comply with and be bound by these Terms of Service. If you do not accept these guidelines, you must immediately terminate use of our platform.
                </p>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  We reserve the right to modify these terms at any time. Changes will be posted here and take effect immediately. Continued usage constitutes your consent to the changes.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Zero Brokerage Discovery Platform */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Award className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    2. Discovery Only (Zero-Brokerage Model)
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  RoomsWallah functions solely as an online directory/discovery portal connecting tenants (students & professionals) with property hosts.
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                  <li><strong>No Commission:</strong> We do not charge brokers&apos; fees or match-making percentages from either hosts or tenants.</li>
                  <li><strong>Direct Communications:</strong> All communications, rental negotiations, agreements, and payment deposits are handled directly between hosts and tenants.</li>
                  <li><strong>No Financial Transactions:</strong> RoomsWallah does not process monthly rent, secure deposits, or manage escrow balances.</li>
                </ul>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Listing Rules */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <FileSpreadsheet className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    3. Property Listings & Accuracy Obligations
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  If you list a property under our Room, PG, or Hostel listings, you represent and warrant that:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                  <li>You have the legal authority to rent out the property.</li>
                  <li>All descriptions, prices, location coordinates, amenities, and photos are authentic and correct.</li>
                  <li>You will not upload deceptive pictures or state incorrect amenities.</li>
                  <li>The listed rent is in Indian Rupees (INR) and matches the actual amount requested.</li>
                </ul>
                <p className="text-xs text-[#94A3B8] font-bold">
                  *RoomsWallah reserves the right to delete, edit, or disable listings reported by users or flagged by validation algorithms.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Verification Disclaimer */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <ShieldAlert className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    4. Verified Badge Disclaimer
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  Some listings carry a <code>Verified Property</code> badge. While we make commercial attempts to verify information (contacting owners, performing basic checks), this badge does not constitute an endorsement, survey, structural report, or guarantee of property safety. Users must physically inspect properties and sign legal rent agreements before transferring security deposits.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* User Conduct */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <CheckCircle className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    5. Rules of Conduct
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  You agree NOT to use RoomsWallah to:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#64748B] space-y-2 font-medium">
                  <li>Harass other tenants or owners, or post discriminatory listing descriptions.</li>
                  <li>Attempt to scrape listings, reverse engineer platform assets, or overwhelm systems with automated request patterns.</li>
                  <li>Impersonate brand personnel, verified landlords, or other tenants.</li>
                </ul>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Limitation of Liability */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 text-[#6C4CF1]">
                  <Scale className="w-5.5 h-5.5" />
                  <h3 className="font-poppins font-bold text-lg text-[#1E2235]">
                    6. Limitation of Liability & Indemnity
                  </h3>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  RoomsWallah, its founders, and its team members will not be liable for any direct, indirect, incidental, or consequential damages resulting from transactions, tenant-landlord disputes, structural failures, security issues at property premises, or loss of deposit balances. You agree to indemnify RoomsWallah from any legal claims, liabilities, or expenses.
                </p>
              </div>

              <hr className="border-[#F0F2F5]" />

              {/* Support Info Box */}
              <div className="bg-[#F0EDFF]/50 border border-[#6C4CF1]/10 rounded-2xl p-5 sm:p-6 space-y-2.5">
                <h4 className="font-poppins font-bold text-sm text-[#1E2235] flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-[#6C4CF1]" />
                  Terms & Legals Inquiry?
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
                  If you wish to report a listing that violates our Terms of Service, require help with copyright notices, or need clarification on platform rules, please write to:
                </p>
                <a href="mailto:support@roomswallah.com" className="text-sm font-bold text-[#6C4CF1] hover:underline block w-fit pt-0.5">
                  support@roomswallah.com
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
