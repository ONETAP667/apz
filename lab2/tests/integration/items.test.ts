import request from "supertest";
import { createApp } from "../../src/presentation/http/app";
import { prisma } from "../../src/infrastructure/prisma/prisma";
import { BcryptPasswordHasher } from "../../src/infrastructure/security/BcryptPasswordHasher";

const app = createApp();

const ADMIN_EMAIL = "admin@mail.test";
const ADMIN_PASSWORD = "admin123";
const BUYER_EMAIL = "buyer@example.com";

describe("Items API", () => {
  let adminToken: string;
  let buyerToken: string;
  let adminId: number;
  let buyerId: number;

  beforeAll(async () => {
    await prisma.items.deleteMany();

    await prisma.users.deleteMany({
      where: {
        email: {
          not: ADMIN_EMAIL,
        },
      },
    });

    await ensureAdmin();
  });

  afterEach(async () => {
    await prisma.items.deleteMany();

    await prisma.users.deleteMany({
      where: {
        email: {
          not: ADMIN_EMAIL,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function ensureAdmin() {
    let admin = await prisma.users.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!admin) {
      const password_hash = await new BcryptPasswordHasher().hash(ADMIN_PASSWORD);

      admin = await prisma.users.create({
        data: {
          Username: "Admin",
          email: ADMIN_EMAIL,
          password_hash,
          Balance: 0,
        },
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

    if (loginRes.status !== 200) {
      throw new Error(
        `Admin login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`
      );
    }

    return {
      admin,
      token: loginRes.body.token as string,
    };
  }

  async function createBuyer(balance = 1000) {
    const registerRes = await request(app).post("/auth/register").send({
      email: BUYER_EMAIL,
      password: "123456",
      username: "buyer",
    });

    const user = await prisma.users.update({
      where: { email: BUYER_EMAIL },
      data: { Balance: balance },
    });

    return {
      user,
      token: registerRes.body.token as string,
    };
  }

  describe("POST /items", () => {
    beforeEach(async () => {
      const adminData = await loginAdmin();
      adminToken = adminData.token;
      adminId = adminData.admin.ID;

      const buyerData = await createBuyer();
      buyerToken = buyerData.token;
      buyerId = buyerData.user.ID;
    });

    it("should allow Admin to create item", async () => {
      const res = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          OwnerID: adminId,
          Price: 500,
          Type: 1,
          Weapon: 10,
          SkinID: 1,
          Nametag: "AK-47",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("ID");
      expect(res.body.OwnerID).toBe(adminId);
      expect(res.body.Price).toBe(500);
    });

    it("should return 403 if non-admin tries to create item", async () => {
      const res = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          OwnerID: buyerId,
          Price: 500,
          Type: 1,
          Weapon: 10,
          SkinID: 1,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
    });

    it("should return 400 for negative price", async () => {
      const res = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          OwnerID: adminId,
          Price: -10,
          Type: 1,
          Weapon: 10,
          SkinID: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Price must be non-negative");
    });

    it("should return 400 when Type = 1 and Weapon is missing", async () => {
      const res = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          OwnerID: adminId,
          Price: 100,
          Type: 1,
          SkinID: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Weapon is required when Type = 1");
    });

    it("should return 400 when Type != 1 and Weapon is provided", async () => {
      const res = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          OwnerID: adminId,
          Price: 100,
          Type: 2,
          Weapon: 10,
          SkinID: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Weapon must be null when Type != 1");
    });
  });

  describe("POST /items/:id/buy", () => {
    let itemId: number;
    let sellerBalanceBefore: number;

    beforeEach(async () => {
      const adminData = await loginAdmin();
      adminToken = adminData.token;
      adminId = adminData.admin.ID;
      sellerBalanceBefore = adminData.admin.Balance;

      const buyerData = await createBuyer(1000);
      buyerToken = buyerData.token;
      buyerId = buyerData.user.ID;

      const createItemRes = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          OwnerID: adminId,
          Price: 300,
          Type: 1,
          Weapon: 10,
          SkinID: 1,
          Nametag: "M4A1-S",
        });

      itemId = createItemRes.body.ID;
    });

    it("should allow user to buy item", async () => {
      const res = await request(app)
        .post(`/items/${itemId}/buy`)
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item purchased successfully");
      expect(res.body.item.OwnerID).toBe(buyerId);
      expect(res.body.buyerBalance).toBe(700);
      expect(res.body.sellerBalance).toBe(sellerBalanceBefore + 300);

      const sellerInDb = await prisma.users.findUnique({
        where: { ID: adminId },
      });

      expect(sellerInDb?.Balance).toBe(sellerBalanceBefore + 300);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).post(`/items/${itemId}/buy`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("should return 404 if item does not exist", async () => {
      const res = await request(app)
        .post("/items/999999/buy")
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Item not found");
    });

    it("should return 400 if user tries to buy own item", async () => {
      const adminLoginRes = await request(app).post("/auth/login").send({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      const res = await request(app)
        .post(`/items/${itemId}/buy`)
        .set("Authorization", `Bearer ${adminLoginRes.body.token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("You cannot buy your own item");
    });

    it("should return 400 if balance is insufficient", async () => {
      await prisma.users.update({
        where: { ID: buyerId },
        data: { Balance: 100 },
      });

      const res = await request(app)
        .post(`/items/${itemId}/buy`)
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Insufficient balance");
    });
  });
});