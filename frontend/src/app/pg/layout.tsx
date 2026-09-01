import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  title: "PG for Boys & Girls - Verified Paying Guest Accommodations",
  description: "Find fully furnished PG accommodations for boys, girls, and co-living with meals, WiFi, AC, and daily housekeeping on CheckRooms. Zero brokerage.",
  keywords: [
    "pg for boys",
    "pg for girls",
    "paying guest near me",
    "co-living spaces",
    "luxury pg",
    "budget pg",
    "pg in greater noida",
    "pg in noida",
    "pg in delhi"
  ],
  alternates: {
    canonical: `${siteUrl}/pg`,
  },
  openGraph: {
    title: "PG for Boys & Girls - Verified Accommodations | CheckRooms",
    description: "Find fully furnished PG accommodations for boys, girls, and co-living with meals and amenities.",
    url: `${siteUrl}/pg`,
    siteName: "CheckRooms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PG for Boys & Girls - Zero Brokerage | CheckRooms",
    description: "Find fully furnished PG accommodations for boys, girls, and co-living with meals and amenities.",
  },
};

export default function PGLayout({
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
        "name": "PG Accommodations",
        "item": `${siteUrl}/pg`
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
