import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserSchema, updateUserSchema, approvalSequenceSchema } from "../validators/user.validator.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getApprovalSequence,
  updateApprovalSequence
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", verifyToken, getAllUsers);
router.post("/", verifyToken, checkPermission("Users"), validate(createUserSchema), createUser);

router.get("/approval-sequence", verifyToken, getApprovalSequence);

// Users or Settings permission for approval sequence
router.put(
  "/approval-sequence",
  verifyToken,
  (req, res, next) => {
    if (
      req.user.role === "Admin" ||
      req.user.permissions.includes("Users") ||
      req.user.permissions.includes("Settings")
    ) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Access Denied: You do not have permission to manage the approval sequence!"
    });
  },
  validate(approvalSequenceSchema),
  updateApprovalSequence
);

router.put("/:id", verifyToken, validate(updateUserSchema), updateUser);
router.delete("/:id", verifyToken, checkPermission("Users"), deleteUser);

export default router;
