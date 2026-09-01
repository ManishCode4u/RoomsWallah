import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  title: "1BHK, 2BHK & 3BHK Flats for Rent - Zero Brokerage",
  description: "Discover verified 1BHK, 2BHK, and 3BHK flats and apartments for rent. Furnished and semi-furnished apartments directly from owners on CheckRooms.",
  keywords: [
    "flats for rent",
    "1bhk for rent",
    "2bhk for rent",
    "3bhk flat rent",
    "apartments for rent",
    "furnished flats",
    "flats in greater noida",
    "flats in noida",
    "flats in delhi"
  ],
  alternates: {
    canonical: `${siteUrl}/flats`,
  },
  openGraph: {
    title: "1BHK, 2BHK & 3BHK Flats for Rent | CheckRooms",
    description: "Discover verified 1BHK, 2BHK, and 3BHK flats and apartments for rent directly from owners.",
    url: `${siteUrl}/flats`,
    siteName: "CheckRooms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1BHK, 2BHK & 3BHK Flats for Rent | CheckRooms",
    description: "Discover verified 1BHK, 2BHK, and 3BHK flats and apartments for rent directly from owners.",
  },
};

export default function FlatsLayout({
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
        "name": "Flats & Apartments",
        "item": `${siteUrl}/flats`
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
