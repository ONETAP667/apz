import { NotFoundError } from "../../../domain/errors/DomainError";
import { UserRepository } from "../../../domain/users/UserRepository";
import { ArchiveUserCommand } from "./ArchiveUserCommand";

export class ArchiveUserCommandHandler {
  constructor(private readonly users: UserRepository) {}

  async execute(command: ArchiveUserCommand): Promise<void> {
    const user = await this.users.findById(command.id);
    if (!user) throw new NotFoundError("User not found");
    user.archive();
    await this.users.update(user);
  }
}
