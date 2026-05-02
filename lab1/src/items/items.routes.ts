import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { requireAdmin } from "../auth/admin.middleware";
import { AppError } from "../utils/error";
import { ItemsService } from "./items.service";

const router = Router();
const service = new ItemsService();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const items = await service.getAll();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, "Invalid item id");
    }

    const item = await service.getById(id);
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, "Invalid item id");
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
      throw new AppError(400, "Invalid item id");
    }

    const result = await service.remove(id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/buy", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, "Invalid item id");
    }

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const result = await service.buy(id, req.user.userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
export const itemsRouter = router;