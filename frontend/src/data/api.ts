/**
 * Dynamically resolves the API base URL.
 * Connects directly to the backend URL (Render in production, localhost:5000 / network IP:5000 in development).
 */
function isValidBackendUrl(url: string | undefined): boolean {
  if (!url) return false;
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    return false;
  }
  if (url.includes("github.com") || url.includes("git")) {
    return false;
  }
  return true;
}

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  let backendUrl = "https://roomswallah-backend.onrender.com";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      backendUrl = `http://${hostname}:5000`;
    }
  } else {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (isValidBackendUrl(envUrl)) {
      backendUrl = envUrl!;
    } else {
      backendUrl = "https://roomswallah-backend.onrender.com";
    }
  }
  
  // Normalize by removing trailing slash(es)
  backendUrl = backendUrl.replace(/\/+$/, "");
  
  return `${backendUrl}${cleanPath}`;
};

/**
 * Dynamically resolves listing image URLs for local development, mobile testing, and production.
 */
export const getImageUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80";
  }
  
  const trimmed = url.trim();

  // If already an absolute HTTP/HTTPS URL (e.g. Cloudinary, Unsplash, external CDN)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If already a local frontend asset in /assets/ or /
  if (trimmed.startsWith("/assets/") || trimmed.startsWith("assets/")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  let backendUrl = "https://roomswallah-backend.onrender.com";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      backendUrl = `http://${hostname}:5000`;
    }
  } else {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (isValidBackendUrl(envUrl)) {
      backendUrl = envUrl!;
    } else {
      backendUrl = "https://roomswallah-backend.onrender.com";
    }
  }

  // Normalize by removing trailing slash(es)
  backendUrl = backendUrl.replace(/\/+$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${backendUrl}${cleanPath}`;
};
