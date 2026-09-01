import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CheckRooms - Verified Rentals & Accommodations",
    short_name: "CheckRooms",
    description: "Find verified rooms, flats, PGs, and hostels with zero brokerage on CheckRooms.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6C4CF1",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
