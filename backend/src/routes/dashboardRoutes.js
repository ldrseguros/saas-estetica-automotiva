import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

// Admin-only route for dashboard statistics
router
  .route("/stats")
  .all(protect, authorizeRoles("ADMIN"))
  .get(getDashboardStats);

export default router;
