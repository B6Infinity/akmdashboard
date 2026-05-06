import { Router } from "express";
import { getBoundary, getRoads, getWards } from "../controllers/mapController.js";

const router = Router();

router.get("/boundary", getBoundary);
router.get("/roads", getRoads);
router.get("/wards", getWards);

export default router;
