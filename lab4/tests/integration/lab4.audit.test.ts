import { container } from "../../src/composition/container";
import request from "supertest";
import { createApp } from "../../src/presentation/http/app";
import { prisma } from "../../src/infrastructure/prisma/prisma";
import { BcryptPasswordHasher } from "../../src/infrastructure/security/BcryptPasswordHasher";

const app = createApp();

const ADMIN_EMAIL = "admin@mail.test";
const ADMIN_PASSWORD = "admin123";
const BUYER_EMAIL = "buyer.lab4@example.com";

describe("Lab 4 audit communication", () => {
  let adminToken: string;
  let buyerToken: string;
  let adminId: number;
  let buyerId: number;

  beforeAll(async () => {
    await prisma.items.deleteMany();
    await prisma.users.deleteMany({ where: { email: { not: ADMIN_EMAIL } } });
    await ensureAdmin();
  });

  afterEach(async () => {
    container.audit.stores.auditLogs.clear();
    container.audit.stores.inMemoryPublisher.clearErrors();
    await prisma.items.deleteMany();
    await prisma.users.deleteMany({ where: { email: { not: ADMIN_EMAIL } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function ensureAdmin() {
    let admin = await prisma.users.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) {
      const password_hash = await new BcryptPasswordHasher().hash(ADMIN_PASSWORD);
      admin = await prisma.users.create({
        data: { Username: "Admin", email: ADMIN_EMAIL, password_hash, Balance: 0 },
      });
    }
    return admin;
  }

  async function loginAdmin() {
    const admin = await ensureAdmin();
    const loginRes = await request(app).post("/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    return { admin, token: loginRes.body.token as string };
  }

  async function createBuyer(balance = 1000) {
    const registerRes = await request(app).post("/auth/register").send({
      email: BUYER_EMAIL,
      password: "123456",
      username: "buyer",
    });
    const user = await prisma.users.update({ where: { email: BUYER_EMAIL }, data: { Balance: balance } });
    return { user, token: registerRes.body.token as string };
  }

  async function createItemForSale() {
    const createItemRes = await request(app)
      .post("/items")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ OwnerID: adminId, Price: 300, Type: 1, Weapon: 10, SkinID: 1, Nametag: "USP-S" });
    return createItemRes.body.id as number;
  }

  beforeEach(async () => {
    const adminData = await loginAdmin();
    adminToken = adminData.token;
    adminId = adminData.admin.ID;

    const buyerData = await createBuyer(1000);
    buyerToken = buyerData.token;
    buyerId = buyerData.user.ID;
  });

  it("records an audit log for sync purchase immediately", async () => {
    const itemId = await createItemForSale();

    const buyRes = await request(app)
      .post(`/items/${itemId}/buy-sync`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(buyRes.status).toBe(204);

    const logsRes = await request(app)
      .get("/audit-logs")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.some((entry: any) => entry.itemId === itemId && entry.mode === "sync" && entry.buyerId === buyerId)).toBe(true);
  });

  it("records an audit log for async purchase after event processing", async () => {
    const itemId = await createItemForSale();

    const buyRes = await request(app)
      .post(`/items/${itemId}/buy-async`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(buyRes.status).toBe(204);

    await new Promise((resolve) => setTimeout(resolve, 30));

    const logsRes = await request(app)
      .get("/audit-logs")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.some((entry: any) => entry.itemId === itemId && entry.mode === "async" && entry.buyerId === buyerId)).toBe(true);
  });
});
