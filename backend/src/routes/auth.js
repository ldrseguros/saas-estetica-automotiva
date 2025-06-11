import express from "express";
const router = express.Router();

import { login, registerClient } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import prisma from "../lib/prisma.js";

router.post("/login", login);
router.post("/register", registerClient);

// Endpoint temporário para debug - verificar dados do usuário
router.get("/me", protect, async (req, res) => {
  try {
    const account = await prisma.authAccount.findUnique({
      where: { id: req.user.id },
      include: {
        employee: true,
        client: true,
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({
      id: account.id,
      email: account.email,
      role: account.role,
      tenantId: account.tenantId,
      tenant: account.tenant,
      employee: account.employee,
      client: account.client,
      debug: {
        userFromToken: req.user,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;
