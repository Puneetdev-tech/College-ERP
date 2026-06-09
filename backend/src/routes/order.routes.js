import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema, receiveOrderSchema } from "../validators/order.validator.js";
import {
  getOrders,
  createOrder,
  approveOrder,
  rejectOrder,
  receiveOrder
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", verifyToken, getOrders);
router.post("/", verifyToken, checkPermission("Place Order"), validate(createOrderSchema), createOrder);
router.post("/:id/approve", verifyToken, approveOrder);
router.post("/:id/reject", verifyToken, rejectOrder);
router.post("/:id/receive", verifyToken, checkPermission("Receive Order"), validate(receiveOrderSchema), receiveOrder);

export default router;
