import { NotFoundError } from "../../../domain/errors/DomainError";
import { ItemRepository } from "../../../domain/items/ItemRepository";
import { UserRepository } from "../../../domain/users/UserRepository";
import { BuyItemCommand } from "./BuyItemCommand";

export class BuyItemCommandHandler {
  constructor(
    private readonly items: ItemRepository,
    private readonly users: UserRepository
  ) {}

  async execute(command: BuyItemCommand): Promise<void> {
    const item = await this.items.findById(command.itemId);
    if (!item) throw new NotFoundError("Item not found");

    const buyer = await this.users.findById(command.buyerId);
    if (!buyer) throw new NotFoundError("Buyer not found");

    const seller = await this.users.findById(item.ownerId);
    if (!seller) throw new NotFoundError("Seller not found");

    item.buyBy(buyer, seller);
    await this.items.runPurchaseTransaction(item, buyer, seller);
  }
}
