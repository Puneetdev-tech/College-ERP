import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createIssueSchema } from "../validators/issue.validator.js";
import { getIssues, createIssue } from "../controllers/issue.controller.js";

const router = Router();

router.get("/", verifyToken, getIssues);
router.post("/", verifyToken, checkPermission("Issue Stock"), validate(createIssueSchema), createIssue);

export default router;
