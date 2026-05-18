import { ValidationError } from "../errors/DomainError";

export class Money {
  private constructor(private readonly amount: number) {}

  static create(amount: number): Money {
    if (!Number.isFinite(amount)) {
      throw new ValidationError("Money amount must be a finite number");
    }
    if (amount < 0) {
      throw new ValidationError("Balance must be non-negative");
    }
    return new Money(amount);
  }

  static price(amount: number): Money {
    if (!Number.isFinite(amount)) {
      throw new ValidationError("Price must be a finite number");
    }
    if (amount < 0) {
      throw new ValidationError("Price must be non-negative");
    }
    return new Money(amount);
  }

  value(): number {
    return this.amount;
  }

  add(other: Money): Money {
    return Money.create(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return Money.create(this.amount - other.amount);
  }

  isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }
}
