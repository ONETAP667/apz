export class BuyItemCommand {
  constructor(
    public readonly itemId: number,
    public readonly buyerId: number
  ) {}
}
