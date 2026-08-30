/**
 * Dynamically resolves the API base URL.
 * Connects directly to the backend URL (Render in production, localhost:5000 in development).
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  let backendUrl = "https://roomswallah-backend.onrender.com";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
      backendUrl = "http://localhost:5000";
    }
  } else {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const isCloudEnv = process.env.VERCEL === "1" || process.env.RENDER === "true" || process.env.NETLIFY === "true";
    if (envUrl && (!envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") || !isCloudEnv)) {
      backendUrl = envUrl;
    } else {
      backendUrl = "https://roomswallah-backend.onrender.com";
    }
  }
  
  // Normalize by removing trailing slash(es)
  backendUrl = backendUrl.replace(/\/+$/, "");
  
  return `${backendUrl}${cleanPath}`;
};

/**
 * Dynamically resolves listing image URLs for local development and production.
 */
export const getImageUrl = (url: string): string => {
  if (!url) return "";
  
  let backendUrl = "https://roomswallah-backend.onrender.com";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
      backendUrl = "http://localhost:5000";
    }
  } else {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const isCloudEnv = process.env.VERCEL === "1" || process.env.RENDER === "true" || process.env.NETLIFY === "true";
    if (envUrl && (!envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") || !isCloudEnv)) {
      backendUrl = envUrl;
    } else {
      backendUrl = "https://roomswallah-backend.onrender.com";
    }
  }

  // Normalize by removing trailing slash(es)
  backendUrl = backendUrl.replace(/\/+$/, "");

  if (url.startsWith("http://localhost:5000/") || url.startsWith(`${backendUrl}/`)) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${backendUrl}${url}`;
  }
  return url;
};
