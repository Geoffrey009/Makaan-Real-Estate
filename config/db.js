import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    if (!MONGODB_URI) {
        console.error("❌ MongoDB connection string is missing! Check your .env file.");
        process.exit(1);
    }

    try {
        // Connect to MongoDB with recommended options
        await mongoose.connect(MONGODB_URI);

        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectDB;
