import { Router } from "express";
import upload from "../middlewares/upload.js";
import {
  register,
  login,
  getUserCount,
  uploadProfilePicture,
  searchUsers,
} from "../controllers/userController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = Router();

// ⚡ Export a function that accepts io for real-time events
const userRoutes = (io) => {
  // ✅ Register
  router.post("/register", register);

  // ✅ Login
  router.post("/login", login);

  // ✅ Get total user count (admin)
  router.get("/count", getUserCount);

  // ✅ Upload profile picture
  router.post(
    "/upload-profile",
    authenticateUser,             // protect route
    upload.single("profilePicture"),
    (req, res) => uploadProfilePicture(req, res, io) // pass io to controller
  );

  // ✅ Search users
  router.get("/search", searchUsers);

  return router;
};

export default userRoutes;
