import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import User from "../models/userSchema.js"; // 👈 import your User model

export const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body; // ✅ now we expect access_token

    if (!access_token) {
      return res.status(400).json({ message: "Access token is required" });
    }

    // ✅ Use access token to fetch user info from Google
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userInfo = await response.json();

    if (userInfo.error) {
      return res.status(400).json({ message: "Invalid Google access token" });
    }

    // 🔎 Check if user exists in DB
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      // If not, create new user
      user = await User.create({
        fullName: userInfo.name,
        email: userInfo.email,
        password: "", // Google users don’t need this
        isAdmin: false, // default unless you set manually in DB
        picture: userInfo.picture,
      });
    } else {
      // Optional: keep Google picture always fresh
      user.picture = userInfo.picture;
      await user.save();
    }

    // ✅ Create JWT for your app
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
        profilePicture: user.picture,
      },
    });
  } catch (error) {
    console.error("Error in googleAuth:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
