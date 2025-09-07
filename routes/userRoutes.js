import { Router } from "express";
import upload from "../middlewares/upload.js";
import { register, login, getUserCount, uploadProfilePicture } from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/count", getUserCount);
router.post("/upload-profile", upload.single("image"), uploadProfilePicture);

export default router;
