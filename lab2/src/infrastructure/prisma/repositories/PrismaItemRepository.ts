import { Item } from "../../../domain/items/Item";
import { ItemRepository, PurchaseResult } from "../../../domain/items/ItemRepository";
import { User } from "../../../domain/users/User";
import { prisma } from "../prisma";
import { ItemMapper } from "../mappers/ItemMapper";
import { UserMapper } from "../mappers/UserMapper";

export class PrismaItemRepository implements ItemRepository {
  async findAll(): Promise<Item[]> {
    const rows = await prisma.items.findMany();
    return rows.map(ItemMapper.toDomain);
  }

  async findById(id: number): Promise<Item | null> {
    const row = await prisma.items.findUnique({ where: { ID: id } });
    return row ? ItemMapper.toDomain(row) : null;
  }

  async save(item: Item): Promise<Item> {
    const row = await prisma.items.create({ data: ItemMapper.toPersistence(item) });
    return ItemMapper.toDomain(row);
  }

  async update(item: Item): Promise<Item> {
    if (!item.id) throw new Error("Cannot update item without id");
    const row = await prisma.items.update({ where: { ID: item.id }, data: ItemMapper.toPersistence(item) });
    return ItemMapper.toDomain(row);
  }

  async delete(id: number): Promise<void> {
    await prisma.items.delete({ where: { ID: id } });
  }

  async runPurchaseTransaction(item: Item, buyer: User, seller: User): Promise<PurchaseResult> {
    if (!item.id || !buyer.id || !seller.id) throw new Error("Purchase entities must have ids");

    return prisma.$transaction(async (tx) => {
      const updatedBuyer = await tx.users.update({
        where: { ID: buyer.id },
        data: { Balance: buyer.balance.value() },
      });
      const updatedSeller = await tx.users.update({
        where: { ID: seller.id },
        data: { Balance: seller.balance.value() },
      });
      const updatedItem = await tx.items.update({
        where: { ID: item.id },
        data: { OwnerID: item.ownerId },
      });

      return {
        item: ItemMapper.toDomain(updatedItem),
        buyer: UserMapper.toDomain(updatedBuyer),
        seller: UserMapper.toDomain(updatedSeller),
      };
    });
  }
}
