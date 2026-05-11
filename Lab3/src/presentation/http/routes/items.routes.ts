import { Router } from "express";
import { ValidationError, AuthenticationError } from "../../../domain/errors/DomainError";
import { container } from "../../../composition/container";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { GetItemsQuery } from "../../../application/queries/items/GetItemsQuery";
import { GetItemByIdQuery } from "../../../application/queries/items/GetItemByIdQuery";
import { CreateItemCommand } from "../../../application/commands/items/CreateItemCommand";
import { UpdateItemCommand } from "../../../application/commands/items/UpdateItemCommand";
import { DeleteItemCommand } from "../../../application/commands/items/DeleteItemCommand";
import { BuyItemCommand } from "../../../application/commands/items/BuyItemCommand";

const router = Router();

function parseId(value: string, label: string) {
  const id = Number(value);
  if (Number.isNaN(id)) throw new ValidationError(`Invalid ${label} id`);
  return id;
}

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    res.json(await container.items.queries.getAll.execute(new GetItemsQuery()));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const query = new GetItemByIdQuery(parseId(String(req.params.id), "item"));
    res.json(await container.items.queries.getById.execute(query));
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = await container.items.commands.create.execute(new CreateItemCommand(req.body));
    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(String(req.params.id), "item");
    await container.items.commands.update.execute(new UpdateItemCommand(id, req.body));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(String(req.params.id), "item");
    await container.items.commands.delete.execute(new DeleteItemCommand(id));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.post("/:id/buy", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw new AuthenticationError("Unauthorized");
    const itemId = parseId(String(req.params.id), "item");
    await container.items.commands.buy.execute(new BuyItemCommand(itemId, req.user.userId));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export const itemsRouter = router;
