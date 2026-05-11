import { ItemFactory } from "../../../domain/items/ItemFactory";
import { ItemRepository } from "../../../domain/items/ItemRepository";
import { CreateItemCommand } from "./CreateItemCommand";

export class CreateItemCommandHandler {
  constructor(
    private readonly items: ItemRepository,
    private readonly factory: ItemFactory
  ) {}

  async execute(command: CreateItemCommand): Promise<number> {
    const input = command.data;
    const item = await this.factory.createNew({
      ownerId: input.OwnerID,
      price: input.Price,
      type: input.Type,
      weapon: input.Weapon,
      special: input.Special,
      skinId: input.SkinID,
      nametag: input.Nametag,
    });
    const saved = await this.items.save(item);
    if (!saved.id) throw new Error("Saved item must have id");
    return saved.id;
  }
}
