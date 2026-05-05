import { Item } from "./Item";
import { User } from "../users/User";

export interface PurchaseResult {
  item: Item;
  buyer: User;
  seller: User;
}

export interface ItemRepository {
  findAll(): Promise<Item[]>;
  findById(id: number): Promise<Item | null>;
  save(item: Item): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: number): Promise<void>;

  /** Infrastructure implements the DB transaction; domain still owns the rules. */
  runPurchaseTransaction(item: Item, buyer: User, seller: User): Promise<PurchaseResult>;
}
