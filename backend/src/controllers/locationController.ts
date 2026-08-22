import { Request, Response } from "express";

// @desc    Reverse geocode coordinates to matching RoomsWallah city
// @route   GET /api/location/reverse
// @access  Public
export const reverseGeocode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res.status(400).json({ message: "Latitude (lat) and Longitude (lon) are required query parameters." });
      return;
    }

    // Call OpenStreetMap Nominatim API server-side
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "RoomsWallah-API"
      }
    });

    if (!response.ok) {
      res.status(502).json({ message: "Geocoding service returned an error" });
      return;
    }

    const data: any = await response.json();
    const address = data.address || {};
    const detectedCity = address.city || address.town || address.city_district || address.municipality || address.state_district || address.suburb || "";
    const detectedArea = address.suburb || address.neighbourhood || address.road || address.industrial || address.commercial || "";
    
    let matchedCity = "Greater Noida"; // Default fallback
    const cityLower = detectedCity.toLowerCase();
    
    if (cityLower.includes("greater noida")) {
      matchedCity = "Greater Noida";
    } else if (cityLower.includes("noida")) {
      matchedCity = "Noida";
    } else if (cityLower.includes("delhi") || cityLower.includes("new delhi")) {
      matchedCity = "Delhi";
    } else if (cityLower.includes("gurgaon") || cityLower.includes("gurugram")) {
      matchedCity = "Gurugram";
    } else if (detectedCity) {
      matchedCity = detectedCity;
    }

    res.status(200).json({
      detectedCity,
      matchedCity,
      area: detectedArea,
      state: address.state || "",
      pincode: address.postcode || "",
      displayName: data.display_name || "",
      coordinates: { lat, lon }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server Error reverse geocoding location", 
      error: (error as Error).message 
    });
  }
};

// @desc    Search locations using OpenStreetMap Nominatim
// @route   GET /api/location/search
// @access  Public
export const searchLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || !String(q).trim()) {
      res.status(200).json([]);
      return;
    }

    const queryClean = encodeURIComponent(String(q).trim());
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${queryClean}&addressdetails=1&limit=8&countrycodes=in`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "RoomsWallah-API"
      }
    });

    if (!response.ok) {
      res.status(502).json({ message: "Geocoding search service returned an error" });
      return;
    }

    const data: any = await response.json();
    
    // Process and format suggestions
    const suggestions = data.map((item: any) => {
      const addr = item.address || {};
      
      // Determine city
      const city = addr.city || addr.town || addr.city_district || addr.municipality || addr.state_district || "";
      
      // Determine area/locality (road, suburb, neighbourhood, industrial, etc.)
      const area = addr.suburb || addr.neighbourhood || addr.road || addr.industrial || addr.commercial || addr.village || "";
      
      const state = addr.state || "";
      const pincode = addr.postcode || "";
      
      // Format a clean display name, e.g., "Knowledge Park III, Greater Noida, Uttar Pradesh"
      const parts = [];
      if (area) parts.push(area);
      if (city && city !== area) parts.push(city);
      if (state) parts.push(state);
      
      const displayName = parts.join(", ");

      return {
        displayName: displayName || item.display_name,
        city: city || displayName,
        area: area,
        state: state,
        pincode: pincode,
        lat: item.lat,
        lon: item.lon
      };
    });

    // Remove duplicates based on displayName
    const uniqueSuggestions = suggestions.filter((value: any, index: number, self: any[]) =>
      self.findIndex((t) => t.displayName === value.displayName) === index
    );

    res.status(200).json(uniqueSuggestions);
  } catch (error) {
    res.status(500).json({
      message: "Server Error searching locations",
      error: (error as Error).message
    });
  }
};
