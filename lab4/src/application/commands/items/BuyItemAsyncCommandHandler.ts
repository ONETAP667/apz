import { NotFoundError } from "../../../domain/errors/DomainError";
import { ItemRepository } from "../../../domain/items/ItemRepository";
import { UserRepository } from "../../../domain/users/UserRepository";
import { EventPublisher } from "../../../integration/events/EventPublisher";
import { ItemPurchasedEvent } from "../../../integration/events/ItemPurchasedEvent";
import { BuyItemCommand } from "./BuyItemCommand";

export class BuyItemAsyncCommandHandler {
  constructor(
    private readonly items: ItemRepository,
    private readonly users: UserRepository,
    private readonly eventPublisher: EventPublisher
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

    await this.eventPublisher.publish(
      new ItemPurchasedEvent({
        itemId: item.id!,
        buyerId: buyer.id!,
        sellerId: seller.id!,
        price: item.price.value(),
      })
    );
  }
}
