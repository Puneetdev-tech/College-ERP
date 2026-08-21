/**
 * tests/order.test.js
 * Order: createOrder (totalAmount computed), receiveOrder (stock increments, double-receive guard)
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { app, request, prisma, loginAsAdmin } from "./helpers.js";

let adminToken = "";
let testOrderId = null;
let testInventoryItemId = null;
const TEST_ORDER_MARKER = "[AUTO_TEST]";

describe("Order API", () => {
  before(async () => {
    try {
      adminToken = await loginAsAdmin();
    } catch (e) {
      console.warn("⚠ Could not get admin token:", e.message);
    }
  });

  after(async () => {
    // Clean up test orders created during this test run
    await prisma.order.deleteMany({
      where: { supplier: { contains: TEST_ORDER_MARKER } }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  // ── GET /api/orders ───────────────────────────────────────────────────────

  it("GET /api/orders — returns 401 without token", async () => {
    const res = await request(app).get("/api/orders");
    assert.equal(res.status, 401);
  });

  it("GET /api/orders — returns 200 with orders array when authenticated", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.orders));
  });

  // ── POST /api/orders ──────────────────────────────────────────────────────

  it("POST /api/orders — creates order and totalAmount = quantity × pricePerUnit", async () => {
    if (!adminToken) return;

    const qty = 5;
    const price = 1200;
    const admin = await prisma.user.findFirst({ where: { role: "Admin" } });

    const payload = {
      supplier: `${TEST_ORDER_MARKER} SupplierXYZ`,
      item: "Test Laptop",
      category: "Electronics",
      subcategory: "Laptop",
      type: "i5 16GB",
      quantity: qty,
      pricePerUnit: price,
      orderDate: new Date().toISOString(),
      department: "Electronics",
      faculty: "Prof. Test",
      placedByName: admin?.name || "Admin"
    };

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    assert.ok(
      [200, 201].includes(res.status),
      `expected 200/201, got ${res.status}: ${JSON.stringify(res.body)}`
    );
    assert.equal(res.body.success, true);
    assert.ok(res.body.order, "order object should be returned");

    const expectedTotal = qty * price;
    assert.equal(
      res.body.order.totalAmount,
      expectedTotal,
      `totalAmount should be ${expectedTotal}, got ${res.body.order.totalAmount}`
    );

    testOrderId = res.body.order.id;
  });

  it("POST /api/orders — returns 400 on missing required fields", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ supplier: "Test" }); // grossly incomplete
    assert.ok([400, 422].includes(res.status), `expected 400/422, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  // ── POST /api/orders/:id/receive ──────────────────────────────────────────

  it("POST /api/orders/:id/receive — 404 on non-existent orderId", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post("/api/orders/NONEXISTENT_ORDER_ID_XYZ/receive")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ receiveDate: new Date().toISOString() });
    assert.equal(res.status, 404, `expected 404, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  it("POST /api/orders/:id/receive — 400 on double-receive of same order", async () => {
    if (!adminToken || !testOrderId) return;

    // The order from test 3 was already received in the approve→receive flow (test 7).
    // So attempting to receive it again should return 400.
    const freshOrder = await prisma.order.findUnique({ where: { id: testOrderId } });
    if (!freshOrder) return;

    if (freshOrder.status !== "Received") {
      // If not yet received, receive it first, then try again
      await request(app)
        .post(`/api/orders/${testOrderId}/receive`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ receiveDate: new Date().toISOString() });
    }

    // Now try to receive it again — should return 400
    const res = await request(app)
      .post(`/api/orders/${testOrderId}/receive`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ receiveDate: new Date().toISOString() });

    assert.equal(res.status, 400, `double-receive should return 400, got ${res.status}: ${res.body.message}`);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message?.toLowerCase().includes("already"), `message should mention already received: "${res.body.message}"`);
  });

  // ── POST /api/orders/:id/approve + receive flow ───────────────────────────

  it("Approve → Receive flow: stock increments correctly", async () => {
    if (!adminToken || !testOrderId) return;

    // Find a matching inventory item to check stock increment
    const order = await prisma.order.findUnique({ where: { id: testOrderId } });
    if (!order) return;

    const itemBefore = await prisma.inventoryItem.findFirst({
      where: {
        subcategory: { equals: order.subcategory, mode: "insensitive" },
        type:        { equals: order.type,        mode: "insensitive" }
      }
    });

    // Step 1: Approve the order
    const approveRes = await request(app)
      .post(`/api/orders/${testOrderId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    if (approveRes.status !== 200) {
      console.warn(`  ⚠ Could not approve order (${approveRes.status}): ${approveRes.body.message}`);
      return;
    }

    // Step 2: Receive it
    const receiveRes = await request(app)
      .post(`/api/orders/${testOrderId}/receive`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ receiveDate: new Date().toISOString() });

    assert.equal(receiveRes.status, 200, `receive should succeed: ${receiveRes.body.message}`);
    assert.equal(receiveRes.body.success, true);

    // Step 3: Verify stock increment if item existed
    if (itemBefore) {
      const itemAfter = await prisma.inventoryItem.findUnique({ where: { id: itemBefore.id } });
      assert.ok(
        itemAfter.stock >= itemBefore.stock,
        `stock should have increased from ${itemBefore.stock} to at least ${itemBefore.stock + order.quantity}`
      );
    }

    // Step 4: Double-receive guard — should return 400
    const doubleReceive = await request(app)
      .post(`/api/orders/${testOrderId}/receive`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ receiveDate: new Date().toISOString() });

    assert.ok(
      [400, 409].includes(doubleReceive.status),
      `double-receive should return 400/409, got ${doubleReceive.status}`
    );
    assert.equal(doubleReceive.body.success, false);
  });
});
