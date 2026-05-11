import { Money } from "../../../domain/common/Money";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainError";
import { ItemRepository } from "../../../domain/items/ItemRepository";
import { UserRepository } from "../../../domain/users/UserRepository";
import { UpdateItemCommand } from "./UpdateItemCommand";

export class UpdateItemCommandHandler {
  constructor(
    private readonly items: ItemRepository,
    private readonly users: UserRepository
  ) {}

  async execute(command: UpdateItemCommand): Promise<void> {
    const item = await this.items.findById(command.id);
    if (!item) throw new NotFoundError("Item not found");

    const input = command.data;
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

    await this.items.update(item);
  }
}
