// src/auth/admin.middleware.ts
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error";

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const user = (req as any).user;

  if (!user || user.username?.toLowerCase() !== "admin") {
    throw new AppError(403, "Forbidden");
  }

  next();
}