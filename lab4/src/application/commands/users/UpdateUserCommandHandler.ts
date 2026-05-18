import { Money } from "../../../domain/common/Money";
import { ConflictError, NotFoundError } from "../../../domain/errors/DomainError";
import { UserRepository } from "../../../domain/users/UserRepository";
import { Email } from "../../../domain/users/value-objects/Email";
import { UpdateUserCommand } from "./UpdateUserCommand";

export class UpdateUserCommandHandler {
  constructor(private readonly users: UserRepository) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const user = await this.users.findById(command.id);
    if (!user) throw new NotFoundError("User not found");

    const input = command.data;
    if (input.Username !== undefined) user.changeUsername(input.Username);
    if (input.email !== undefined) {
      const newEmail = Email.create(input.email);
      if (!user.email.equals(newEmail)) {
        const duplicate = await this.users.findByEmail(newEmail);
        if (duplicate && duplicate.id !== user.id) throw new ConflictError("Email already in use");
      }
      user.changeEmail(newEmail);
    }
    if (input.Balance !== undefined) user.changeBalance(Money.create(input.Balance));
    if (input.Archive === true) user.archive();

    await this.users.update(user);
  }
}
