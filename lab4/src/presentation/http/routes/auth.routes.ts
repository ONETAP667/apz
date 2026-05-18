import { Router } from "express";
import { ValidationError } from "../../../domain/errors/DomainError";
import { container } from "../../../composition/container";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      throw new ValidationError("Email, password and username are required");
    }
    res.status(201).json(await container.auth.register.execute({ email, password, username }));
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }
    res.json(await container.auth.login.execute({ email, password }));
  } catch (e) { next(e); }
});

export const authRouter = router;
