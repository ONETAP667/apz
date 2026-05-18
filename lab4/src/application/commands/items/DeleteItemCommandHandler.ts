import { NotFoundError } from "../../../domain/errors/DomainError";
import { ItemRepository } from "../../../domain/items/ItemRepository";
import { DeleteItemCommand } from "./DeleteItemCommand";

export class DeleteItemCommandHandler {
  constructor(private readonly items: ItemRepository) {}

  async execute(command: DeleteItemCommand): Promise<void> {
    const existing = await this.items.findById(command.id);
    if (!existing) throw new NotFoundError("Item not found");
    await this.items.delete(command.id);
  }
}
