import { AuditLogPort } from "../../audit/AuditLogPort";
import { ItemPurchasedEvent } from "../ItemPurchasedEvent";

export class AuditOnItemPurchasedHandler {
  readonly eventName = ItemPurchasedEvent.eventName;

  constructor(private readonly auditLog: AuditLogPort) {}

  async handle(event: ItemPurchasedEvent): Promise<void> {
    await this.auditLog.record({
      id: `async-${event.itemId}-${event.buyerId}-${event.occurredAt}`,
      type: "ItemPurchased",
      occurredAt: event.occurredAt,
      itemId: event.itemId,
      buyerId: event.buyerId,
      sellerId: event.sellerId,
      price: event.price,
      mode: "async",
    });
  }
}
