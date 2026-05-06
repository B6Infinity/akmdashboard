import { Router } from "express";
import mapRoutes from "./mapRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = Router();

router.use("/map", mapRoutes);
router.use("/reports", reportRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ success: true, status: "OK", timestamp: new Date().toISOString() });
});

export default router;
