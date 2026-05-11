import { Money } from "../../domain/common/Money";
import { ConflictError, NotFoundError } from "../../domain/errors/DomainError";
import { UserRepository } from "../../domain/users/UserRepository";
import { Email } from "../../domain/users/value-objects/Email";
import { toDto } from "./GetUsersUseCase";

export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: number, input: { Username?: string; email?: string; Balance?: number; Archive?: boolean }) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("User not found");

    if (input.Username !== undefined) user.changeUsername(input.Username);
    if (input.email !== undefined) {
      const newEmail = Email.create(input.email);
      if (!user.email.equals(newEmail)) {
        const duplicate = await this.users.findByEmail(newEmail);
        if (duplicate) throw new ConflictError("Email already in use");
      }
      user.changeEmail(newEmail);
    }
    if (input.Balance !== undefined) user.changeBalance(Money.create(input.Balance));
    if (input.Archive === true) user.archive();

    return toDto(await this.users.update(user));
  }
}
