import { UserFactory } from "../domain/users/UserFactory";
import { ItemFactory } from "../domain/items/ItemFactory";
import { PrismaUserRepository } from "../infrastructure/prisma/repositories/PrismaUserRepository";
import { PrismaItemRepository } from "../infrastructure/prisma/repositories/PrismaItemRepository";
import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher";
import { JwtTokenService } from "../infrastructure/security/JwtTokenService";
import { RegisterUserUseCase } from "../application/auth/RegisterUserUseCase";
import { LoginUserUseCase } from "../application/auth/LoginUserUseCase";
import { GetUsersUseCase } from "../application/users/GetUsersUseCase";
import { GetUserByIdUseCase } from "../application/users/GetUserByIdUseCase";
import { UpdateUserUseCase } from "../application/users/UpdateUserUseCase";
import { ArchiveUserUseCase } from "../application/users/ArchiveUserUseCase";
import { GetItemsUseCase } from "../application/items/GetItemsUseCase";
import { GetItemByIdUseCase } from "../application/items/GetItemByIdUseCase";
import { CreateItemUseCase } from "../application/items/CreateItemUseCase";
import { UpdateItemUseCase } from "../application/items/UpdateItemUseCase";
import { DeleteItemUseCase } from "../application/items/DeleteItemUseCase";
import { BuyItemUseCase } from "../application/items/BuyItemUseCase";

const users = new PrismaUserRepository();
const items = new PrismaItemRepository();
const hasher = new BcryptPasswordHasher();
const tokens = new JwtTokenService();
const userFactory = new UserFactory(users);
const itemFactory = new ItemFactory(users);

export const container = {
  tokens,
  auth: {
    register: new RegisterUserUseCase(users, userFactory, hasher, tokens),
    login: new LoginUserUseCase(users, hasher, tokens),
  },
  users: {
    getAll: new GetUsersUseCase(users),
    getById: new GetUserByIdUseCase(users),
    update: new UpdateUserUseCase(users),
    archive: new ArchiveUserUseCase(users),
  },
  items: {
    getAll: new GetItemsUseCase(items),
    getById: new GetItemByIdUseCase(items),
    create: new CreateItemUseCase(items, itemFactory),
    update: new UpdateItemUseCase(items, users),
    delete: new DeleteItemUseCase(items),
    buy: new BuyItemUseCase(items, users),
  },
};
