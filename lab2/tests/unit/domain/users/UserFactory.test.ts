import { UserFactory } from "../../../../src/domain/users/UserFactory";
import { UserRepository } from "../../../../src/domain/users/UserRepository";
import { User } from "../../../../src/domain/users/User";
import { Email } from "../../../../src/domain/users/value-objects/Email";
import { Money } from "../../../../src/domain/common/Money";

class InMemoryUserRepository implements UserRepository {
  users: User[] = [];
  async findAll() { return this.users; }
  async findById(id: number) { return this.users.find(u => u.id === id) ?? null; }
  async findByEmail(email: Email) { return this.users.find(u => u.email.equals(email)) ?? null; }
  async save(user: User) { this.users.push(user); return user; }
  async update(user: User) { return user; }
}

describe("UserFactory", () => {
  it("creates user with valid email", async () => {
    const repo = new InMemoryUserRepository();
    const factory = new UserFactory(repo);
    const user = await factory.createNew({ username: "test", email: "Test@Example.com", passwordHash: "hash" });
    expect(user.email.toString()).toBe("test@example.com");
  });

  it("rejects duplicate email through repository interface", async () => {
    const repo = new InMemoryUserRepository();
    repo.users.push(User.create({ id: 1, username: "old", email: Email.create("a@b.com"), balance: Money.create(0) }));
    const factory = new UserFactory(repo);
    await expect(factory.createNew({ username: "new", email: "a@b.com", passwordHash: "hash" }))
      .rejects.toThrow("User already exists");
  });
});
