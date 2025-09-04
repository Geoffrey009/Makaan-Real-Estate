import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { addToCart, getCart } from "../controllers/cartController.js";

const router = Router();

router.get("/get", authenticateUser, getCart);
router.post("/add", authenticateUser, addToCart);

export default router;