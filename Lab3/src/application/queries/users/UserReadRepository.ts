import { UserReadModel } from "../../read-models/UserReadModel";

export interface UserReadRepository {
  findAll(): Promise<UserReadModel[]>;
  findById(id: number): Promise<UserReadModel | null>;
}
