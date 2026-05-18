import { AuditLogReadRepository } from "../../application/queries/audit/AuditLogReadRepository";
import { AuditLogReadModel } from "../../application/read-models/AuditLogReadModel";
import { AuditLogEntry } from "./AuditLogEntry";
import { AuditLogPort } from "./AuditLogPort";

export class InMemoryAuditLogStore implements AuditLogPort, AuditLogReadRepository {
  private readonly entries: AuditLogEntry[] = [];

  async record(entry: AuditLogEntry): Promise<void> {
    this.entries.unshift({ ...entry });
  }

  async findAll(): Promise<AuditLogReadModel[]> {
    return this.entries.map((entry) => ({ ...entry }));
  }

  clear() {
    this.entries.length = 0;
  }
}
