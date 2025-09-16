import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// Import routes (uncomment once tested step by step)
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// Middleware
// ---------------------------

// Parse JSON bodies
app.use(express.json());

// CORS setup
const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,          // allow any localhost port (dev)
    /^https:\/\/makaan-frontend\.vercel\.app$/, // deployed Vercel frontend
];

app.use(
    cors({
        origin: function (origin, callback) {
            console.log("🔍 Incoming origin:", origin);

            if (!origin) {
                console.log("✅ Allowed: server-to-server or Postman");
                return callback(null, true);
            }

            const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));
            if (isAllowed) {
                console.log("✅ Allowed by CORS:", origin);
                return callback(null, true);
            }

            console.error("❌ Blocked by CORS:", origin);
            return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
        },
        credentials: true,
    })
);


// ---------------------------
// Routes
// ---------------------------
app.get("/", (req, res) => res.send("Makaan API is live ✅"));

// Step by step uncomment these once stable
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes); // will re-enable after Socket.IO

// ---------------------------
// Connect DB and Start Server
// ---------------------------
connectDB()
    .then(() => {
        console.log("✅ Database connected successfully");

        const server = http.createServer(app);

        // ---------------------------
        // Socket.IO setup
        // ---------------------------
        const io = new Server(server, {
            cors: {
                origin: function (origin, callback) {
                    if (!origin) return callback(null, true);

                    const isAllowed = allowedOrigins.some((pattern) =>
                        pattern.test(origin)
                    );
                    if (isAllowed) return callback(null, true);

                    return callback(
                        new Error(`Socket.IO CORS: Origin ${origin} not allowed`)
                    );
                },
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        // Attach io so routes can use it
        app.set("io", io);

        // Socket.IO events
        io.on("connection", (socket) => {
            console.log("🟢 User connected:", socket.id);

            const { userId } = socket.handshake.query;
            if (userId) socket.join(userId);

            socket.on("profilePictureUpdated", (data) => {
                io.to(data.userId).emit(
                    `updateProfilePicture-${data.userId}`,
                    data.imageUrl
                );
            });

            socket.on("disconnect", () =>
                console.log("🔴 User disconnected:", socket.id)
            );
        });

        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to database:", err.message);
        process.exit(1);
    });
