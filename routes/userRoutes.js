import { Router } from "express";
import { register, login, getUserCount } from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/count", getUserCount);

export default router;
