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

// Test route
app.get("/", (req, res) => {
  res.send("Makaan API is live ✅");
});

// Connect to DB and start server
connectDB().then(() => {
  console.log("Database connected successfully");

  // 1️⃣ Create HTTP server
  const server = http.createServer(app);

  // 2️⃣ Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "https://stately-melba-e779a0.netlify.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // 3️⃣ Pass io to user routes
  app.use("/api/users", userRoutes(io));

  // 4️⃣ Other routes (don't depend on io)
  app.use("/api/carts", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/products", productRoutes);
  app.use("/auth", authRoutes);

  // ⚡ Handle socket connections
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const { userId } = socket.handshake.query;
    if (userId) {
      socket.join(userId); // join room per user
      console.log(`Socket ${socket.id} joined room for user ${userId}`);
    }

    socket.on("profilePictureUpdated", (data) => {
      const { userId, imageUrl } = data;
      io.to(userId).emit(`updateProfilePicture-${userId}`, imageUrl);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // 5️⃣ Start server
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
