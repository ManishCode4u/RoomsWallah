import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Standardize error payload, masking code callstacks and internal details in production
  const message = err.message || "An unexpected server error occurred";

  console.error(`❌ [Error]: ${new Date().toISOString()} - Request: ${req.method} ${req.originalUrl} - Stack:`, err);

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack
  });
};
