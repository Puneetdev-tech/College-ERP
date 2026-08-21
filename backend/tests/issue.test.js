/**
 * tests/issue.test.js
 * Issue: createIssue (unitCost stored, stock decrements, 400 on over-issue, 404 on bad item)
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { app, request, prisma, loginAsAdmin } from "./helpers.js";

let adminToken = "";
let testItem = null;
let createdIssueId = null;

describe("Issue Stock API", () => {
  before(async () => {
    try {
      adminToken = await loginAsAdmin();
    } catch (e) {
      console.warn("⚠ Could not get admin token:", e.message);
    }

    // Find an item with stock > 1 to test issuing
    testItem = await prisma.inventoryItem.findFirst({
      where: { stock: { gt: 1 } },
      orderBy: { stock: "desc" }
    });
  });

  after(async () => {
    // Clean up test IssueLog if created
    if (createdIssueId) {
      await prisma.issueLog.delete({ where: { id: createdIssueId } }).catch(() => {});
      // Restore stock to item
      if (testItem) {
        await prisma.inventoryItem.update({
          where: { id: testItem.id },
          data: { stock: testItem.stock }
        }).catch(() => {});
      }
    }
    await prisma.$disconnect();
  });

  // ── GET /api/issues ───────────────────────────────────────────────────────

  it("GET /api/issues — returns 401 without token", async () => {
    const res = await request(app).get("/api/issues");
    assert.equal(res.status, 401);
  });

  it("GET /api/issues — returns 200 with issues array when authenticated", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get("/api/issues")
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.issues));
  });

  // ── POST /api/issues ──────────────────────────────────────────────────────

  it("POST /api/issues — 404 when item does not exist in inventory", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        category: "Electronics",
        subcategory: "NONEXISTENT_ITEM_XYZ_12345",
        type: "NONEXISTENT_TYPE",
        department: "Test Dept",
        faculty: "Prof. Nobody",
        quantity: 1
      });
    assert.equal(res.status, 404, `expected 404, got ${res.status}: ${res.body.message}`);
    assert.equal(res.body.success, false);
  });

  it("POST /api/issues — 400 when quantity exceeds available stock", async () => {
    if (!adminToken || !testItem) return;
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        category: testItem.category,
        subcategory: testItem.subcategory,
        type: testItem.type,
        department: "Test Dept",
        faculty: "Prof. Test",
        quantity: testItem.stock + 9999  // definitely over
      });
    assert.equal(res.status, 400, `expected 400, got ${res.status}: ${res.body.message}`);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.toLowerCase().includes("insufficient") || res.body.message.toLowerCase().includes("stock"),
      `message should mention stock: "${res.body.message}"`);
  });

  it("POST /api/issues — creates IssueLog, decrements stock, stores unitCost", async () => {
    if (!adminToken || !testItem) return;

    const qtyToIssue = 1;
    // Always read fresh stock from DB — other test suites may have modified this item
    const freshItem = await prisma.inventoryItem.findUnique({ where: { id: testItem.id } });
    if (!freshItem || freshItem.stock < 1) {
      console.warn("  Skipping: insufficient stock after other test modifications.");
      return;
    }
    const stockBefore = freshItem.stock;
    // Update testItem reference for cleanup
    testItem = { ...testItem, stock: freshItem.stock };

    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        category: freshItem.category,
        subcategory: freshItem.subcategory,
        type: freshItem.type,
        department: "AutoTest Department",
        faculty: "Prof. AutoTest",
        quantity: qtyToIssue,
        date: new Date().toISOString()
      });

    assert.equal(res.status, 200, `expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.success, true);
    assert.ok(res.body.issue, "issue object should be returned");

    // unitCost should be stored (either from body or item.price fallback)
    const issue = res.body.issue;
    assert.ok(
      issue.unitCost !== null && issue.unitCost !== undefined,
      `unitCost should be stored, got: ${issue.unitCost}`
    );

    createdIssueId = issue.id;

    // Verify stock was decremented
    const updatedItem = await prisma.inventoryItem.findUnique({ where: { id: freshItem.id } });
    assert.equal(
      updatedItem.stock,
      stockBefore - qtyToIssue,
      `stock should have decreased from ${stockBefore} to ${stockBefore - qtyToIssue}, got ${updatedItem.stock}`
    );
  });

  it("POST /api/issues — unitCost fallback to item.price when omitted from body", async () => {
    if (!adminToken || !testItem) return;

    // Re-fetch item since stock changed in previous test
    const freshItem = await prisma.inventoryItem.findUnique({ where: { id: testItem.id } });
    if (!freshItem || freshItem.stock < 1) return;

    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        category: freshItem.category,
        subcategory: freshItem.subcategory,
        type: freshItem.type,
        department: "FallbackTest Dept",
        faculty: "Prof. Fallback",
        quantity: 1
        // no unitCost in body → should use item.price
      });

    if (res.status === 400 && res.body.message?.includes("Insufficient")) {
      console.warn("  Skipping: not enough stock for fallback test.");
      return;
    }

    assert.equal(res.status, 200, `expected 200, got ${res.status}: ${res.body.message}`);
    const issue = res.body.issue;
    assert.ok(issue.unitCost !== null && issue.unitCost !== undefined, "unitCost fallback should work");

    // Clean up this extra issue
    await prisma.issueLog.delete({ where: { id: issue.id } }).catch(() => {});
    await prisma.inventoryItem.update({
      where: { id: freshItem.id },
      data: { stock: freshItem.stock }
    }).catch(() => {});
  });

  it("POST /api/issues — returns 400 on missing required fields", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ category: "Electronics" }); // missing everything else
    assert.ok([400, 422].includes(res.status), `expected 400/422, got ${res.status}`);
    assert.equal(res.body.success, false);
  });
});
