import { UserReadModel } from "../../read-models/UserReadModel";
import { UserReadRepository } from "./UserReadRepository";
import { GetUsersQuery } from "./GetUsersQuery";

export class GetUsersQueryHandler {
  constructor(private readonly users: UserReadRepository) {}

  async execute(_query: GetUsersQuery): Promise<UserReadModel[]> {
    return this.users.findAll();
  }
}
