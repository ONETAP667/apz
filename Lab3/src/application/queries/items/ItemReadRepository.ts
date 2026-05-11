import { ItemReadModel } from "../../read-models/ItemReadModel";

export interface ItemReadRepository {
  findAll(): Promise<ItemReadModel[]>;
  findById(id: number): Promise<ItemReadModel | null>;
}
