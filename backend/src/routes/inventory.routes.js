import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createInventoryItemSchema, updateInventoryItemSchema } from "../validators/inventory.validator.js";
import {
  getInventory,
  getLegacyInventory,
  getLegacySanitary,
  getLegacyElectrical,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  importCSV
} from "../controllers/inventory.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verifyToken, getInventory);
router.get("/legacy", verifyToken, getLegacyInventory);
router.get("/legacy-sanitary", verifyToken, getLegacySanitary);
router.get("/legacy-electrical", verifyToken, getLegacyElectrical);
router.post("/", verifyToken, checkPermission("Inventory"), validate(createInventoryItemSchema), createInventoryItem);
router.put("/:id", verifyToken, checkPermission("Inventory"), validate(updateInventoryItemSchema), updateInventoryItem);
router.delete("/:id", verifyToken, checkPermission("Inventory"), deleteInventoryItem);

// CSV upload route
router.post("/import-csv", verifyToken, checkPermission("Inventory"), upload.single("file"), importCSV);

export default router;
