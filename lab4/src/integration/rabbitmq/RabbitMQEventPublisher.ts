import { EventPublisher } from "../events/EventPublisher";
import { IntegrationEvent } from "../events/IntegrationEvent";
import { RabbitMQConnectionManager } from "./RabbitMQConnection";
import { RabbitMQConfig } from "./RabbitMQConfig";

export class RabbitMQEventPublisher implements EventPublisher {
  constructor(
    private readonly connectionManager: RabbitMQConnectionManager,
    private readonly config: RabbitMQConfig
  ) {}

  async publish<T extends IntegrationEvent>(event: T): Promise<void> {
    const channel = await this.connectionManager.getChannel();
    const routingKey = event.eventName;
    channel.publish(
      this.config.exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { contentType: "application/json", persistent: true }
    );
  }
}
