import { Item } from "../../domain/items/Item";

export function toItemDto(item: Item) {
  const dto = item.toPrimitives();
  return {
    ID: dto.id,
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
