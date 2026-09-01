import type { Metadata, Viewport } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "CheckRooms",
  title: {
    default: "CheckRooms – Find Rooms, Flats, PGs & Hostels Near You (Zero Brokerage)",
    template: "%s | CheckRooms",
  },
  description: "Find verified rooms, flats, PGs, and hostels with zero brokerage on CheckRooms. Explore 1000+ budget-friendly accommodations with direct owner contact and genuine photos.",
  keywords: [
    "rooms for rent",
    "pg near me",
    "hostels for students",
    "flats for rent",
    "single room rent",
    "shared room rent",
    "roommate finder",
    "rooms in greater noida",
    "rooms in noida",
    "rooms in delhi ncr",
    "zero brokerage rooms",
    "student accommodation india",
    "paying guest",
    "checkrooms"
  ],
  authors: [{ name: "CheckRooms Team", url: siteUrl }],
  creator: "CheckRooms Team",
  publisher: "CheckRooms",
  category: "Real Estate & Rental Accommodation",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "CheckRooms – Find Rooms, Flats, PGs & Hostels Near You (Zero Brokerage)",
    description: "Find verified rooms, flats, PGs, and hostels with zero brokerage on CheckRooms. Connect directly with verified property owners.",
    url: "./",
    siteName: "CheckRooms",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/assets/logo.png`,
        width: 512,
        height: 512,
        alt: "CheckRooms - Verified Rentals & Student Accommodations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheckRooms – Find Rooms, Flats, PGs & Hostels Near You",
    description: "Find verified rooms, flats, PGs, and hostels with zero brokerage on CheckRooms. Connect directly with verified property owners.",
    site: "@checkrooms",
    creator: "@checkrooms",
    images: [`${siteUrl}/assets/logo.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6C4CF1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
