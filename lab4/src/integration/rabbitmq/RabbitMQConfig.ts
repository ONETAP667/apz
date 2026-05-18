export type RabbitMQConfig = {
  url: string;
  exchange: string;
  auditQueue: string;
  itemPurchasedRoutingKey: string;
};

export function getRabbitMQConfig(): RabbitMQConfig {
  return {
    url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@127.0.0.1:5672",
    exchange: process.env.RABBITMQ_EXCHANGE ?? "lab4.events",
    auditQueue: process.env.RABBITMQ_AUDIT_QUEUE ?? "lab4.audit.queue",
    itemPurchasedRoutingKey: process.env.RABBITMQ_ITEM_PURCHASED_KEY ?? "item.purchased",
  };
}
