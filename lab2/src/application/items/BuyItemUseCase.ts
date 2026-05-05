import { NotFoundError } from "../../domain/errors/DomainError";
import { ItemRepository } from "../../domain/items/ItemRepository";
import { UserRepository } from "../../domain/users/UserRepository";
import { toItemDto } from "./ItemDto";

export class BuyItemUseCase {
  constructor(private readonly items: ItemRepository, private readonly users: UserRepository) {}

  async execute(itemId: number, buyerId: number) {
    const item = await this.items.findById(itemId);
    if (!item) throw new NotFoundError("Item not found");

    const buyer = await this.users.findById(buyerId);
    if (!buyer) throw new NotFoundError("Buyer not found");

    const seller = await this.users.findById(item.ownerId);
    if (!seller) throw new NotFoundError("Seller not found");

    item.buyBy(buyer, seller);
    const result = await this.items.runPurchaseTransaction(item, buyer, seller);

    return {
      message: "Item purchased successfully",
      item: toItemDto(result.item),
      buyerBalance: result.buyer.balance.value(),
      sellerBalance: result.seller.balance.value(),
    };
  }
}
