import { Money } from "../../../domain/common/Money";
import { Item } from "../../../domain/items/Item";

export class ItemMapper {
  static toDomain(row: any): Item {
    return Item.create({
      id: row.ID,
      ownerId: row.OwnerID,
      price: Money.price(row.Price ?? 0),
      type: row.Type,
      weapon: row.Weapon,
      special: row.Special,
      skinId: row.SkinID,
      nametag: row.Nametag,
      archive: row.Archive,
    });
  }

  static toPersistence(item: Item) {
    const dto = item.toPrimitives();
    return {
      OwnerID: dto.ownerId,
      Price: dto.price,
      Type: dto.type,
      Weapon: dto.weapon,
      Special: dto.special,
      SkinID: dto.skinId,
      Nametag: dto.nametag,
      Archive: dto.archive,
    };
  }
}
