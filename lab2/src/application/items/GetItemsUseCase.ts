import { ItemRepository } from "../../domain/items/ItemRepository";
import { toItemDto } from "./ItemDto";

export class GetItemsUseCase {
  constructor(private readonly items: ItemRepository) {}
  async execute() {
    return (await this.items.findAll()).map(toItemDto);
  }
}
