import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  readAllNotifications,
  readNotification,
  createNotification,
  deleteNotification,
  clearNotifications
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", verifyToken, getNotifications);
router.put("/read-all", verifyToken, readAllNotifications);
router.put("/:id/read", verifyToken, readNotification);
router.post("/", verifyToken, createNotification);
router.delete("/:id", verifyToken, deleteNotification);
router.delete("/", verifyToken, clearNotifications);

export default router;
