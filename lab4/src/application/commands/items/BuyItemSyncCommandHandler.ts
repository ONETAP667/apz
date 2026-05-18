import { NotFoundError } from "../../../domain/errors/DomainError";
import { ItemRepository } from "../../../domain/items/ItemRepository";
import { UserRepository } from "../../../domain/users/UserRepository";
import { AuditLogPort } from "../../../integration/audit/AuditLogPort";
import { BuyItemCommand } from "./BuyItemCommand";

export class BuyItemSyncCommandHandler {
  constructor(
    private readonly items: ItemRepository,
    private readonly users: UserRepository,
    private readonly auditLog: AuditLogPort
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

    await this.auditLog.record({
      id: `sync-${item.id}-${buyer.id}-${new Date().toISOString()}`,
      type: "ItemPurchased",
      occurredAt: new Date().toISOString(),
      itemId: item.id!,
      buyerId: buyer.id!,
      sellerId: seller.id!,
      price: item.price.value(),
      mode: "sync",
    });
  }
}
