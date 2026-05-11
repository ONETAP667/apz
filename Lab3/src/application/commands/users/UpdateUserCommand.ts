export class UpdateUserCommand {
  constructor(
    public readonly id: number,
    public readonly data: { Username?: string; email?: string; Balance?: number; Archive?: boolean }
  ) {}
}
