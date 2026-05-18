import { EventPublisher } from "./EventPublisher";
import { IntegrationEvent } from "./IntegrationEvent";
import { IntegrationEventHandler } from "./EventBus";

export class InMemoryEventPublisher implements EventPublisher {
  private readonly handlers = new Map<string, IntegrationEventHandler[]>();
  private readonly processingErrors: Error[] = [];

  async publish<T extends IntegrationEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    setTimeout(() => {
      void Promise.all(
        handlers.map(async (handler) => {
          try {
            await handler.handle(event);
          } catch (error) {
            this.processingErrors.push(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        })
      );
    }, 0);
  }

  subscribe<T extends IntegrationEvent>(handler: IntegrationEventHandler<T>): void {
    const handlers = this.handlers.get(handler.eventName) ?? [];
    handlers.push(handler as IntegrationEventHandler);
    this.handlers.set(handler.eventName, handlers);
  }

  drainErrors(): Error[] {
    return [...this.processingErrors];
  }

  clearErrors() {
    this.processingErrors.length = 0;
  }
}
