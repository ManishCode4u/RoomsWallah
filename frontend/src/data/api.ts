/**
 * Dynamically resolves the API base URL.
 * In a browser, it uses the current host's IP/domain to connect to port 5000,
 * which enables testing on physical mobile devices connected to the same Wi-Fi network.
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return cleanPath;
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  return `${backendUrl}${cleanPath}`;
};

/**
 * Dynamically resolves listing image URLs for local development.
 * If an image was saved with "http://localhost:5000/uploads/...", it replaces
 * "localhost" with the current client hostname so it renders on mobile devices.
 */
export const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://localhost:5000/")) {
    return url.replace("http://localhost:5000/", "/");
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  if (url.startsWith(`${backendUrl}/`)) {
    return url.replace(`${backendUrl}/`, "/");
  }
  if (url.startsWith("/uploads/")) {
    return url;
  }
  return url;
};
