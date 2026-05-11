import { ItemReadRepository } from "../../../application/queries/items/ItemReadRepository";
import { ItemReadModel } from "../../../application/read-models/ItemReadModel";
import { prisma } from "../prisma";

export class PrismaItemReadRepository implements ItemReadRepository {
  async findAll(): Promise<ItemReadModel[]> {
    const rows = await prisma.items.findMany({
      select: {
        ID: true,
        OwnerID: true,
        Price: true,
        Type: true,
        Weapon: true,
        Special: true,
        SkinID: true,
        Nametag: true,
        Archive: true,
      },
    });

    return rows.map((row) => ({
      ...row,
      Type: row.Type ?? null,
      Weapon: row.Weapon ?? null,
      Special: row.Special ?? null,
      Nametag: row.Nametag ?? null,
      Archive: row.Archive ?? false,
    }));
  }

  async findById(id: number): Promise<ItemReadModel | null> {
    const row = await prisma.items.findUnique({
      where: { ID: id },
      select: {
        ID: true,
        OwnerID: true,
        Price: true,
        Type: true,
        Weapon: true,
        Special: true,
        SkinID: true,
        Nametag: true,
        Archive: true,
      },
    });

    if (!row) return null;

    return {
      ...row,
      Type: row.Type ?? null,
      Weapon: row.Weapon ?? null,
      Special: row.Special ?? null,
      Nametag: row.Nametag ?? null,
      Archive: row.Archive ?? false,
    };
  }
}
