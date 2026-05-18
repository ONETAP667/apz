import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { usersRouter } from "./routes/users.routes";
import { itemsRouter } from "./routes/items.routes";
import { auditRouter } from "./routes/audit.routes";
import { errorHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/items", itemsRouter);
  app.use("/audit-logs", auditRouter);
  app.use(errorHandler);
  return app;
}
