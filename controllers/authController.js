import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import User from "../models/userSchema.js"; // 👈 import your User model

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token with Google API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    const userInfo = await response.json();

    if (userInfo.error_description) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // 🔎 Check if user exists in DB
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      // If not, create new user
      user = await User.create({
        fullName: userInfo.name,
        email: userInfo.email,
        password: "", // Google users won’t need this
        isAdmin: false, // default unless you manually set in DB
        picture: userInfo.picture,
      });
    }

    // Create JWT for your app
    const myToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Respond with full user object INCLUDING isAdmin
    res.json({
      message: "Google login successful",
      token: myToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin, // 👈 critical
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Error in googleAuth:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
