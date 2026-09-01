import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  title: "Hostels for Students & Working Professionals - Zero Brokerage",
  description: "Explore safe, affordable student and working professional hostels with mess facilities, study zones, high-speed WiFi, and 24/7 security on CheckRooms.",
  keywords: [
    "hostels near me",
    "student hostels",
    "boys hostel",
    "girls hostel",
    "hostels in greater noida",
    "hostels in noida",
    "hostels near colleges"
  ],
  alternates: {
    canonical: `${siteUrl}/hostels`,
  },
  openGraph: {
    title: "Hostels for Students & Professionals | CheckRooms",
    description: "Explore safe, affordable student and working professional hostels with mess and security.",
    url: `${siteUrl}/hostels`,
    siteName: "CheckRooms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hostels for Students & Professionals | CheckRooms",
    description: "Explore safe, affordable student and working professional hostels with mess and security.",
  },
};

export default function HostelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Hostels",
        "item": `${siteUrl}/hostels`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
