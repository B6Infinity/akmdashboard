import { Router } from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
} from "../controllers/reportController.js";

const router = Router();

router.post("/", createReport);          // POST   /api/reports
router.get("/", getAllReports);           // GET    /api/reports
router.get("/:id", getReportById);       // GET    /api/reports/:id
router.patch("/:id/status", updateReportStatus); // PATCH  /api/reports/:id/status

export default router;
