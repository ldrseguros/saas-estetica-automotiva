import express from "express";
import {
  testEmailConfiguration,
  sendTestEmail,
} from "../services/emailService.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);
router.use(admin);

/**
 * Testar configuração de email
 * GET /api/admin/email/test-config
 */
router.get("/test-config", async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.json(result);
  } catch (error) {
    console.error("Erro ao testar configuração de email:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

/**
 * Enviar email de teste
 * POST /api/admin/email/test-send
 */
router.post("/test-send", async (req, res) => {
  try {
    const { to, businessName } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Email de destino é obrigatório",
      });
    }

    const result = await sendTestEmail(to, businessName);

    res.json({
      success: true,
      message: "Email de teste enviado com sucesso",
      result,
    });
  } catch (error) {
    console.error("Erro ao enviar email de teste:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro ao enviar email de teste",
    });
  }
});

export default router;
