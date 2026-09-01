import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/data/api";
import PropertyDetailsView from "@/components/property-details-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://checkrooms.vercel.app";

async function getProperty(id: string) {
  const url = getApiUrl(`/api/listings/${id}`);
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        return {
          ...data,
          id: data._id || data.id,
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch property details on server:", err);
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  
  if (!property) {
    return {
      title: "Hostel Listing Not Found | CheckRooms",
      robots: { index: false, follow: false },
    };
  }

  const title = `${property.title} in ${property.area}, ${property.city} - Hostel ₹${property.rent}/mo`;
  const description = property.description || `Rent verified student hostel room in ${property.area}, ${property.city} at ₹${property.rent}/month. Mess, security, WiFi included with zero brokerage on CheckRooms.`;
  const canonicalUrl = `${siteUrl}/hostels/${property.id}`;
  const imageUrl = property.image || (Array.isArray(property.images) && property.images[0]) || `${siteUrl}/assets/logo.png`;

  return {
    title,
    description,
    keywords: [
      `hostels in ${property.city}`,
      `hostels near ${property.area}`,
      "student hostel",
      "boys hostel",
      "girls hostel",
      "zero brokerage hostel"
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "CheckRooms",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `${property.title} in ${property.city}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const imageUrl = property.image || (Array.isArray(property.images) && property.images[0]) || `${siteUrl}/assets/logo.png`;

  const hostelJsonLd = {
    "@context": "https://schema.org",
    "@type": "Hostel",
    "name": property.title,
    "description": property.description || `Rent verified hostel accommodation at ₹${property.rent}/month in ${property.area}, ${property.city} on CheckRooms.`,
    "url": `${siteUrl}/hostels/${property.id}`,
    "image": imageUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address || property.area,
      "addressLocality": property.area || property.city,
      "addressRegion": property.city || "Delhi NCR",
      "addressCountry": "IN"
    },
    ...(property.lat && property.lon ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.lat,
        "longitude": property.lon
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "price": property.rent,
      "priceCurrency": "INR",
      "availability": property.listingStatus === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${siteUrl}/hostels/${property.id}`,
      "priceValidUntil": "2027-12-31"
    }
  };

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.title,
        "item": `${siteUrl}/hostels/${property.id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hostelJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PropertyDetailsView 
        property={property} 
        backHref="/hostels" 
        categoryLabel="Hostels for Rent" 
      />
    </>
  );
}
