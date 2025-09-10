import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
        });

        // 🔑 Create JWT token immediately after successful signup
        const token = jwt.sign(
            { id: newUser._id, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Respond with both token and user
        return res.status(201).json({
            message: "User registered successfully",
            token, // <-- now included
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                profilePicture: newUser.profilePicture || "",
            },
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        !user && res.status(400).json({ message: "Invalid email or password" });

        const passwordMatch = await bcrypt.compare(password, user.password);
        !passwordMatch && res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isAdmin: user.isAdmin,
                profilePicture: user.profilePicture || "",
            },
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ totalUsers: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while counting users" });
    }
}

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path;

    // Update and return the updated user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true, select: "-password" } // return updated doc without password
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error while uploading image" });
  }
};

export { register, login, getUserCount, uploadProfilePicture };