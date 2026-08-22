import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Owner, { IOwner } from "../models/Owner.js";

export interface AuthenticatedRequest extends Request {
  user: IOwner;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.owner_token;

    // Fallback to Bearer token in headers for development/testing flexibility
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token provided" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Get owner from the database
    const owner = await Owner.findById(decoded.id);
    if (!owner) {
      res.status(401).json({ message: "Not authorized, owner not found" });
      return;
    }

    if (owner.status === "blocked") {
      res.status(403).json({ message: "Access denied. Your account is blocked." });
      return;
    }

    // Attach to request
    (req as any).user = owner;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: "Not authorized, token failed", 
      error: (error as Error).message 
    });
  }
};

export const protectAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "Not authorized, admin token is required" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admin access only." });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({
      message: "Not authorized, admin token failed",
      error: (error as Error).message
    });
  }
};

export const profileCompletedOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  // Automatically allow owner to list properties
  if (!user.profileCompleted) {
    user.profileCompleted = true;
    user.save().catch(() => {});
  }

  next();
};
