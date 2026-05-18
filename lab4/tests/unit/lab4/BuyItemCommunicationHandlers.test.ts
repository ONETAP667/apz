import { BuyItemCommand } from "../../../src/application/commands/items/BuyItemCommand";
import { BuyItemAsyncCommandHandler } from "../../../src/application/commands/items/BuyItemAsyncCommandHandler";
import { BuyItemSyncCommandHandler } from "../../../src/application/commands/items/BuyItemSyncCommandHandler";
import { Money } from "../../../src/domain/common/Money";
import { Item } from "../../../src/domain/items/Item";
import { ItemRepository, PurchaseResult } from "../../../src/domain/items/ItemRepository";
import { User } from "../../../src/domain/users/User";
import { UserRepository } from "../../../src/domain/users/UserRepository";
import { Email } from "../../../src/domain/users/value-objects/Email";
import { AuditLogEntry } from "../../../src/integration/audit/AuditLogEntry";
import { AuditLogPort } from "../../../src/integration/audit/AuditLogPort";
import { EventPublisher } from "../../../src/integration/events/EventPublisher";
import { IntegrationEvent } from "../../../src/integration/events/IntegrationEvent";

class FakeUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}
  async findAll(): Promise<User[]> { return this.users; }
  async findById(id: number): Promise<User | null> { return this.users.find((u) => u.id === id) ?? null; }
  async findByEmail(email: Email): Promise<User | null> { return this.users.find((u) => u.email.equals(email)) ?? null; }
  async save(user: User): Promise<User> { this.users.push(user); return user; }
  async update(user: User): Promise<User> { return user; }
}

class FakeItemRepository implements ItemRepository {
  constructor(private readonly item: Item) {}
  public transactionCalled = false;
  async findAll(): Promise<Item[]> { return [this.item]; }
  async findById(id: number): Promise<Item | null> { return this.item.id === id ? this.item : null; }
  async save(item: Item): Promise<Item> { return item; }
  async update(item: Item): Promise<Item> { return item; }
  async delete(_id: number): Promise<void> {}
  async runPurchaseTransaction(item: Item, buyer: User, seller: User): Promise<PurchaseResult> {
    this.transactionCalled = true;
    return { item, buyer, seller };
  }
}

class FailingAuditLog implements AuditLogPort {
  async record(_entry: AuditLogEntry): Promise<void> {
    throw new Error("Audit component is unavailable");
  }
}

class SpyEventPublisher implements EventPublisher {
  public published: IntegrationEvent[] = [];
  async publish<T extends IntegrationEvent>(event: T): Promise<void> {
    this.published.push(event);
  }
}

function createScenario() {
  const seller = User.create({ id: 1, username: "seller", email: Email.create("seller@test.dev"), balance: Money.create(100), passwordHash: "hash" });
  const buyer = User.create({ id: 2, username: "buyer", email: Email.create("buyer@test.dev"), balance: Money.create(500), passwordHash: "hash" });
  const item = Item.create({ id: 20, ownerId: 1, price: Money.price(150), type: 1, weapon: 99 });
  const items = new FakeItemRepository(item);
  const users = new FakeUserRepository([seller, buyer]);
  return { seller, buyer, item, items, users };
}

describe("lab4 communication handlers", () => {
  it("sync handler fails when audit component throws after purchase", async () => {
    const { item, buyer, seller, items, users } = createScenario();
    const handler = new BuyItemSyncCommandHandler(items, users, new FailingAuditLog());

    await expect(handler.execute(new BuyItemCommand(20, 2))).rejects.toThrow("Audit component is unavailable");
    expect(items.transactionCalled).toBe(true);
    expect(item.ownerId).toBe(2);
    expect(buyer.balance.value()).toBe(350);
    expect(seller.balance.value()).toBe(250);
  });

  it("async handler completes main flow and publishes event", async () => {
    const { item, buyer, seller, items, users } = createScenario();
    const bus = new SpyEventPublisher();
    const handler = new BuyItemAsyncCommandHandler(items, users, bus);

    await handler.execute(new BuyItemCommand(20, 2));

    expect(items.transactionCalled).toBe(true);
    expect(item.ownerId).toBe(2);
    expect(buyer.balance.value()).toBe(350);
    expect(seller.balance.value()).toBe(250);
    expect(bus.published).toHaveLength(1);
    expect(bus.published[0]).toMatchObject({ eventName: "item.purchased", itemId: 20, buyerId: 2, sellerId: 1, price: 150 });
  });
});
