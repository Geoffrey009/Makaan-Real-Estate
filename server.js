import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express, { json } from "express";
import http from "http"; // Needed for socket.io
import { Server } from "socket.io";

// Routes
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// ✅ General CORS for API routes
app.use(
  cors({
    origin: "https://stately-melba-e779a0.netlify.app",
    credentials: true,
  })
);

// ✅ Specific CORS for Google login route (POST from frontend)
app.options("/auth/google", cors()); // handle preflight OPTIONS
app.use("/auth/google", cors({
  origin: "https://stately-melba-e779a0.netlify.app",
  credentials: true,
}));

// Routes
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/auth", authRoutes); // other auth routes

// Test route
app.get("/", (req, res) => {
  res.send("Makaan API is live ✅");
});

// Connect to DB and start server
connectDB().then(() => {
  console.log("Database connected successfully");

  // Create HTTP server (needed for socket.io)
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "https://stately-melba-e779a0.netlify.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for profile picture updates
    socket.on("profilePictureUpdated", (data) => {
      const { userId, imageUrl } = data;

      // Broadcast to all other devices (except the one that sent it)
      socket.broadcast.emit(`updateProfilePicture-${userId}`, imageUrl);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Start server
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
