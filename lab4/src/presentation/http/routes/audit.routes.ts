import { Router } from "express";
import { container } from "../../../composition/container";
import { GetAuditLogsQuery } from "../../../application/queries/audit/GetAuditLogsQuery";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const logs = await container.audit.queries.getAll.execute(new GetAuditLogsQuery());
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export const auditRouter = router;
