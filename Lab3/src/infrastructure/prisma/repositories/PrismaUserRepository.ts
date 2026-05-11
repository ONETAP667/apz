import { User } from "../../../domain/users/User";
import { UserRepository } from "../../../domain/users/UserRepository";
import { Email } from "../../../domain/users/value-objects/Email";
import { prisma } from "../prisma";
import { UserMapper } from "../mappers/UserMapper";

const publicSelect = {
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
  password_hash: true,
};

export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const rows = await prisma.users.findMany({
      select: publicSelect,
    });

    return rows.map(UserMapper.toDomain);
  }

  async findById(id: number): Promise<User | null> {
    const row = await prisma.users.findUnique({
      where: { ID: id },
      select: publicSelect,
    });

    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await prisma.users.findUnique({
      where: { email: email.toString() },
      select: publicSelect,
    });

    return row ? UserMapper.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    if (!data.password_hash) {
      throw new Error("Cannot create user without password_hash");
    }

    const row = await prisma.users.create({
      data: {
        Username: data.Username,
        email: data.email,
        Balance: data.Balance,
        RestrictionType: data.RestrictionType,
        RestrictedUntil: data.RestrictedUntil,
        RestrictionReason: data.RestrictionReason,
        Archive: data.Archive,
        Version: data.Version,
        password_hash: data.password_hash,
      },
      select: publicSelect,
    });

    return UserMapper.toDomain(row);
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error("Cannot update user without id");
    }

    const data = UserMapper.toPersistence(user);

    const row = await prisma.users.update({
      where: { ID: user.id },
      data: {
        Username: data.Username,
        email: data.email,
        Balance: data.Balance,
        RestrictionType: data.RestrictionType,
        RestrictedUntil: data.RestrictedUntil,
        RestrictionReason: data.RestrictionReason,
        Archive: data.Archive,
        Version: data.Version,
        ...(data.password_hash
          ? { password_hash: data.password_hash }
          : {}),
      },
      select: publicSelect,
    });

    return UserMapper.toDomain(row);
  }
}