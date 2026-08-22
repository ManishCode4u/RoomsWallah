import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/data/api";
import PropertyDetailsView from "@/components/property-details-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProperty(id: string) {
  try {
    const res = await fetch(getApiUrl(`/api/listings/${id}`), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        return {
          ...data,
          id: data._id || data.id
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
    notFound();
  }

  return (
    <PropertyDetailsView 
      property={property} 
      backHref="/flats" 
      categoryLabel="Flats for Rent" 
    />
  );
}
