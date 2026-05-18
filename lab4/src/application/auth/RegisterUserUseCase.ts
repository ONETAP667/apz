import { UserFactory } from "../../domain/users/UserFactory";
import { UserRepository } from "../../domain/users/UserRepository";
import { PasswordHasher } from "../ports/PasswordHasher";
import { TokenService } from "../ports/TokenService";

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly factory: UserFactory,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  async execute(input: { email: string; password: string; username: string }) {
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.factory.createNew({
      email: input.email,
      username: input.username,
      passwordHash,
    });
    const saved = await this.users.save(user);
    const dto = saved.toPrimitives();
    const token = this.tokens.sign({ userId: dto.id!, email: dto.email, username: dto.username });
    return { user: publicUser(dto), token };
  }
}

function publicUser(user: ReturnType<import("../../domain/users/User").User["toPrimitives"]>) {
  const { passwordHash, ...safe } = user;
  return {
    ID: safe.id,
    Username: safe.username,
    email: safe.email,
    Balance: safe.balance,
    DateJoined: safe.dateJoined,
    RestrictionType: safe.restrictionType,
    RestrictedUntil: safe.restrictedUntil,
    RestrictionReason: safe.restrictionReason,
    Archive: safe.archive,
    Version: safe.version,
  };
}
