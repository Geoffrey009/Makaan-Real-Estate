import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express, { json } from "express";
import http from "http";
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

// ✅ Specific CORS for Google login route
app.options("/auth/google", cors());
app.use(
  "/auth/google",
  cors({
    origin: "https://stately-melba-e779a0.netlify.app",
    credentials: true,
  })
);

// Routes
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes); // will pass io in server.js later
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Makaan API is live ✅");
});

// Connect to DB and start server
connectDB().then(() => {
  console.log("Database connected successfully");

  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "https://stately-melba-e779a0.netlify.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ⚡ Handle socket connections and assign rooms
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Optional: join room if userId is sent in query from frontend
    const { userId } = socket.handshake.query;
    if (userId) {
      socket.join(userId); // join room per user
      console.log(`Socket ${socket.id} joined room for user ${userId}`);
    }

    // Listen for profile picture updates from a client
    socket.on("profilePictureUpdated", (data) => {
      const { userId, imageUrl } = data;

      // Emit only to the room for that user (all devices of that user)
      io.to(userId).emit(`updateProfilePicture-${userId}`, imageUrl);
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
