import { ItemFactory } from "../../domain/items/ItemFactory";
import { ItemRepository } from "../../domain/items/ItemRepository";
import { toItemDto } from "./ItemDto";

export class CreateItemUseCase {
  constructor(private readonly items: ItemRepository, private readonly factory: ItemFactory) {}
  async execute(input: {
    OwnerID: number; Price?: number; Type: number | null; Weapon?: number | null;
    Special?: number | null; SkinID?: number; Nametag?: string | null;
  }) {
    const item = await this.factory.createNew({
      ownerId: input.OwnerID,
      price: input.Price,
      type: input.Type,
      weapon: input.Weapon,
      special: input.Special,
      skinId: input.SkinID,
      nametag: input.Nametag,
    });
    return toItemDto(await this.items.save(item));
  }
}
