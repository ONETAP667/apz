import { IntegrationEvent } from "./IntegrationEvent";

export class ItemPurchasedEvent implements IntegrationEvent {
  static readonly eventName = "item.purchased";

  readonly eventName = ItemPurchasedEvent.eventName;
  readonly occurredAt: string;
  readonly itemId: number;
  readonly buyerId: number;
  readonly sellerId: number;
  readonly price: number;

  constructor(params: {
    itemId: number;
    buyerId: number;
    sellerId: number;
    price: number;
    occurredAt?: string;
  }) {
    this.itemId = params.itemId;
    this.buyerId = params.buyerId;
    this.sellerId = params.sellerId;
    this.price = params.price;
    this.occurredAt = params.occurredAt ?? new Date().toISOString();
  }
}
