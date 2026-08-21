/**
 * tests/inventory.test.js
 * Inventory: getInventory, adjustStock (201, 404, role guard)
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { app, request, prisma, loginAsAdmin, loginAs } from "./helpers.js";

let adminToken = "";
let testItemId = null;

describe("Inventory API", () => {
  before(async () => {
    try {
      adminToken = await loginAsAdmin();
    } catch (e) {
      console.warn("⚠ Could not get admin token:", e.message);
    }

    // Find the first available inventory item for adjustment tests
    const item = await prisma.inventoryItem.findFirst({ orderBy: { id: "asc" } });
    if (item) testItemId = item.id;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  // ── GET /api/inventory ────────────────────────────────────────────────────

  it("GET /api/inventory — returns 401 without token", async () => {
    const res = await request(app).get("/api/inventory");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("GET /api/inventory — returns 200 with items array when authenticated", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get("/api/inventory")
      .set("Authorization", `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.items));
  });

  // ── GET /api/inventory/legacy ─────────────────────────────────────────────

  it("GET /api/inventory/legacy — read-only legacy endpoint returns 200", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get("/api/inventory/legacy")
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // ── POST /api/inventory/adjust ────────────────────────────────────────────

  it("POST /api/inventory/adjust — returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/inventory/adjust")
      .send({ itemId: 1, newQuantity: 10, reason: "Test", adjustedBy: "Test" });
    assert.equal(res.status, 401);
  });

  it("POST /api/inventory/adjust — returns 403 for non-admin/store-manager role", async () => {
    const purchaseToken = await loginAs("Purchase Officer");
    if (!purchaseToken) {
      console.warn("  Skipping: no Purchase Officer user found.");
      return;
    }
    const res = await request(app)
      .post("/api/inventory/adjust")
      .set("Authorization", `Bearer ${purchaseToken}`)
      .send({ itemId: 1, newQuantity: 10, reason: "Test", adjustedBy: "Tester" });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  it("POST /api/inventory/adjust — returns 404 for non-existent itemId", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post("/api/inventory/adjust")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ itemId: 9999999, newQuantity: 5, reason: "Test adjustment", adjustedBy: "Admin" });
    assert.equal(res.status, 404, `expected 404, got ${res.status}: ${res.body.message}`);
    assert.equal(res.body.success, false);
  });

  it("POST /api/inventory/adjust — returns 201 + adjustment record on valid payload", async () => {
    if (!adminToken || !testItemId) return;

    const item = await prisma.inventoryItem.findUnique({ where: { id: testItemId } });
    if (!item) return;

    const newQty = item.stock + 1; // increment by 1 as test

    const res = await request(app)
      .post("/api/inventory/adjust")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        itemId: testItemId,
        newQuantity: newQty,
        reason: "[AUTO TEST] Adjustment test — please ignore",
        adjustedBy: "AutoTest"
      });

    assert.equal(res.status, 201, `expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.success, true);
    assert.ok(res.body.item, "item should be returned");
    assert.ok(res.body.adjustment, "adjustment record should be returned");
    assert.equal(res.body.item.stock, newQty, "stock should match new quantity");

    // Restore original stock
    await prisma.inventoryItem.update({
      where: { id: testItemId },
      data: { stock: item.stock }
    });

    // Clean up test StockAdjustment record
    if (res.body.adjustment?.id) {
      await prisma.stockAdjustment.delete({ where: { id: res.body.adjustment.id } }).catch(() => {});
    }
  });

  it("POST /api/inventory/adjust — returns 400 on missing required fields", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post("/api/inventory/adjust")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ itemId: testItemId }); // missing newQuantity, reason, adjustedBy
    assert.ok([400, 422].includes(res.status), `expected 400/422, got ${res.status}`);
    assert.equal(res.body.success, false);
  });
});
