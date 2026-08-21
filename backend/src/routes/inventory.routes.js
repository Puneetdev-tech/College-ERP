import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission, requireRole } from "../middleware/permission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  adjustStockSchema
} from "../validators/inventory.validator.js";
import {
  getInventory,
  getLegacyInventory,
  getLegacySanitary,
  getLegacyElectrical,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  importCSV,
  adjustStock
} from "../controllers/inventory.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Active Inventory (InventoryItem) ────────────────────────────────────────
router.get("/",   verifyToken, getInventory);
router.post("/",  verifyToken, checkPermission("Inventory"), validate(createInventoryItemSchema), createInventoryItem);
router.put("/:id",    verifyToken, checkPermission("Inventory"), validate(updateInventoryItemSchema), updateInventoryItem);
router.delete("/:id", verifyToken, checkPermission("Inventory"), deleteInventoryItem);

// ─── Stock Adjustment — Admin & Store Manager only ───────────────────────────
router.post(
  "/adjust",
  verifyToken,
  requireRole("Admin", "Store Manager"),
  validate(adjustStockSchema),
  adjustStock
);

// ─── Read-only Legacy Registers ───────────────────────────────────────────────
router.get("/legacy",            verifyToken, getLegacyInventory);
router.get("/legacy-sanitary",   verifyToken, getLegacySanitary);
router.get("/legacy-electrical", verifyToken, getLegacyElectrical);

// ─── CSV Import ───────────────────────────────────────────────────────────────
router.post("/import-csv", verifyToken, checkPermission("Inventory"), upload.single("file"), importCSV);

export default router;
