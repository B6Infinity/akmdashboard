import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import apiRoutes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

// Initialize services
connectDB();
configureCloudinary();

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" })); // 50mb to allow base64 images
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
  console.log(`[Server] API available at http://localhost:${PORT}/api`);
});