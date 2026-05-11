import { UserFactory } from "../domain/users/UserFactory";
import { ItemFactory } from "../domain/items/ItemFactory";
import { PrismaUserRepository } from "../infrastructure/prisma/repositories/PrismaUserRepository";
import { PrismaItemRepository } from "../infrastructure/prisma/repositories/PrismaItemRepository";
import { PrismaUserReadRepository } from "../infrastructure/prisma/read-repositories/PrismaUserReadRepository";
import { PrismaItemReadRepository } from "../infrastructure/prisma/read-repositories/PrismaItemReadRepository";
import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher";
import { JwtTokenService } from "../infrastructure/security/JwtTokenService";
import { RegisterUserUseCase } from "../application/auth/RegisterUserUseCase";
import { LoginUserUseCase } from "../application/auth/LoginUserUseCase";
import { GetUsersQueryHandler } from "../application/queries/users/GetUsersQueryHandler";
import { GetUserByIdQueryHandler } from "../application/queries/users/GetUserByIdQueryHandler";
import { GetItemsQueryHandler } from "../application/queries/items/GetItemsQueryHandler";
import { GetItemByIdQueryHandler } from "../application/queries/items/GetItemByIdQueryHandler";
import { UpdateUserCommandHandler } from "../application/commands/users/UpdateUserCommandHandler";
import { ArchiveUserCommandHandler } from "../application/commands/users/ArchiveUserCommandHandler";
import { CreateItemCommandHandler } from "../application/commands/items/CreateItemCommandHandler";
import { UpdateItemCommandHandler } from "../application/commands/items/UpdateItemCommandHandler";
import { DeleteItemCommandHandler } from "../application/commands/items/DeleteItemCommandHandler";
import { BuyItemCommandHandler } from "../application/commands/items/BuyItemCommandHandler";

const users = new PrismaUserRepository();
const items = new PrismaItemRepository();
const userReads = new PrismaUserReadRepository();
const itemReads = new PrismaItemReadRepository();
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
    queries: {
      getAll: new GetUsersQueryHandler(userReads),
      getById: new GetUserByIdQueryHandler(userReads),
    },
    commands: {
      update: new UpdateUserCommandHandler(users),
      archive: new ArchiveUserCommandHandler(users),
    },
  },
  items: {
    queries: {
      getAll: new GetItemsQueryHandler(itemReads),
      getById: new GetItemByIdQueryHandler(itemReads),
    },
    commands: {
      create: new CreateItemCommandHandler(items, itemFactory),
      update: new UpdateItemCommandHandler(items, users),
      delete: new DeleteItemCommandHandler(items),
      buy: new BuyItemCommandHandler(items, users),
    },
  },
};
