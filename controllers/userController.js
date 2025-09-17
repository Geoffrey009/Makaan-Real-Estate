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
                _id: newUser._id,
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

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isAdmin: user.isAdmin,
                profilePicture: user.profilePicture || "", // this should now work
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ totalUsers: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while counting users" });
    }
}

const uploadProfilePicture = async (req, res, io) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Cloudinary storage: use url
        const imageUrl = req.file.path || req.file.secure_url || req.file.url;

        if (!imageUrl) {
            return res.status(500).json({ message: "Failed to get image URL from Cloudinary" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: imageUrl },
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (io) {
            io.to(req.user.id).emit(`updateProfilePicture-${req.user.id}`, imageUrl);
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

const searchUsers = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: "Name query is required." });
        }

        // Search by fullName, case-insensitive
        const users = await User.find({
            fullName: { $regex: new RegExp(`^${name}`, "i") }
        }).select("fullName profilePicture"); // only return fields you need

        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        // ^ Exclude password for security

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { register, login, getUserCount, uploadProfilePicture, searchUsers, getUserById };