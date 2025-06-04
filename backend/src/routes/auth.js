import express from "express";
const router = express.Router();

import { login, registerClient } from "../controllers/authController.js";

router.post("/login", login);
router.post("/register", registerClient);

export default router;
