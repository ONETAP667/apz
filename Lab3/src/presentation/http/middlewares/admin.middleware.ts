import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../../../domain/errors/DomainError";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const username = req.user?.username;

  // Admin account is created during database deployment by sql/add_start_data.sql.
  // Keep the check compatible with the latest Lab 1 behavior.
  if (!username || username.toLowerCase() !== "admin") {
    throw new ForbiddenError("Forbidden");
  }

  next();
}
