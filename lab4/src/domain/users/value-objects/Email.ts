import { ValidationError } from "../../errors/DomainError";

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value || !value.trim()) {
      throw new ValidationError("Email is required");
    }

    const normalized = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      throw new ValidationError("Invalid email");
    }

    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
