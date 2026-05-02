import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

export type JwtPayload = {
  userId: number;
  email: string;
  username: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
