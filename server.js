import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";  // import your db connection

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Backend with MongoDB is running!");
});

// Port (Render provides PORT automatically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
