import { IntegrationEvent } from "./IntegrationEvent";

export type IntegrationEventHandler<T extends IntegrationEvent = IntegrationEvent> = {
  eventName: string;
  handle(event: T): Promise<void>;
};

export interface EventBus {
  publish<T extends IntegrationEvent>(event: T): Promise<void>;
  subscribe<T extends IntegrationEvent>(handler: IntegrationEventHandler<T>): void;
}
