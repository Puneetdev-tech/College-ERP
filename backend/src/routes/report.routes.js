import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import {
  getInventoryReport,
  getIssuesReport,
  getOrdersReport,
  getSummary
} from "../controllers/report.controller.js";

const router = Router();

router.get("/inventory", verifyToken, checkPermission("Reports"), getInventoryReport);
router.get("/issues", verifyToken, checkPermission("Reports"), getIssuesReport);
router.get("/orders", verifyToken, checkPermission("Reports"), getOrdersReport);
router.get("/summary", verifyToken, getSummary);

export default router;
