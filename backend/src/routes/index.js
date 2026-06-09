import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import orderRoutes from "./order.routes.js";
import issueRoutes from "./issue.routes.js";
import notificationRoutes from "./notification.routes.js";
import settingsRoutes from "./settings.routes.js";
import reportRoutes from "./report.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", orderRoutes);
router.use("/issues", issueRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportRoutes);

export default router;
