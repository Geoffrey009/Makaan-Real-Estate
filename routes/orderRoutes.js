import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { getOrders, placeOrder } from "../controllers/orderController.js";

const router = Router();

router.post("/create", authenticateUser, placeOrder);
router.get("/get", authenticateUser, getOrders);

export default router;