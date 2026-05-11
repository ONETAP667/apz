export class CreateItemCommand {
  constructor(
    public readonly data: {
      OwnerID: number;
      Price?: number;
      Type: number | null;
      Weapon?: number | null;
      Special?: number | null;
      SkinID?: number;
      Nametag?: string | null;
    }
  ) {}
}
