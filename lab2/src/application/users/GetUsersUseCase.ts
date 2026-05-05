import { UserRepository } from "../../domain/users/UserRepository";

export class GetUsersUseCase {
  constructor(private readonly users: UserRepository) {}
  async execute() {
    return (await this.users.findAll()).map(toDto);
  }
}

export function toDto(user: import("../../domain/users/User").User) {
  const dto = user.toPrimitives();
  return {
    ID: dto.id,
    Username: dto.username,
    email: dto.email,
    Balance: dto.balance,
    DateJoined: dto.dateJoined,
    RestrictionType: dto.restrictionType,
    RestrictedUntil: dto.restrictedUntil,
    RestrictionReason: dto.restrictionReason,
    Archive: dto.archive,
    Version: dto.version,
  };
}
