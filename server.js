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

// CORS (general + preflight)
const FRONTEND_ORIGIN = "https://stately-melba-e779a0.netlify.app";
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.options("*", cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// Test route
app.get("/", (req, res) => res.send("Makaan API is live ✅"));

// Connect DB and start server
connectDB().then(() => {
  console.log("Database connected successfully");

  const server = http.createServer(app);

  // Socket.IO
  const io = new Server(server, {
    cors: { origin: FRONTEND_ORIGIN, methods: ["GET", "POST"], credentials: true },
  });

  // Pass io to routes that need it
  app.use("/api/users", userRoutes(io));

  // Other routes
  app.use("/api/carts", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/products", productRoutes);
  app.use("/auth", authRoutes);

  // Socket handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const { userId } = socket.handshake.query;
    if (userId) socket.join(userId);

    socket.on("profilePictureUpdated", (data) => {
      io.to(data.userId).emit(`updateProfilePicture-${data.userId}`, data.imageUrl);
    });

    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  });

  // Start server
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
