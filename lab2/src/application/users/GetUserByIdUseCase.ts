import { NotFoundError } from "../../domain/errors/DomainError";
import { UserRepository } from "../../domain/users/UserRepository";
import { toDto } from "./GetUsersUseCase";

export class GetUserByIdUseCase {
  constructor(private readonly users: UserRepository) {}
  async execute(id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return toDto(user);
  }
}
