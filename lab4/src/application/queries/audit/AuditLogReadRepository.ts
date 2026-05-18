import { AuditLogReadModel } from "../../read-models/AuditLogReadModel";

export interface AuditLogReadRepository {
  findAll(): Promise<AuditLogReadModel[]>;
}
