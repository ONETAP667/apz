import { Item } from "../../../../src/domain/items/Item";
import { Money } from "../../../../src/domain/common/Money";
import { Email } from "../../../../src/domain/users/value-objects/Email";
import { User } from "../../../../src/domain/users/User";

function user(id: number, balance: number, username = `user${id}`) {
  return User.create({
    id,
    username,
    email: Email.create(`${username}@example.com`),
    balance: Money.create(balance),
  });
}

describe("Item domain", () => {
  it("rejects negative price", () => {
    expect(() => Money.price(-1)).toThrow("Price must be non-negative");
  });

  it("requires Weapon when Type = 1", () => {
    expect(() => Item.create({ ownerId: 1, price: Money.price(100), type: 1 })).toThrow(
      "Weapon is required when Type = 1"
    );
  });

  it("requires Weapon to be null when Type != 1", () => {
    expect(() => Item.create({ ownerId: 1, price: Money.price(100), type: 2, weapon: 10 })).toThrow(
      "Weapon must be null when Type != 1"
    );
  });

  it("buys item without DB or HTTP", () => {
    const seller = user(1, 0, "seller");
    const buyer = user(2, 1000, "buyer");
    const item = Item.create({ id: 10, ownerId: 1, price: Money.price(300), type: 1, weapon: 10 });

    item.buyBy(buyer, seller);

    expect(item.ownerId).toBe(2);
    expect(buyer.balance.value()).toBe(700);
    expect(seller.balance.value()).toBe(300);
  });
});
