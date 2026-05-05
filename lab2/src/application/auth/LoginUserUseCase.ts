import { AuthenticationError } from "../../domain/errors/DomainError";
import { UserRepository } from "../../domain/users/UserRepository";
import { Email } from "../../domain/users/value-objects/Email";
import { PasswordHasher } from "../ports/PasswordHasher";
import { TokenService } from "../ports/TokenService";

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  async execute(input: { email: string; password: string }) {
    const email = Email.create(input.email);
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new AuthenticationError("Invalid credentials");
    }

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError("Invalid credentials");
    }

    const dto = user.toPrimitives();
    const token = this.tokens.sign({ userId: dto.id!, email: dto.email, username: dto.username });
    const { passwordHash, ...safe } = dto;
    return {
      user: {
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
      },
      token,
    };
  }
}
