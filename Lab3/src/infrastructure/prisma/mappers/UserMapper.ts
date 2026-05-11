import { Money } from "../../../domain/common/Money";
import { User } from "../../../domain/users/User";
import { Email } from "../../../domain/users/value-objects/Email";

export class UserMapper {
  static toDomain(row: any): User {
    return User.create({
      id: row.ID,
      username: row.Username,
      email: Email.create(row.email),
      balance: Money.create(row.Balance ?? 0),
      dateJoined: row.DateJoined,
      restrictionType: row.RestrictionType,
      restrictedUntil: row.RestrictedUntil,
      restrictionReason: row.RestrictionReason,
      archive: row.Archive,
      version: row.Version,
      passwordHash: row.password_hash,
    });
  }

  static toPersistence(user: User) {
    const dto = user.toPrimitives();
    return {
      Username: dto.username,
      email: dto.email,
      Balance: dto.balance,
      RestrictionType: dto.restrictionType,
      RestrictedUntil: dto.restrictedUntil,
      RestrictionReason: dto.restrictionReason,
      Archive: dto.archive,
      Version: dto.version,
      password_hash: dto.passwordHash,
    };
  }
}
