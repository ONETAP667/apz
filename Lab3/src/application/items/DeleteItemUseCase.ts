import { NotFoundError } from "../../domain/errors/DomainError";
import { ItemRepository } from "../../domain/items/ItemRepository";

export class DeleteItemUseCase {
  constructor(private readonly items: ItemRepository) {}
  async execute(id: number) {
    const existing = await this.items.findById(id);
    if (!existing) throw new NotFoundError("Item not found");
    await this.items.delete(id);
    return { message: "Item deleted" };
  }
}
