import { Money } from "../common/Money";
import { NotFoundError, ValidationError } from "../errors/DomainError";
import { UserRepository } from "../users/UserRepository";
import { Item } from "./Item";

export class ItemFactory {
  constructor(private readonly users: UserRepository) {}

  async createNew(params: {
    ownerId: number;
    price?: number;
    type: number | null;
    weapon?: number | null;
    special?: number | null;
    skinId?: number;
    nametag?: string | null;
  }): Promise<Item> {
    const owner = await this.users.findById(params.ownerId);
    if (!owner) {
      throw new NotFoundError("Owner does not exist");
    }
    if (owner.isArchived) {
      throw new ValidationError("Owner is archived");
    }

    return Item.create({
      ownerId: params.ownerId,
      price: Money.price(params.price ?? 0),
      type: params.type,
      weapon: params.weapon ?? null,
      special: params.special ?? null,
      skinId: params.skinId ?? 0,
      nametag: params.nametag ?? null,
    });
  }
}
