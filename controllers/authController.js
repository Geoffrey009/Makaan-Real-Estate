import jwt from "jsonwebtoken";
import fetch from "node-fetch";

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token using Google API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    const userInfo = await response.json();

    if (userInfo.error_description) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // At this point, you can check if the user exists in DB or create a new one
    // Example:
    const user = {
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    };

    // Create JWT for your app
    const myToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", user, token: myToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
