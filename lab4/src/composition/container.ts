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
import { BuyItemSyncCommandHandler } from "../application/commands/items/BuyItemSyncCommandHandler";
import { BuyItemAsyncCommandHandler } from "../application/commands/items/BuyItemAsyncCommandHandler";
import { GetAuditLogsQueryHandler } from "../application/queries/audit/GetAuditLogsQueryHandler";
import { InMemoryAuditLogStore } from "../integration/audit/InMemoryAuditLogStore";
import { InMemoryEventPublisher } from "../integration/events/InMemoryEventPublisher";
import { AuditOnItemPurchasedHandler } from "../integration/events/handlers/AuditOnItemPurchasedHandler";
import { EventPublisher } from "../integration/events/EventPublisher";
import { getRabbitMQConfig } from "../integration/rabbitmq/RabbitMQConfig";
import { RabbitMQConnectionManager } from "../integration/rabbitmq/RabbitMQConnection";
import { RabbitMQEventPublisher } from "../integration/rabbitmq/RabbitMQEventPublisher";
import { RabbitMQAuditConsumer } from "../integration/rabbitmq/RabbitMQAuditConsumer";

const users = new PrismaUserRepository();
const items = new PrismaItemRepository();
const userReads = new PrismaUserReadRepository();
const itemReads = new PrismaItemReadRepository();
const hasher = new BcryptPasswordHasher();
const tokens = new JwtTokenService();
const userFactory = new UserFactory(users);
const itemFactory = new ItemFactory(users);
const auditLogs = new InMemoryAuditLogStore();

const asyncTransport = process.env.ASYNC_TRANSPORT === "inmemory" ? "inmemory" : "rabbitmq";

const rabbitConfig = getRabbitMQConfig();
const rabbitConnectionManager = new RabbitMQConnectionManager(rabbitConfig);
const rabbitPublisher = new RabbitMQEventPublisher(rabbitConnectionManager, rabbitConfig);
const rabbitAuditConsumer = new RabbitMQAuditConsumer(rabbitConnectionManager, rabbitConfig, auditLogs);

const inMemoryPublisher = new InMemoryEventPublisher();
inMemoryPublisher.subscribe(new AuditOnItemPurchasedHandler(auditLogs));

const eventPublisher: EventPublisher = asyncTransport === "rabbitmq" ? rabbitPublisher : inMemoryPublisher;

export async function startIntegrationConsumers(): Promise<void> {
  if (asyncTransport === "rabbitmq") {
    await rabbitAuditConsumer.start();
  }
}

export async function stopIntegrationConsumers(): Promise<void> {
  if (asyncTransport === "rabbitmq") {
    await rabbitConnectionManager.close();
  }
}

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
  audit: {
    queries: {
      getAll: new GetAuditLogsQueryHandler(auditLogs),
    },
    stores: {
      auditLogs,
      eventPublisher,
      asyncTransport,
      inMemoryPublisher,
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
      buySync: new BuyItemSyncCommandHandler(items, users, auditLogs),
      buyAsync: new BuyItemAsyncCommandHandler(items, users, eventPublisher),
    },
  },
};
