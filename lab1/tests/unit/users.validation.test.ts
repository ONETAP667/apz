import {
  validateUsername,
  validateEmail,
  validateBalance,
} from "../../src/users/users.validation";
import { AppError } from "../../src/utils/error";

describe("users.validation", () => {
  describe("validateUsername", () => {
    it("should not throw for valid username", () => {
      expect(() => validateUsername("Admin")).not.toThrow();
    });

    it("should throw for empty username", () => {
      expect(() => validateUsername("")).toThrow(AppError);
      expect(() => validateUsername("")).toThrow("Username must not be empty");
    });

    it("should throw for whitespace username", () => {
      expect(() => validateUsername("   ")).toThrow(AppError);
      expect(() => validateUsername("   ")).toThrow("Username must not be empty");
    });
  });

  describe("validateEmail", () => {
    it("should not throw for valid email", () => {
      expect(() => validateEmail("test@example.com")).not.toThrow();
    });

    it("should throw when email is empty", () => {
      expect(() => validateEmail("")).toThrow(AppError);
      expect(() => validateEmail("")).toThrow("Email is required");
    });

    it("should throw for invalid email without @", () => {
      expect(() => validateEmail("testexample.com")).toThrow(AppError);
      expect(() => validateEmail("testexample.com")).toThrow("Invalid email");
    });

    it("should throw for invalid email without domain", () => {
      expect(() => validateEmail("test@")).toThrow(AppError);
      expect(() => validateEmail("test@")).toThrow("Invalid email");
    });
  });

  describe("validateBalance", () => {
    it("should not throw for zero balance", () => {
      expect(() => validateBalance(0)).not.toThrow();
    });

    it("should not throw for positive balance", () => {
      expect(() => validateBalance(100)).not.toThrow();
    });

    it("should throw for negative balance", () => {
      expect(() => validateBalance(-1)).toThrow(AppError);
      expect(() => validateBalance(-1)).toThrow("Balance must be non-negative");
    });
  });
});
