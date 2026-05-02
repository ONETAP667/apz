import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { AppError } from "../utils/error";
import { UsersService } from "./users.service";

const router = Router();
const service = new UsersService();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const users = await service.getAll();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, "Invalid user id");
    }

    const user = await service.getById(id);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, "Invalid user id");
    }

    const updated = await service.update(id, req.body);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, "Invalid user id");
    }

    const result = await service.remove(id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export const usersRouter = router;