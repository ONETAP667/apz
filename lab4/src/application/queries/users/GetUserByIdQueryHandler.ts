import { NotFoundError } from "../../../domain/errors/DomainError";
import { UserReadModel } from "../../read-models/UserReadModel";
import { UserReadRepository } from "./UserReadRepository";
import { GetUserByIdQuery } from "./GetUserByIdQuery";

export class GetUserByIdQueryHandler {
  constructor(private readonly users: UserReadRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserReadModel> {
    const user = await this.users.findById(query.id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}
