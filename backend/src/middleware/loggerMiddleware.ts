import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
    
    // Safely clone and sanitize request body to prevent credential leakage in logs
    const sanitizedBody = req.body ? { ...req.body } : {};
    if (sanitizedBody.password) sanitizedBody.password = "[FILTERED]";
    if (sanitizedBody.token) sanitizedBody.token = "[FILTERED]";
    if (sanitizedBody.admin_token) sanitizedBody.admin_token = "[FILTERED]";
    if (sanitizedBody.owner_token) sanitizedBody.owner_token = "[FILTERED]";
    
    const bodyStr = Object.keys(sanitizedBody).length > 0 ? JSON.stringify(sanitizedBody) : "";

    console.log(
      `📡 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) - IP: ${ip} ${bodyStr ? `| Body: ${bodyStr}` : ""}`
    );
  });

  next();
};
