import { prisma } from "../prisma";
import { AppError } from "../utils/error";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export class AuthService {
  async register(email: string, password: string, username: string) {
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError(409, "User already exists");
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        email,
        Username: username,
        password_hash,
      },
      select: {
        ID: true,
        Username: true,
        email: true,
        Balance: true,
        DateJoined: true,
        RestrictionType: true,
        RestrictedUntil: true,
        RestrictionReason: true,
        Archive: true,
        Version: true,
      },
    });

    const token = signToken({
      userId: user.ID,
      email: user.email,
      username: user.Username,
    });

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = signToken({
      userId: user.ID,
      email: user.email,
      username: user.Username,
    });

    return {
      user: {
        ID: user.ID,
        Username: user.Username,
        email: user.email,
        Balance: user.Balance,
        DateJoined: user.DateJoined,
        RestrictionType: user.RestrictionType,
        RestrictedUntil: user.RestrictedUntil,
        RestrictionReason: user.RestrictionReason,
        Archive: user.Archive,
        Version: user.Version,
      },
      token,
    };
  }
}