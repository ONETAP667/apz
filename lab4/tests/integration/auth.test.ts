import request from "supertest";
import { createApp } from "../../src/presentation/http/app";
import { prisma } from "../../src/infrastructure/prisma/prisma";

const app = createApp();

const TEST_USER_EMAILS = ["test@example.com", "secure@example.com"];

describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.users.deleteMany({
      where: {
        email: {
          in: TEST_USER_EMAILS,
        },
      },
    });
  });

  afterEach(async () => {
    await prisma.users.deleteMany({
      where: {
        email: {
          in: TEST_USER_EMAILS,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "123456",
        username: "testuser",
      });
//!!
  console.log("created user:", res);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user).not.toHaveProperty("password_hash");

      const userInDb = await prisma.users.findUnique({
        where: { email: "test@example.com" },
      });

      expect(userInDb).not.toBeNull();
    });

    it("should return 409 if user already exists", async () => {
      await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "123456",
        username: "testuser",
      });

      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "abcdef",
        username: "anotheruser",
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("User already exists");
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).post("/auth/register").send({
        password: "123456",
        username: "testuser",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email, password and username are required");
    });

    it("should return 400 if password is missing", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        username: "testuser",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email, password and username are required");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "123456",
        username: "testuser",
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "123456",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "wrong-password",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 401 for non-existing user", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "nouser@example.com",
        password: "123456",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).post("/auth/login").send({
        password: "123456",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password are required");
    });
  });

  describe("Protected routes", () => {
    let token: string;

    beforeEach(async () => {
      const registerRes = await request(app).post("/auth/register").send({
        email: "secure@example.com",
        password: "123456",
        username: "secureuser",
      });

      token = registerRes.body.token;
    });

    it("should allow access with valid token", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should deny access without token", async () => {
      const res = await request(app).get("/users");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("should deny access with invalid token", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid token");
    });
  });
});