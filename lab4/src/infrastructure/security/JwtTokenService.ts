import jwt from "jsonwebtoken";
import { TokenPayload, TokenService } from "../../application/ports/TokenService";
import { AuthenticationError } from "../../domain/errors/DomainError";

const SECRET = process.env.JWT_SECRET || "secret";

export class JwtTokenService implements TokenService {
  sign(payload: TokenPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: "1d" });
  }

  verify(token: string): TokenPayload {
    try {
      return jwt.verify(token, SECRET) as TokenPayload;
    } catch {
      throw new AuthenticationError("Invalid token");
    }
  }
}
