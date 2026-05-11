import { Router } from "express";
import { ValidationError } from "../../../domain/errors/DomainError";
import { container } from "../../../composition/container";
import { requireAuth } from "../middlewares/auth.middleware";
import { GetUsersQuery } from "../../../application/queries/users/GetUsersQuery";
import { GetUserByIdQuery } from "../../../application/queries/users/GetUserByIdQuery";
import { UpdateUserCommand } from "../../../application/commands/users/UpdateUserCommand";
import { ArchiveUserCommand } from "../../../application/commands/users/ArchiveUserCommand";

const router = Router();

function parseId(value: string, label: string) {
  const id = Number(value);
  if (Number.isNaN(id)) throw new ValidationError(`Invalid ${label} id`);
  return id;
}

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    res.json(await container.users.queries.getAll.execute(new GetUsersQuery()));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const query = new GetUserByIdQuery(parseId(String(req.params.id), "user"));
    res.json(await container.users.queries.getById.execute(query));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(String(req.params.id), "user");
    await container.users.commands.update.execute(new UpdateUserCommand(id, req.body));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(String(req.params.id), "user");
    await container.users.commands.archive.execute(new ArchiveUserCommand(id));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export const usersRouter = router;
