export type ItemReadModel = {
  ID: number;
  OwnerID: number;
  Price: number;
  Type: number | null;
  Weapon: number | null;
  Special: number | null;
  SkinID: number;
  Nametag: string | null;
  Archive: boolean;
};
