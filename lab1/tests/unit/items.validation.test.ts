import {
  validatePrice,
  validateTypeWeaponRule,
} from "../../src/items/items.validation";
import { AppError } from "../../src/utils/error";

describe("items.validation", () => {
  describe("validatePrice", () => {
    it("should not throw for zero price", () => {
      expect(() => validatePrice(0)).not.toThrow();
    });

    it("should not throw for positive price", () => {
      expect(() => validatePrice(500)).not.toThrow();
    });

    it("should throw for negative price", () => {
      expect(() => validatePrice(-10)).toThrow(AppError);
      expect(() => validatePrice(-10)).toThrow("Price must be non-negative");
    });
  });

  describe("validateTypeWeaponRule", () => {
    it("should not throw when Type = 1 and Weapon is provided", () => {
      expect(() => validateTypeWeaponRule(1, 10)).not.toThrow();
    });

    it("should throw when Type = 1 and Weapon is missing", () => {
      expect(() => validateTypeWeaponRule(1, null)).toThrow(AppError);
      expect(() => validateTypeWeaponRule(1, null)).toThrow(
        "Weapon is required when Type = 1"
      );
    });

    it("should not throw when Type != 1 and Weapon is null", () => {
      expect(() => validateTypeWeaponRule(2, null)).not.toThrow();
    });

    it("should throw when Type != 1 and Weapon is provided", () => {
      expect(() => validateTypeWeaponRule(2, 5)).toThrow(AppError);
      expect(() => validateTypeWeaponRule(2, 5)).toThrow(
        "Weapon must be null when Type != 1"
      );
    });

    it("should throw when Type is null and Weapon is provided", () => {
      expect(() => validateTypeWeaponRule(null, 5)).toThrow(AppError);
      expect(() => validateTypeWeaponRule(null, 5)).toThrow(
        "Weapon must be null when Type != 1"
      );
    });

    it("should not throw when Type is null and Weapon is null", () => {
      expect(() => validateTypeWeaponRule(null, null)).not.toThrow();
    });
  });
});
