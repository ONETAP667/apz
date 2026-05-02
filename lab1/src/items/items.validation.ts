import { AppError } from "../utils/error";

export function validatePrice(price: number) {
  if (price < 0) {
    throw new AppError(400, "Price must be non-negative");
  }
}

export function validateTypeWeaponRule(
  type: number | null,
  weapon?: number | null
) {
  if (type === 1 && (weapon === null || weapon === undefined)) {
    throw new AppError(400, "Weapon is required when Type = 1");
  }

  if (type !== 1 && weapon !== null && weapon !== undefined) {
    throw new AppError(400, "Weapon must be null when Type != 1");
  }
}
