import { Request, Response, NextFunction } from "express";
import {
  AuthenticationError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../domain/errors/DomainError";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof AuthenticationError) return res.status(401).json({ error: err.message });
  if (err instanceof ForbiddenError) return res.status(403).json({ error: err.message });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof ConflictError) return res.status(409).json({ error: err.message });
  if (err instanceof DomainError) return res.status(400).json({ error: err.message });

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
