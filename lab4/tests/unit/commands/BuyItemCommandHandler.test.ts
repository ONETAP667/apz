import { BuyItemCommand } from "../../../src/application/commands/items/BuyItemCommand";
import { BuyItemCommandHandler } from "../../../src/application/commands/items/BuyItemCommandHandler";
import { ValidationError } from "../../../src/domain/errors/DomainError";
import { Item } from "../../../src/domain/items/Item";
import { ItemRepository, PurchaseResult } from "../../../src/domain/items/ItemRepository";
import { Money } from "../../../src/domain/common/Money";
import { User } from "../../../src/domain/users/User";
import { UserRepository } from "../../../src/domain/users/UserRepository";
import { Email } from "../../../src/domain/users/value-objects/Email";

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

describe("BuyItemCommandHandler", () => {
  it("transfers ownership and balances through the domain", async () => {
    const seller = User.create({ id: 1, username: "seller", email: Email.create("seller@test.dev"), balance: Money.create(100), passwordHash: "hash" });
    const buyer = User.create({ id: 2, username: "buyer", email: Email.create("buyer@test.dev"), balance: Money.create(500), passwordHash: "hash" });
    const item = Item.create({ id: 20, ownerId: 1, price: Money.price(150), type: 1, weapon: 99 });

    const items = new FakeItemRepository(item);
    const users = new FakeUserRepository([seller, buyer]);
    const handler = new BuyItemCommandHandler(items, users);

    await handler.execute(new BuyItemCommand(20, 2));

    expect(item.ownerId).toBe(2);
    expect(buyer.balance.value()).toBe(350);
    expect(seller.balance.value()).toBe(250);
    expect(items.transactionCalled).toBe(true);
  });

  it("rejects purchase when buyer balance is insufficient", async () => {
    const seller = User.create({ id: 1, username: "seller", email: Email.create("seller@test.dev"), balance: Money.create(100), passwordHash: "hash" });
    const buyer = User.create({ id: 2, username: "buyer", email: Email.create("buyer@test.dev"), balance: Money.create(50), passwordHash: "hash" });
    const item = Item.create({ id: 20, ownerId: 1, price: Money.price(150), type: 1, weapon: 99 });

    const handler = new BuyItemCommandHandler(new FakeItemRepository(item), new FakeUserRepository([seller, buyer]));

    await expect(handler.execute(new BuyItemCommand(20, 2))).rejects.toThrow(ValidationError);
  });
});
