import { prisma } from "../prisma";
import { AppError } from "../utils/error";
import {
  validateUsername,
  validateEmail,
  validateBalance,
} from "./users.validation";

export class UsersService {
  async getAll() {
    return prisma.users.findMany({
      select: {
        ID: true,
        Username: true,
        Balance: true,
        DateJoined: true,
        RestrictionType: true,
        RestrictedUntil: true,
        RestrictionReason: true,
        Archive: true,
        Version: true,
        email: true,
      },
    });
  }

  async getById(id: number) {
    const user = await prisma.users.findUnique({
      where: { ID: id },
      select: {
        ID: true,
        Username: true,
        Balance: true,
        DateJoined: true,
        RestrictionType: true,
        RestrictedUntil: true,
        RestrictionReason: true,
        Archive: true,
        Version: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }

  async update(
    id: number,
    data: {
      Username?: string;
      email?: string;
      Balance?: number;
      Archive?: boolean;
    }
  ) {
    const existing = await prisma.users.findUnique({
      where: { ID: id },
    });

    if (!existing) {
      throw new AppError(404, "User not found");
    }

    if (data.Username !== undefined) {
      validateUsername(data.Username);
    }

    if (data.email !== undefined) {
      validateEmail(data.email);
    }

    if (data.Balance !== undefined) {
      validateBalance(data.Balance);
    }

    if (data.email && data.email !== existing.email) {
      const userWithSameEmail = await prisma.users.findUnique({
        where: { email: data.email },
      });

      if (userWithSameEmail) {
        throw new AppError(409, "Email already in use");
      }
    }

    return prisma.users.update({
      where: { ID: id },
      data,
      select: {
        ID: true,
        Username: true,
        Balance: true,
        DateJoined: true,
        RestrictionType: true,
        RestrictedUntil: true,
        RestrictionReason: true,
        Archive: true,
        Version: true,
        email: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await prisma.users.findUnique({
      where: { ID: id },
    });

    if (!existing) {
      throw new AppError(404, "User not found");
    }

    await prisma.users.update({
      where: { ID: id },
      data: { Archive: true },
    });

    return { message: "User archived" };
  }
}