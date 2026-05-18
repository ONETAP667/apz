export type AuditLogReadModel = {
  id: string;
  type: string;
  occurredAt: string;
  itemId: number;
  buyerId: number;
  sellerId: number;
  price: number;
  mode: "sync" | "async";
};
