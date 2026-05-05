import { Router } from "express";
import { ValidationError, AuthenticationError } from "../../../domain/errors/DomainError";
import { container } from "../../../composition/container";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

function parseId(value: string, label: string) {
  const id = Number(value);
  if (Number.isNaN(id)) throw new ValidationError(`Invalid ${label} id`);
  return id;
}

router.get("/", requireAuth, async (_req, res, next) => {
  try { res.json(await container.items.getAll.execute()); } catch (e) { next(e); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try { res.json(await container.items.getById.execute(parseId(String(req.params.id), "item"))); } catch (e) { next(e); }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try { res.status(201).json(await container.items.create.execute(req.body)); } catch (e) { next(e); }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try { res.json(await container.items.update.execute(parseId(String(req.params.id), "item"), req.body)); } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try { res.json(await container.items.delete.execute(parseId(String(req.params.id), "item"))); } catch (e) { next(e); }
});

router.post("/:id/buy", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw new AuthenticationError("Unauthorized");
    res.json(await container.items.buy.execute(parseId(String(req.params.id), "item"), req.user.userId));
  } catch (e) { next(e); }
});

export const itemsRouter = router;
