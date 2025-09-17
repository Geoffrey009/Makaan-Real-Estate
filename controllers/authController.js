import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import User from "../models/userSchema.js";

export const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "Access token is required" });
    }

    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userInfo = await response.json();

    if (userInfo.error) {
      return res.status(400).json({ message: "Invalid Google access token" });
    }

    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      user = await User.create({
        fullName: userInfo.name,
        email: userInfo.email,
        password: "", // Google users don’t need a password
        isAdmin: false,
        picture: userInfo.picture,
      });
    } else {
      // Always keep profile picture up to date
      user.picture = userInfo.picture;
      await user.save();
    }

    // Emit update to other devices if Socket.IO is active
    if (req.app.get("io")) {
      req.app.get("io").to(user._id.toString()).emit(
        `updateProfilePicture-${user._id}`,
        user.picture
      );
    }

    const myToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token: myToken,
      user: {
        _id: user._id,  // ✅ use _id for consistency
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.picture,
      },
    });
  } catch (error) {
    console.error("Error in googleAuth:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
