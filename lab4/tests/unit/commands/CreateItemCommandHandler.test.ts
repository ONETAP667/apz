import { CreateItemCommand } from "../../../src/application/commands/items/CreateItemCommand";
import { CreateItemCommandHandler } from "../../../src/application/commands/items/CreateItemCommandHandler";
import { ValidationError } from "../../../src/domain/errors/DomainError";
import { ItemFactory } from "../../../src/domain/items/ItemFactory";
import { Item } from "../../../src/domain/items/Item";
import { ItemRepository, PurchaseResult } from "../../../src/domain/items/ItemRepository";
import { User } from "../../../src/domain/users/User";
import { UserRepository } from "../../../src/domain/users/UserRepository";
import { Email } from "../../../src/domain/users/value-objects/Email";
import { Money } from "../../../src/domain/common/Money";

class FakeUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}
  async findAll(): Promise<User[]> { return this.users; }
  async findById(id: number): Promise<User | null> { return this.users.find((u) => u.id === id) ?? null; }
  async findByEmail(email: Email): Promise<User | null> { return this.users.find((u) => u.email.equals(email)) ?? null; }
  async save(user: User): Promise<User> { this.users.push(user); return user; }
  async update(user: User): Promise<User> { return user; }
}

class FakeItemRepository implements ItemRepository {
  public saved: Item[] = [];
  async findAll(): Promise<Item[]> { return this.saved; }
  async findById(id: number): Promise<Item | null> { return this.saved.find((i) => i.id === id) ?? null; }
  async save(item: Item): Promise<Item> {
    const saved = Item.create({ ...item.toPrimitives(), id: this.saved.length + 1, price: Money.price(item.price.value()) });
    this.saved.push(saved);
    return saved;
  }
  async update(item: Item): Promise<Item> { return item; }
  async delete(_id: number): Promise<void> {}
  async runPurchaseTransaction(_item: Item, _buyer: User, _seller: User): Promise<PurchaseResult> { throw new Error("not used"); }
}

describe("CreateItemCommandHandler", () => {
  it("creates item and returns created id", async () => {
    const owner = User.create({
      id: 10,
      username: "owner",
      email: Email.create("owner@test.dev"),
      balance: Money.create(100),
      passwordHash: "hash",
    });

    const users = new FakeUserRepository([owner]);
    const items = new FakeItemRepository();
    const handler = new CreateItemCommandHandler(items, new ItemFactory(users));

    const id = await handler.execute(new CreateItemCommand({
      OwnerID: 10,
      Price: 500,
      Type: 1,
      Weapon: 7,
      SkinID: 2,
      Nametag: "AK-47",
    }));

    expect(id).toBe(1);
    expect(items.saved).toHaveLength(1);
    expect(items.saved[0].ownerId).toBe(10);
  });

  it("throws when type requires weapon but weapon is missing", async () => {
    const owner = User.create({
      id: 10,
      username: "owner",
      email: Email.create("owner@test.dev"),
      balance: Money.create(100),
      passwordHash: "hash",
    });

    const handler = new CreateItemCommandHandler(
      new FakeItemRepository(),
      new ItemFactory(new FakeUserRepository([owner]))
    );

    await expect(handler.execute(new CreateItemCommand({
      OwnerID: 10,
      Price: 500,
      Type: 1,
      SkinID: 2,
    }))).rejects.toThrow(ValidationError);
  });
});
