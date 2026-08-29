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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roomswallah.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RoomsWallah – Find Rooms, Flats, PGs & Hostels Near You",
    template: "%s | RoomsWallah",
  },
  description: "Find rooms, flats, PGs and hostels near you on RoomsWallah. Browse property listings, explore locations and connect directly with property owners.",
  keywords: ["rooms", "flats", "pg", "hostels", "rentals", "roommate finder", "student accommodation", "rooms near me"],
  authors: [{ name: "RoomsWallah Team" }],
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "RoomsWallah – Find Rooms, Flats, PGs & Hostels Near You",
    description: "Find rooms, flats, PGs and hostels near you on RoomsWallah. Browse property listings, explore locations and connect directly with property owners.",
    url: "./",
    siteName: "RoomsWallah",
    images: [
      {
        url: `${siteUrl}/assets/logo.png`,
        width: 512,
        height: 512,
        alt: "RoomsWallah Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoomsWallah – Find Rooms, Flats, PGs & Hostels Near You",
    description: "Find rooms, flats, PGs and hostels near you on RoomsWallah. Browse property listings, explore locations and connect directly with property owners.",
    images: [`${siteUrl}/assets/logo.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
