import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

/**
 * Obter todos os planos de assinatura ativos
 * GET /api/public/plans
 */
router.get("/plans", async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        billingCycle: true,
        features: true,
        maxEmployees: true,
        maxClients: true,
      },
    });

    res.json(plans);
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    res.status(500).json({ message: "Erro ao buscar planos de assinatura" });
  }
});

/**
 * Obter detalhes de um plano específico
 * GET /api/public/plans/:id
 */
router.get("/plans/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        billingCycle: true,
        features: true,
        maxEmployees: true,
        maxClients: true,
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes do plano" });
  }
});

/**
 * Verificar disponibilidade de subdomínio
 * GET /api/public/check-subdomain/:subdomain
 */
router.get("/check-subdomain/:subdomain", async (req, res) => {
  try {
    const { subdomain } = req.params;

    // Verificar se o subdomínio é válido
    const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        available: false,
        message: "Subdomínio inválido. Use apenas letras, números e hífens.",
      });
    }

    // Verificar se o subdomínio já está em uso
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: { id: true },
    });

    res.json({
      subdomain,
      available: !existingTenant,
      message: existingTenant
        ? "Subdomínio já está em uso"
        : "Subdomínio disponível",
    });
  } catch (error) {
    console.error("Erro ao verificar subdomínio:", error);
    res
      .status(500)
      .json({ message: "Erro ao verificar disponibilidade do subdomínio" });
  }
});

/**
 * Cadastrar contato de interesse (lead)
 * POST /api/public/contact
 */
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message, planId } = req.body;

    // Aqui você poderia salvar em um modelo Lead no banco ou enviar por email
    // Para este exemplo, apenas retornamos sucesso

    res.status(201).json({
      success: true,
      message: "Contato recebido com sucesso! Entraremos em contato em breve.",
    });
  } catch (error) {
    console.error("Erro ao cadastrar contato:", error);
    res.status(500).json({ message: "Erro ao processar seu contato" });
  }
});

/**
 * Rota para verificar status/saúde da API
 * GET /api/public/health
 */
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
