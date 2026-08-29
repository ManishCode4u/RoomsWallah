import { MetadataRoute } from "next";
import { getApiUrl } from "@/data/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roomswallah.vercel.app";

  // Base routes
  const routes = [
    "",
    "/about",
    "/privacy-policy",
    "/terms",
    "/rooms",
    "/flats",
    "/pg",
    "/hostels",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch properties dynamically from backend API for dynamic routes
  try {
    const res = await fetch(getApiUrl("/api/listings"), { cache: "no-store" });
    if (res.ok) {
      const listings = await res.json();
      if (Array.isArray(listings)) {
        const propertyRoutes = listings
          .filter((prop: any) => prop.listingStatus === "active")
          .map((prop: any) => {
            const typePath = (prop.type || "").toLowerCase();
            const category = typePath === "room" ? "rooms" : typePath === "hostel" ? "hostels" : typePath === "flat" ? "flats" : "pg";
            const id = prop._id || prop.id;
            return {
              url: `${siteUrl}/${category}/${id}`,
              lastModified: new Date(prop.updatedAt || prop.createdAt || new Date()),
              changeFrequency: "weekly" as const,
              priority: 0.6,
            };
          });
        return [...routes, ...propertyRoutes];
      }
    }
  } catch (err) {
    console.error("Failed to fetch listings for sitemap.ts:", err);
  }

  return routes;
}
