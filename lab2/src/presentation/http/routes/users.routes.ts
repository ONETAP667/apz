import { Router } from "express";
import { ValidationError } from "../../../domain/errors/DomainError";
import { container } from "../../../composition/container";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

function parseId(value: string, label: string) {
  const id = Number(value);
  if (Number.isNaN(id)) throw new ValidationError(`Invalid ${label} id`);
  return id;
}

router.get("/", requireAuth, async (_req, res, next) => {
  try { res.json(await container.users.getAll.execute()); } catch (e) { next(e); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try { res.json(await container.users.getById.execute(parseId(String(req.params.id), "user"))); } catch (e) { next(e); }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try { res.json(await container.users.update.execute(parseId(String(req.params.id), "user"), req.body)); } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try { res.json(await container.users.archive.execute(parseId(String(req.params.id), "user"))); } catch (e) { next(e); }
});

export const usersRouter = router;
