import { Money } from "../common/Money";
import { ValidationError } from "../errors/DomainError";
import { Email } from "./value-objects/Email";

export type UserProps = {
  id?: number;
  username: string;
  email: Email;
  balance: Money;
  dateJoined?: Date;
  restrictionType?: number | null;
  restrictedUntil?: Date | null;
  restrictionReason?: string | null;
  archive?: boolean;
  version?: number;
  passwordHash?: string;
};

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(props: UserProps): User {
    if (!props.username || !props.username.trim()) {
      throw new ValidationError("Username must not be empty");
    }
    return new User({
      ...props,
      username: props.username.trim(),
      archive: props.archive ?? false,
      version: props.version ?? 0,
      dateJoined: props.dateJoined ?? new Date(),
    });
  }

  get id() { return this.props.id; }
  get username() { return this.props.username; }
  get email() { return this.props.email; }
  get balance() { return this.props.balance; }
  get isArchived() { return this.props.archive ?? false; }
  get passwordHash() { return this.props.passwordHash; }
  get version() { return this.props.version ?? 0; }
  get dateJoined() { return this.props.dateJoined; }
  get restrictionType() { return this.props.restrictionType ?? null; }
  get restrictedUntil() { return this.props.restrictedUntil ?? null; }
  get restrictionReason() { return this.props.restrictionReason ?? null; }

  ensureActive() {
    if (this.isArchived) {
      throw new ValidationError("User is archived");
    }
  }

  changeUsername(username: string) {
    if (!username || !username.trim()) {
      throw new ValidationError("Username must not be empty");
    }
    this.props.username = username.trim();
  }

  changeEmail(email: Email) {
    this.props.email = email;
  }

  changeBalance(balance: Money) {
    this.props.balance = balance;
  }

  withdraw(amount: Money) {
    this.ensureActive();
    if (this.props.balance.isLessThan(amount)) {
      throw new ValidationError("Insufficient balance");
    }
    this.props.balance = this.props.balance.subtract(amount);
  }

  deposit(amount: Money) {
    this.ensureActive();
    this.props.balance = this.props.balance.add(amount);
  }

  archive() {
    this.props.archive = true;
  }

  toPrimitives() {
    return {
      id: this.id,
      username: this.username,
      email: this.email.toString(),
      balance: this.balance.value(),
      dateJoined: this.dateJoined,
      restrictionType: this.restrictionType,
      restrictedUntil: this.restrictedUntil,
      restrictionReason: this.restrictionReason,
      archive: this.isArchived,
      version: this.version,
      passwordHash: this.passwordHash,
    };
  }
}
