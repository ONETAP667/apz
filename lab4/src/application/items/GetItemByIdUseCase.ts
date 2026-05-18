import { NotFoundError } from "../../domain/errors/DomainError";
import { ItemRepository } from "../../domain/items/ItemRepository";
import { toItemDto } from "./ItemDto";

export class GetItemByIdUseCase {
  constructor(private readonly items: ItemRepository) {}
  async execute(id: number) {
    const item = await this.items.findById(id);
    if (!item) throw new NotFoundError("Item not found");
    return toItemDto(item);
  }
}
