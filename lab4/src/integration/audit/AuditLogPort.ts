import { AuditLogEntry } from "./AuditLogEntry";

export interface AuditLogPort {
  record(entry: AuditLogEntry): Promise<void>;
}
