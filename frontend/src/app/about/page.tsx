import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, Heart, Home } from "lucide-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  title: "About Us - Our Mission & Story | CheckRooms",
  description: "Learn more about CheckRooms, our mission, vision, and how we empower students and tenants across India to find rooms, flats, PGs, and hostels with zero brokerage.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About Us - Our Mission & Story | CheckRooms",
    description: "Learn more about CheckRooms, our mission, vision, and how we empower students and tenants across India.",
    url: `${siteUrl}/about`,
    siteName: "CheckRooms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | CheckRooms",
    description: "Learn more about CheckRooms, our mission, vision, and how we empower students and tenants.",
  },
};

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About CheckRooms",
    "description": "Learn more about CheckRooms, our mission, vision, and how we empower students and tenants across India to find rooms, flats, PGs, and hostels with zero brokerage.",
    "url": `${siteUrl}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "CheckRooms",
      "url": siteUrl,
      "logo": `${siteUrl}/assets/logo.png`,
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Navbar />

      <main className="flex-grow pt-32 lg:pt-40 pb-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-muted mb-6">
            <Link href="/" className="hover:text-primary flex items-center space-x-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">About Us</span>
          </div>

          <div className="space-y-12">
            {/* Title */}
            <div className="text-center space-y-3">
              <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-foreground">
                About CheckRooms
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-xl mx-auto">
                Discover the story behind CheckRooms and our promise to simplify living.
              </p>
            </div>

            {/* Startup Story Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-4">
              <div className="flex items-center space-x-2.5 text-primary">
                <Heart className="w-6 h-6 fill-primary/10" />
                <h2 className="font-poppins font-bold text-xl text-foreground">
                  Our Startup Story
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                CheckRooms was founded by a group of former college students who experienced firsthand the immense frustration of finding quality off-campus housing. Between brokers charging exorbitant commissions, misleading photos, and outdated search tools, finding a room felt like a full-time chore.
              </p>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                We realized there had to be a better, cleaner, and modern way. CheckRooms was born to bridge the gap—giving students and young working professionals direct access to verified spaces near universities and IT hubs, completely commission-free and broker-free.
              </p>
            </div>

            {/* Mission & Vision Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Mission */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-foreground">
                  Our Mission
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  To empower students and early-career professionals by offering premium, budget-friendly living spaces without any broker interference. We strive to bring complete transparency to the room rental process.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-foreground">
                  Our Vision
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  To become India&apos;s most trusted rental discovery network, redefining how the next generation discovers housing, plans moves, and interacts with home owners.
                </p>
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
