import { Router } from "express";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import { getProducts, createProduct } from "../controllers/productController.js";

const router = Router();

router.post("/create", authenticateUser, authorizeAdmin, createProduct);
router.get("/get", authenticateUser, getProducts);

export default router;
