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

// ⚡ Export a function that accepts io for real-time events
const userRoutes = (io) => {
    const router = Router(); // 👈 moved inside

    // ✅ Register
    router.post("/register", register);

    // ✅ Login
    router.post("/login", login);

    // ✅ Get total user count (admin)
    router.get("/count", getUserCount);

    // ✅ Upload profile picture
    router.post(
        "/upload-profile",
        authenticateUser,
        upload.single("profilePicture"),
        (req, res) => {
            try {
                return uploadProfilePicture(req, res, io);
            } catch (err) {
                console.error("Route error:", err);
                res.status(500).json({ message: "Server error in route" });
            }
        }
    );

    // ✅ Search users
    router.get("/search", searchUsers);

    return router;
};

export default userRoutes;
