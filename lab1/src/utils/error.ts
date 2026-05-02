// src/utils/error.ts
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);

  return res.status(500).json({
    error: "Internal server error",
  });
}