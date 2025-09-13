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

// ---------------------------
// Middleware
// ---------------------------

// Parse JSON
app.use(json());

// ⚡ CORS setup: allow multiple origins (dev + production)
const allowedOrigins = [
  "http://localhost:5173", // React dev server
  "https://stately-melba-e779a0.netlify.app", // deployed Netlify frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true, // allow cookies
  })
);
app.options("*", cors()); // preflight for all routes

// ---------------------------
// Test route
// ---------------------------
app.get("/", (req, res) => res.send("Makaan API is live ✅"));

// ---------------------------
// Connect to DB and start server
// ---------------------------
connectDB()
  .then(() => {
    console.log("Database connected successfully");

    const server = http.createServer(app);

    // ---------------------------
    // Socket.IO setup
    // ---------------------------
    const io = new Server(server, {
      cors: {
        origin: function (origin, callback) {
          if (!origin) return callback(null, true); // Postman or no-origin requests
          if (allowedOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`Socket.IO CORS: Origin ${origin} not allowed`));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Make io accessible to routes
    app.set("io", io);

    // ---------------------------
    // Routes
    // ---------------------------
    app.use("/api/users", userRoutes(io));
    app.use("/api/carts", cartRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/products", productRoutes);
    app.use("/auth", authRoutes);

    // ---------------------------
    // Socket.IO events
    // ---------------------------
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      const { userId } = socket.handshake.query;
      if (userId) socket.join(userId);

      socket.on("profilePictureUpdated", (data) => {
        io.to(data.userId).emit(
          `updateProfilePicture-${data.userId}`,
          data.imageUrl
        );
      });

      socket.on("disconnect", () => console.log("User disconnected:", socket.id));
    });

    // ---------------------------
    // Start server
    // ---------------------------
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });
