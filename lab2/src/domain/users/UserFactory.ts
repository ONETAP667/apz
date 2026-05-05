import { Money } from "../common/Money";
import { ConflictError } from "../errors/DomainError";
import { User } from "./User";
import { UserRepository } from "./UserRepository";
import { Email } from "./value-objects/Email";

export class UserFactory {
  constructor(private readonly users: UserRepository) {}

  async createNew(params: {
    username: string;
    email: string;
    passwordHash: string;
    balance?: number;
  }): Promise<User> {
    const email = Email.create(params.email);
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError("User already exists");
    }

    return User.create({
      username: params.username,
      email,
      balance: Money.create(params.balance ?? 0),
      passwordHash: params.passwordHash,
    });
  }
}
