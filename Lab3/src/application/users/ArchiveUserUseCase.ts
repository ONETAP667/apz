import { NotFoundError } from "../../domain/errors/DomainError";
import { UserRepository } from "../../domain/users/UserRepository";

export class ArchiveUserUseCase {
  constructor(private readonly users: UserRepository) {}
  async execute(id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("User not found");
    user.archive();
    await this.users.update(user);
    return { message: "User archived" };
  }
}
