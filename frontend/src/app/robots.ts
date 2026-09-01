import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/rooms", "/flats", "/pg", "/hostels", "/privacy-policy", "/terms"],
        disallow: [
          "/admin",
          "/welcome/dashboard",
          "/welcome/user-dashboard",
          "/api/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/about", "/rooms", "/flats", "/pg", "/hostels", "/privacy-policy", "/terms"],
        disallow: ["/admin", "/welcome/dashboard", "/welcome/user-dashboard", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

