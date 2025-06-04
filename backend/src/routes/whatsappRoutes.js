import express from "express";
import {
  getTemplates,
  getTemplateById,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  createReport,
  getReportByBookingId,
  sendMessage,
  uploadPhoto,
  testWhatsAppConnection,
  sendTestMessage,
} from "../controllers/whatsappController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rotas protegidas - apenas para admin
// Templates de mensagens
router
  .route("/templates")
  .get(protect, admin, getTemplates)
  .post(protect, admin, createMessageTemplate);

router
  .route("/templates/:id")
  .get(protect, admin, getTemplateById)
  .put(protect, admin, updateMessageTemplate)
  .delete(protect, admin, deleteMessageTemplate);

// Relatórios de serviço
router.route("/reports").post(protect, admin, createReport);

router.route("/reports/:bookingId").get(protect, admin, getReportByBookingId);

// Envio de mensagens
router.route("/send").post(protect, admin, sendMessage);

// Upload de fotos
router.route("/upload").post(protect, admin, uploadPhoto);

// Teste de conexão WhatsApp
router.route("/test").get(protect, admin, testWhatsAppConnection);

// Envio de mensagem de teste
router.route("/test-send").post(protect, admin, sendTestMessage);

export default router;
