import { AppError } from "../utils/error";

export function validateUsername(username: string) {
  if (!username || !username.trim()) {
    throw new AppError(400, "Username must not be empty");
  }
}

export function validateEmail(email: string) {
  if (!email || !email.trim()) {
    throw new AppError(400, "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError(400, "Invalid email");
  }
}

export function validateBalance(balance: number) {
  if (balance < 0) {
    throw new AppError(400, "Balance must be non-negative");
  }
}
