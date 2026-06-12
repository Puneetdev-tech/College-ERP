import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import {
  getCategories,
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, checkPermission("Inventory"), createCategory);
router.delete("/:id", verifyToken, checkPermission("Inventory"), deleteCategory);

router.post("/:categoryId/subcategories", verifyToken, checkPermission("Inventory"), createSubcategory);
router.delete("/:categoryId/subcategories/:name", verifyToken, checkPermission("Inventory"), deleteSubcategory);

export default router;
