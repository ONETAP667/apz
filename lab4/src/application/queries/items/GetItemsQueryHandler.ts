import { ItemReadModel } from "../../read-models/ItemReadModel";
import { ItemReadRepository } from "./ItemReadRepository";
import { GetItemsQuery } from "./GetItemsQuery";

export class GetItemsQueryHandler {
  constructor(private readonly items: ItemReadRepository) {}

  async execute(_query: GetItemsQuery): Promise<ItemReadModel[]> {
    return this.items.findAll();
  }
}
