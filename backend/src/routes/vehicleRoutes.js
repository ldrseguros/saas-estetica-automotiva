import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getAllVehiclesAdmin,
  createVehicleAdmin,
  getVehicleByIdAdmin,
  updateVehicleAdmin,
  deleteVehicleAdmin,
  getMyVehicles,
  createMyVehicle,
  getMyVehicleById,
  updateMyVehicle,
  deleteMyVehicle,
  getVehiclesByClientIdAdmin,
} from "../controllers/vehicleController.js";

const router = express.Router();

// Middleware para logar requisições que chegam a este router
router.use((req, res, next) => {
  console.log(
    `[Vehicle Router] Recebida requisição: ${req.method} ${req.originalUrl}`
  );
  next();
});

// Admin routes for managing all vehicles
router
  .route("/admin")
  .all(protect, authorizeRoles("ADMIN")) // Apply to all methods on this path
  .get(getAllVehiclesAdmin)
  .post(createVehicleAdmin)
  .put(updateVehicleAdmin)
  .delete(deleteVehicleAdmin);

// Admin route to fetch vehicles by client ID
router
  .route("/admin/clients/:clientId/vehicles")
  .all(protect, authorizeRoles("ADMIN"))
  .get(getVehiclesByClientIdAdmin);

// Client routes for managing their own vehicles
router
  .route("/client")
  .all(protect, authorizeRoles("CLIENT")) // Apply to all methods on this path
  .get(getMyVehicles)
  .post(createMyVehicle);

router
  .route("/client/:id")
  .all(protect, authorizeRoles("CLIENT")) // Apply to all methods on this path
  .get(getMyVehicleById)
  .put(updateMyVehicle)
  .delete(deleteMyVehicle);

export default router;
