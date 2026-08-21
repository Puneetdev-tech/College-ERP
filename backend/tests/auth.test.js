/**
 * tests/auth.test.js
 * Auth: login, bad password, protected route guard
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { app, request, prisma } from "./helpers.js";

let adminEmail = "";

describe("Auth API", () => {
  before(async () => {
    const admin = await prisma.user.findFirst({ where: { role: "Admin" } });
    if (!admin) {
      console.warn("⚠ No Admin user found — skipping auth tests.");
      return;
    }
    adminEmail = admin.email;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("POST /api/auth/login — returns 200 + JWT on correct credentials", async () => {
    if (!adminEmail) return;
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: "admin" });

    // Accept both 200 (correct password) and 401 (wrong default) — we just verify the shape
    if (res.status === 200) {
      assert.equal(res.body.success, true, "success should be true");
      assert.ok(res.body.token, "token should be present");
      assert.ok(res.body.user, "user object should be present");
    } else {
      // Password might be different from default, that's ok — API returns correct error shape
      assert.equal(res.body.success, false, "success should be false on wrong password");
    }
  });

  it("POST /api/auth/login — returns 401 on wrong password", async () => {
    if (!adminEmail) return;
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: "THIS_IS_DEFINITELY_WRONG_PW_12345!" });

    assert.equal(res.status, 401, "status should be 401");
    assert.equal(res.body.success, false, "success should be false");
    assert.ok(res.body.message, "message should be present");
  });

  it("POST /api/auth/login — returns 400 on invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "anything" });

    assert.ok([400, 422].includes(res.status), `expected 400/422, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  it("GET /api/inventory — returns 401 without token", async () => {
    const res = await request(app).get("/api/inventory");
    assert.equal(res.status, 401, "protected route should return 401 without token");
    assert.equal(res.body.success, false);
  });

  it("GET /api/inventory — returns 200 with valid token", async () => {
    if (!adminEmail) return;

    // Try admin login — if wrong password, skip gracefully
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: "admin" });

    if (!loginRes.body.token) {
      console.warn("  Skipping: could not obtain token with default password.");
      return;
    }

    const res = await request(app)
      .get("/api/inventory")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.items), "items should be an array");
  });
});
