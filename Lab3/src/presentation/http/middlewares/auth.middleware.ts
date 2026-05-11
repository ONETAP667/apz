import { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../../../domain/errors/DomainError";
import { TokenPayload } from "../../../application/ports/TokenService";
import { container } from "../../../composition/container";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AuthenticationError("Unauthorized");
  }
  const token = header.split(" ")[1];
  req.user = container.tokens.verify(token);
  next();
}
