import { Money } from "../common/Money";
import { ValidationError } from "../errors/DomainError";
import { User } from "../users/User";

export type ItemProps = {
  id?: number;
  ownerId: number;
  price: Money;
  type: number | null;
  weapon?: number | null;
  special?: number | null;
  skinId?: number;
  nametag?: string | null;
  archive?: boolean;
};

export class Item {
  private props: ItemProps;

  private constructor(props: ItemProps) {
    this.props = props;
  }

  static create(props: ItemProps): Item {
    Item.validateTypeWeaponRule(props.type, props.weapon);
    return new Item({
      ...props,
      weapon: props.weapon ?? null,
      special: props.special ?? null,
      skinId: props.skinId ?? 0,
      nametag: props.nametag ?? null,
      archive: props.archive ?? false,
    });
  }

  static validateTypeWeaponRule(type: number | null, weapon?: number | null) {
    if (type === 1 && (weapon === null || weapon === undefined)) {
      throw new ValidationError("Weapon is required when Type = 1");
    }
    if (type !== 1 && weapon !== null && weapon !== undefined) {
      throw new ValidationError("Weapon must be null when Type != 1");
    }
  }

  get id() { return this.props.id; }
  get ownerId() { return this.props.ownerId; }
  get price() { return this.props.price; }
  get type() { return this.props.type; }
  get weapon() { return this.props.weapon ?? null; }
  get special() { return this.props.special ?? null; }
  get skinId() { return this.props.skinId ?? 0; }
  get nametag() { return this.props.nametag ?? null; }
  get isArchived() { return this.props.archive ?? false; }

  ensureActive() {
    if (this.isArchived) {
      throw new ValidationError("Item is archived");
    }
  }

  update(params: Partial<{
    ownerId: number;
    price: Money;
    type: number | null;
    weapon: number | null;
    special: number | null;
    skinId: number;
    nametag: string | null;
  }>) {
    const nextType = params.type !== undefined ? params.type : this.type;
    const nextWeapon = params.weapon !== undefined ? params.weapon : this.weapon;
    Item.validateTypeWeaponRule(nextType, nextWeapon);

    this.props = {
      ...this.props,
      ownerId: params.ownerId ?? this.ownerId,
      price: params.price ?? this.price,
      type: nextType,
      weapon: nextWeapon,
      special: params.special !== undefined ? params.special : this.special,
      skinId: params.skinId ?? this.skinId,
      nametag: params.nametag !== undefined ? params.nametag : this.nametag,
    };
  }

  buyBy(buyer: User, seller: User) {
    this.ensureActive();
    buyer.ensureActive();
    seller.ensureActive();

    if (this.ownerId !== seller.id) {
      throw new ValidationError("Seller does not own this item");
    }
    if (buyer.id === this.ownerId) {
      throw new ValidationError("You cannot buy your own item");
    }

    buyer.withdraw(this.price);
    seller.deposit(this.price);
    this.props.ownerId = buyer.id!;
  }

  toPrimitives() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      price: this.price.value(),
      type: this.type,
      weapon: this.weapon,
      special: this.special,
      skinId: this.skinId,
      nametag: this.nametag,
      archive: this.isArchived,
    };
  }
}
