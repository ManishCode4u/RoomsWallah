/**
 * Dynamically resolves the API base URL.
 * Connects directly to the backend URL (Render in production, localhost:5000 in development).
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  return `${backendUrl}${cleanPath}`;
};

/**
 * Dynamically resolves listing image URLs for local development and production.
 */
export const getImageUrl = (url: string): string => {
  if (!url) return "";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  if (url.startsWith("http://localhost:5000/") || url.startsWith(`${backendUrl}/`)) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${backendUrl}${url}`;
  }
  return url;
};
