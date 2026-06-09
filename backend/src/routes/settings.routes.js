import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = Router();

router.get("/", verifyToken, getSettings);
router.put("/", verifyToken, checkPermission("Settings"), updateSettings);

export default router;
