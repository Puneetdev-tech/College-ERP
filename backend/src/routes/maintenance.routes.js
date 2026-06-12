import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import {
  getMaintenanceData,
  createCategory,
  deleteCategory,
  createUnit,
  deleteUnit,
  updateUnitDetails,
  updateUnitStatus,
  createLog,
  updateLog,
  deleteLog
} from "../controllers/maintenance.controller.js";

const router = Router();

// Retrieve all maintenance data (units, categories, logs)
router.get("/", verifyToken, getMaintenanceData);

// Category routes
router.post("/categories", verifyToken, checkPermission("Maintenance"), createCategory);
router.delete("/categories/:id", verifyToken, checkPermission("Maintenance"), deleteCategory);

// Unit routes
router.post("/units", verifyToken, checkPermission("Maintenance"), createUnit);
router.delete("/units/:id", verifyToken, checkPermission("Maintenance"), deleteUnit);
router.put("/units/:id", verifyToken, checkPermission("Maintenance"), updateUnitDetails);
router.put("/units/:id/status", verifyToken, checkPermission("Maintenance"), updateUnitStatus);

// History log routes
router.post("/units/:unitId/logs", verifyToken, checkPermission("Maintenance"), createLog);
router.put("/units/:unitId/logs/:logId", verifyToken, checkPermission("Maintenance"), updateLog);
router.delete("/units/:unitId/logs/:logId", verifyToken, checkPermission("Maintenance"), deleteLog);

export default router;
