import { BuyItemUseCase } from "../../../src/application/items/BuyItemUseCase";
import { ItemRepository, PurchaseResult } from "../../../src/domain/items/ItemRepository";
import { UserRepository } from "../../../src/domain/users/UserRepository";
import { Item } from "../../../src/domain/items/Item";
import { User } from "../../../src/domain/users/User";
import { Email } from "../../../src/domain/users/value-objects/Email";
import { Money } from "../../../src/domain/common/Money";

function user(id: number, balance: number, username: string) {
  return User.create({ id, username, email: Email.create(`${username}@example.com`), balance: Money.create(balance) });
}

class FakeUsers implements UserRepository {
  constructor(private users: User[]) {}
  async findAll() { return this.users; }
  async findById(id: number) { return this.users.find(u => u.id === id) ?? null; }
  async findByEmail(email: Email) { return this.users.find(u => u.email.equals(email)) ?? null; }
  async save(user: User) { return user; }
  async update(user: User) { return user; }
}

class FakeItems implements ItemRepository {
  constructor(private item: Item) {}
  async findAll() { return [this.item]; }
  async findById(id: number) { return this.item.id === id ? this.item : null; }
  async save(item: Item) { return item; }
  async update(item: Item) { return item; }
  async delete() {}
  async runPurchaseTransaction(item: Item, buyer: User, seller: User): Promise<PurchaseResult> {
    return { item, buyer, seller };
  }
}

describe("BuyItemUseCase", () => {
  it("orchestrates purchase through repository interfaces", async () => {
    const seller = user(1, 0, "seller");
    const buyer = user(2, 1000, "buyer");
    const item = Item.create({ id: 5, ownerId: 1, price: Money.price(300), type: 1, weapon: 10 });
    const useCase = new BuyItemUseCase(new FakeItems(item), new FakeUsers([seller, buyer]));

    const result = await useCase.execute(5, 2);

    expect(result.item.OwnerID).toBe(2);
    expect(result.buyerBalance).toBe(700);
    expect(result.sellerBalance).toBe(300);
  });
});
