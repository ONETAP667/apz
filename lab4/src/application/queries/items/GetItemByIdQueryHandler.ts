import { NotFoundError } from "../../../domain/errors/DomainError";
import { ItemReadModel } from "../../read-models/ItemReadModel";
import { ItemReadRepository } from "./ItemReadRepository";
import { GetItemByIdQuery } from "./GetItemByIdQuery";

export class GetItemByIdQueryHandler {
  constructor(private readonly items: ItemReadRepository) {}

  async execute(query: GetItemByIdQuery): Promise<ItemReadModel> {
    const item = await this.items.findById(query.id);
    if (!item) throw new NotFoundError("Item not found");
    return item;
  }
}
