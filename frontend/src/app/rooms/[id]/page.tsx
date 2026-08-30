import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/data/api";

import PropertyDetailsView from "@/components/property-details-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProperty(id: string) {
  const url = getApiUrl(`/api/listings/${id}`);
  console.log(`[rooms-[id]] Fetching URL: "${url}"`);
  try {
    const res = await fetch(url, { cache: "no-store" });
    console.log(`[rooms-[id]] Response status: ${res.status}, ok: ${res.ok}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        return {
          ...data,
          id: data._id || data.id
        };
      }
    } else {
      try {
        const text = await res.text();
        console.log(`[rooms-[id]] Error response body: ${text.substring(0, 200)}`);
      } catch (e) {}
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
      title: "Property Not Found",
    };
  }

  const title = `${property.title} in ${property.area}, ${property.city}`;
  const description = property.description || `Rent ${property.sharing || ""} ${property.type} at ₹${property.rent}/month on RoomsWallah.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.image ? [{ url: property.image }] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    const url = getApiUrl(`/api/listings/${id}`);
    return (
      <div className="p-10 text-center space-y-4 bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-red-400">Debug Listing Fetch Error</h1>
        <p className="text-slate-300">Listing ID: <code className="bg-slate-800 px-2 py-1 rounded">{id}</code></p>
        <p className="text-slate-300">Resolved API URL: <code className="bg-slate-800 px-2 py-1 rounded">{url}</code></p>
        <p className="text-slate-300">NODE_ENV: <code className="bg-slate-800 px-2 py-1 rounded">{process.env.NODE_ENV}</code></p>
        <p className="text-slate-300">NEXT_PUBLIC_BACKEND_URL: <code className="bg-slate-800 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_BACKEND_URL || "undefined"}</code></p>
      </div>
    );
  }

  return (
    <PropertyDetailsView 
      property={property} 
      backHref="/rooms" 
      categoryLabel="Rooms for Rent" 
    />
  );
}
