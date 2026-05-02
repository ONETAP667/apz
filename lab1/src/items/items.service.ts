import { prisma } from "../prisma";
import { AppError } from "../utils/error";
import {
  validatePrice,
  validateTypeWeaponRule,
} from "./items.validation";

type CreateItemData = {
  OwnerID: number;
  Price?: number;
  Type: number | null;
  Weapon?: number | null;
  Special?: number | null;
  SkinID?: number;
  Nametag?: string | null;
};

type UpdateItemData = {
  OwnerID?: number;
  Price?: number;
  Type?: number | null;
  Weapon?: number | null;
  Special?: number | null;
  SkinID?: number;
  Nametag?: string | null;
};

export class ItemsService {
  private async validateOwner(ownerId: number) {
    const owner = await prisma.users.findUnique({
      where: { ID: ownerId },
    });

    if (!owner) {
      throw new AppError(400, "Owner does not exist");
    }

    if (owner.Archive) {
      throw new AppError(400, "Owner is archived");
    }
  }

  async getAll() {
    return prisma.items.findMany();
  }

  async getById(id: number) {
    const item = await prisma.items.findUnique({
      where: { ID: id },
    });

    if (!item) {
      throw new AppError(404, "Item not found");
    }

    return item;
  }

  async create(data: CreateItemData) {
    const price = data.Price ?? 0;
    const skinId = data.SkinID ?? 0;

    validatePrice(price);
    await this.validateOwner(data.OwnerID);
    validateTypeWeaponRule(data.Type, data.Weapon);

    return prisma.items.create({
      data: {
        OwnerID: data.OwnerID,
        Price: price,
        Type: data.Type,
        Weapon: data.Weapon ?? null,
        Special: data.Special ?? null,
        SkinID: skinId,
        Nametag: data.Nametag ?? null,
      },
    });
  }

  async update(id: number, data: UpdateItemData) {
    const existing = await prisma.items.findUnique({
      where: { ID: id },
    });

    if (!existing) {
      throw new AppError(404, "Item not found");
    }

    const nextOwnerId = data.OwnerID ?? existing.OwnerID;
    const nextPrice = data.Price ?? existing.Price;
    const nextType = data.Type ?? existing.Type;
    const nextWeapon =
      data.Weapon !== undefined ? data.Weapon : existing.Weapon;

    validatePrice(nextPrice);
    await this.validateOwner(nextOwnerId);
    validateTypeWeaponRule(nextType, nextWeapon);

    return prisma.items.update({
      where: { ID: id },
      data: {
        OwnerID: data.OwnerID,
        Price: data.Price,
        Type: data.Type,
        Weapon: data.Weapon,
        Special: data.Special,
        SkinID: data.SkinID,
        Nametag: data.Nametag,
      },
    });
  }

  async remove(id: number) {
    const existing = await prisma.items.findUnique({
      where: { ID: id },
    });

    if (!existing) {
      throw new AppError(404, "Item not found");
    }

    await prisma.items.delete({
      where: { ID: id },
    });

    return { message: "Item deleted" };
  }

  async buy(itemId: number, buyerId: number) {
    const item = await prisma.items.findUnique({
      where: { ID: itemId },
    });

    if (!item) {
      throw new AppError(404, "Item not found");
    }

    if (item.Archive) {
      throw new AppError(400, "Item is archived");
    }

    if (item.OwnerID === buyerId) {
      throw new AppError(400, "You cannot buy your own item");
    }

    const buyer = await prisma.users.findUnique({
      where: { ID: buyerId },
    });

    if (!buyer) {
      throw new AppError(404, "Buyer not found");
    }

    if (buyer.Archive) {
      throw new AppError(400, "Buyer is archived");
    }

    const seller = await prisma.users.findUnique({
      where: { ID: item.OwnerID },
    });

    if (!seller) {
      throw new AppError(404, "Seller not found");
    }

    if (seller.Archive) {
      throw new AppError(400, "Seller is archived");
    }

    if (buyer.Balance < item.Price) {
      throw new AppError(400, "Insufficient balance");
    }

    return prisma.$transaction(async (tx) => {
      const updatedBuyer = await tx.users.update({
        where: { ID: buyer.ID },
        data: {
          Balance: buyer.Balance - item.Price,
        },
      });

      const updatedSeller = await tx.users.update({
        where: { ID: seller.ID },
        data: {
          Balance: seller.Balance + item.Price,
        },
      });

      const updatedItem = await tx.items.update({
        where: { ID: item.ID },
        data: {
          OwnerID: buyer.ID,
        },
      });

      return {
        message: "Item purchased successfully",
        item: updatedItem,
        buyerBalance: updatedBuyer.Balance,
        sellerBalance: updatedSeller.Balance,
      };
    });
  }
}