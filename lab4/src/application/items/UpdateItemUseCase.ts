import { Money } from "../../domain/common/Money";
import { NotFoundError, ValidationError } from "../../domain/errors/DomainError";
import { ItemRepository } from "../../domain/items/ItemRepository";
import { UserRepository } from "../../domain/users/UserRepository";
import { toItemDto } from "./ItemDto";

export class UpdateItemUseCase {
  constructor(private readonly items: ItemRepository, private readonly users: UserRepository) {}

  async execute(id: number, input: {
    OwnerID?: number; Price?: number; Type?: number | null; Weapon?: number | null;
    Special?: number | null; SkinID?: number; Nametag?: string | null;
  }) {
    const item = await this.items.findById(id);
    if (!item) throw new NotFoundError("Item not found");

    if (input.OwnerID !== undefined) {
      const owner = await this.users.findById(input.OwnerID);
      if (!owner) throw new NotFoundError("Owner does not exist");
      if (owner.isArchived) throw new ValidationError("Owner is archived");
    }

    item.update({
      ownerId: input.OwnerID,
      price: input.Price !== undefined ? Money.price(input.Price) : undefined,
      type: input.Type,
      weapon: input.Weapon,
      special: input.Special,
      skinId: input.SkinID,
      nametag: input.Nametag,
    });
    return toItemDto(await this.items.update(item));
  }
}
