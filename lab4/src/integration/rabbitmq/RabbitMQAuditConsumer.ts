import { AuditLogPort } from "../audit/AuditLogPort";
import { ItemPurchasedEvent } from "../events/ItemPurchasedEvent";
import { RabbitMQConnectionManager } from "./RabbitMQConnection";
import { RabbitMQConfig } from "./RabbitMQConfig";

export class RabbitMQAuditConsumer {
  private started = false;

  constructor(
    private readonly connectionManager: RabbitMQConnectionManager,
    private readonly config: RabbitMQConfig,
    private readonly auditLog: AuditLogPort
  ) {}

  async start(): Promise<void> {
    if (this.started) return;

    const channel = await this.connectionManager.getChannel();
    await channel.assertQueue(this.config.auditQueue, { durable: true });
    await channel.bindQueue(
      this.config.auditQueue,
      this.config.exchange,
      this.config.itemPurchasedRoutingKey
    );

    await channel.consume(this.config.auditQueue, async (message) => {
      if (!message) return;

      try {
        const payload = JSON.parse(message.content.toString()) as ItemPurchasedEvent;
        await this.auditLog.record({
          id: `async-${payload.itemId}-${payload.buyerId}-${payload.occurredAt}`,
          type: "ItemPurchased",
          occurredAt: payload.occurredAt,
          itemId: payload.itemId,
          buyerId: payload.buyerId,
          sellerId: payload.sellerId,
          price: payload.price,
          mode: "async",
        });
        channel.ack(message);
      } catch (error) {
        console.error("RabbitMQ audit consumer failed", error);
        channel.nack(message, false, false);
      }
    });

    this.started = true;
  }
}