import bcrypt from "bcrypt";
import { PasswordHasher } from "../../application/ports/PasswordHasher";

export class BcryptPasswordHasher implements PasswordHasher {
  hash(raw: string) {
    return bcrypt.hash(raw, 10);
  }

  compare(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }
}
