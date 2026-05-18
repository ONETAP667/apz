import { AuditLogReadModel } from "../../read-models/AuditLogReadModel";
import { AuditLogReadRepository } from "./AuditLogReadRepository";
import { GetAuditLogsQuery } from "./GetAuditLogsQuery";

export class GetAuditLogsQueryHandler {
  constructor(private readonly auditLogs: AuditLogReadRepository) {}

  async execute(_query: GetAuditLogsQuery): Promise<AuditLogReadModel[]> {
    return this.auditLogs.findAll();
  }
}
