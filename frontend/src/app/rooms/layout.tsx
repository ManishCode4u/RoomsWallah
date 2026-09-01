import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  title: "Rooms for Rent - Single & Shared Rooms with Zero Brokerage",
  description: "Browse verified single, double, and shared rooms for rent near top colleges and IT parks. Direct contact with property owners with zero brokerage on CheckRooms.",
  keywords: [
    "rooms for rent",
    "single room for rent",
    "shared room for rent",
    "budget rooms",
    "rooms near me",
    "rooms in greater noida",
    "rooms in noida",
    "rooms in delhi",
    "student room rent"
  ],
  alternates: {
    canonical: `${siteUrl}/rooms`,
  },
  openGraph: {
    title: "Rooms for Rent - Single & Shared Rooms | CheckRooms",
    description: "Browse verified single, double, and shared rooms for rent near top colleges and IT parks with zero brokerage.",
    url: `${siteUrl}/rooms`,
    siteName: "CheckRooms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rooms for Rent - Zero Brokerage | CheckRooms",
    description: "Browse verified single, double, and shared rooms for rent with zero brokerage.",
  },
};

export default function RoomsLayout({
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
        "name": "Rooms for Rent",
        "item": `${siteUrl}/rooms`
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
