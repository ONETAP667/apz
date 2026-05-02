import { Router } from "express";
import { AuthService } from "./auth.service";
import { AppError } from "../utils/error";

const router = Router();
const service = new AuthService();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      throw new AppError(400, "Email, password and username are required");
    }

    const result = await service.register(email, password, username);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }

    const result = await service.login(email, password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export const authRouter = router;