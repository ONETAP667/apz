import express from "express";
import cors from "cors";

import { authRouter } from "./auth/auth.routes";
import { usersRouter } from "./users/users.routes";
import { itemsRouter } from "./items/items.routes";
import { errorHandler } from "./utils/error";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/items", itemsRouter);

  app.use(errorHandler);

  return app;
}
