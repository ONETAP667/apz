import { IntegrationEvent } from "./IntegrationEvent";

export interface EventPublisher {
  publish<T extends IntegrationEvent>(event: T): Promise<void>;
}
