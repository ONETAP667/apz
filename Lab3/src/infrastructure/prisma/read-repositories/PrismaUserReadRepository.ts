import { UserReadRepository } from "../../../application/queries/users/UserReadRepository";
import { UserReadModel } from "../../../application/read-models/UserReadModel";
import { prisma } from "../prisma";

export class PrismaUserReadRepository implements UserReadRepository {
  async findAll(): Promise<UserReadModel[]> {
    const rows = await prisma.users.findMany({
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

    return rows.map((row) => ({
      ...row,
      RestrictionType: row.RestrictionType ?? null,
      RestrictedUntil: row.RestrictedUntil ?? null,
      RestrictionReason: row.RestrictionReason ?? null,
      Archive: row.Archive ?? false,
    }));
  }

  async findById(id: number): Promise<UserReadModel | null> {
    const row = await prisma.users.findUnique({
      where: { ID: id },
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

    if (!row) return null;

    return {
      ...row,
      RestrictionType: row.RestrictionType ?? null,
      RestrictedUntil: row.RestrictedUntil ?? null,
      RestrictionReason: row.RestrictionReason ?? null,
      Archive: row.Archive ?? false,
    };
  }
}
