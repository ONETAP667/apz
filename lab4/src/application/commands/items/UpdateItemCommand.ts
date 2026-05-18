export class UpdateItemCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      OwnerID?: number;
      Price?: number;
      Type?: number | null;
      Weapon?: number | null;
      Special?: number | null;
      SkinID?: number;
      Nametag?: string | null;
    }
  ) {}
}
