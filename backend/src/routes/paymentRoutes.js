import express from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import protect from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// Verificar se a chave do Stripe está disponível
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "dummy_key_for_development";
let stripe;

try {
  stripe = new Stripe(stripeSecretKey);
  console.log("Stripe inicializado com sucesso");
} catch (error) {
  console.warn(
    "AVISO: Stripe não foi inicializado corretamente. Funcionalidades de pagamento estarão indisponíveis."
  );
  console.warn(
    "Defina STRIPE_SECRET_KEY no arquivo .env para habilitar pagamentos."
  );

  // Criar um mock do objeto Stripe para evitar erros
  stripe = {
    checkout: {
      sessions: { create: async () => ({ id: "mock_session", url: "#" }) },
    },
    webhooks: {
      constructEvent: () => ({ type: "mock_event", data: { object: {} } }),
    },
    products: {
      list: async () => ({ data: [] }),
      create: async () => ({ id: "mock_product" }),
    },
    prices: {
      list: async () => ({ data: [] }),
      create: async () => ({ id: "mock_price" }),
    },
    billingPortal: {
      sessions: { create: async () => ({ url: "#" }) },
    },
    subscriptions: {
      retrieve: async () => ({
        current_period_end: Date.now() / 1000 + 30 * 24 * 60 * 60,
        status: "active",
      }),
    },
  };
}

/**
 * Criar uma sessão de checkout para assinatura
 * POST /api/payments/create-checkout-session
 */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { planId, tenantId, successUrl, cancelUrl } = req.body;

    // Verificar se o plano existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(400).json({ message: "Plano não encontrado" });
    }

    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        contactEmail: true,
      },
    });

    if (!tenant) {
      return res.status(400).json({ message: "Tenant não encontrado" });
    }

    // Criar um produto no Stripe para o plano (se não existir)
    let stripeProductId = await getOrCreateStripeProduct(plan.name);

    // Criar ou recuperar um preço no Stripe
    const stripePriceId = await getOrCreateStripePrice(
      stripeProductId,
      plan.price,
      plan.billingCycle
    );

    // Criar a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: tenantId,
      customer_email: tenant.contactEmail,
      metadata: {
        tenantId,
        planId,
        planName: plan.name,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    res.status(500).json({ message: "Erro ao criar sessão de checkout" });
  }
});

/**
 * Webhook para eventos do Stripe
 * POST /api/payments/webhook
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Lidar com o evento
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  }
);

/**
 * Obter o status da assinatura do tenant atual
 * GET /api/payments/subscription-status
 */
router.get(
  "/subscription-status",
  protect,
  authorizeRoles("TENANT_ADMIN", "SUPER_ADMIN"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;

      if (!tenantId) {
        return res.status(400).json({ message: "Tenant não identificado" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          subscriptionStatus: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
          subscriptionPlan: {
            select: {
              name: true,
              price: true,
              billingCycle: true,
            },
          },
        },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant não encontrado" });
      }

      res.json({
        status: tenant.subscriptionStatus,
        plan: tenant.subscriptionPlan,
        trialEndsAt: tenant.trialEndsAt,
        subscriptionEndsAt: tenant.subscriptionEndsAt,
      });
    } catch (error) {
      console.error("Erro ao verificar status da assinatura:", error);
      res
        .status(500)
        .json({ message: "Erro ao verificar status da assinatura" });
    }
  }
);

/**
 * Criar portal de gerenciamento de assinatura do cliente
 * POST /api/payments/create-customer-portal
 */
router.post(
  "/create-customer-portal",
  protect,
  authorizeRoles("TENANT_ADMIN", "SUPER_ADMIN"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { returnUrl } = req.body;

      if (!tenantId) {
        return res.status(400).json({ message: "Tenant não identificado" });
      }

      // Buscar o tenant
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant não encontrado" });
      }

      // Verificar se o tenant tem um customerId do Stripe
      let customerId = tenant.stripeCustomerId;

      if (!customerId) {
        return res.status(400).json({
          message:
            "Este tenant ainda não possui uma assinatura ativa no Stripe",
        });
      }

      // Criar a sessão do portal
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Erro ao criar portal do cliente:", error);
      res.status(500).json({ message: "Erro ao criar portal do cliente" });
    }
  }
);

// Função para obter ou criar um produto no Stripe
async function getOrCreateStripeProduct(planName) {
  // Buscar produto existente
  const products = await stripe.products.list({
    limit: 100,
  });

  const existingProduct = products.data.find((p) => p.name === planName);

  if (existingProduct) {
    return existingProduct.id;
  }

  // Criar novo produto
  const product = await stripe.products.create({
    name: planName,
    description: `Plano de assinatura ${planName} para o SaaS de Estética Automotiva`,
  });

  return product.id;
}

// Função para obter ou criar um preço no Stripe
async function getOrCreateStripePrice(productId, amount, billingCycle) {
  // Converter para centavos (Stripe trabalha com a menor unidade monetária)
  const unitAmount = Math.round(amount * 100);

  // Definir intervalo de cobrança
  const interval = billingCycle === "yearly" ? "year" : "month";

  // Buscar preço existente
  const prices = await stripe.prices.list({
    product: productId,
    limit: 100,
  });

  const existingPrice = prices.data.find(
    (p) => p.unit_amount === unitAmount && p.recurring?.interval === interval
  );

  if (existingPrice) {
    return existingPrice.id;
  }

  // Criar novo preço
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: "brl",
    recurring: {
      interval: interval,
    },
  });

  return price.id;
}

// Manipulador para checkout.session.completed
async function handleCheckoutSessionCompleted(session) {
  try {
    const { tenantId, planId } = session.metadata;

    if (!tenantId || !planId) {
      console.error("Metadados incompletos na sessão de checkout");
      return;
    }

    // Atualizar o tenant com o ID do cliente do Stripe e status da assinatura
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeCustomerId: session.customer,
        subscriptionStatus: "ACTIVE",
        trialEndsAt: null,
      },
    });

    // Registrar o pagamento
    await prisma.subscriptionPayment.create({
      data: {
        tenantId,
        planId,
        amount: session.amount_total / 100, // Converter de centavos para a moeda
        status: "completed",
        paymentMethod: "credit_card", // Assumindo cartão de crédito
        transactionId: session.payment_intent,
      },
    });

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: "subscription_created",
        description: `Assinatura criada via Stripe. ID da sessão: ${session.id}`,
      },
    });
  } catch (error) {
    console.error("Erro ao processar checkout.session.completed:", error);
  }
}

// Manipulador para invoice.paid
async function handleInvoicePaid(invoice) {
  try {
    // Obter o cliente e a assinatura
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    );
    const customerId = invoice.customer;

    // Buscar o tenant pelo ID do cliente do Stripe
    const tenant = await prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      console.error(
        `Tenant não encontrado para o cliente Stripe: ${customerId}`
      );
      return;
    }

    // Calcular a próxima data de cobrança
    const nextBillingDate = new Date(subscription.current_period_end * 1000);

    // Registrar o pagamento
    await prisma.subscriptionPayment.create({
      data: {
        tenantId: tenant.id,
        planId: tenant.planId,
        amount: invoice.amount_paid / 100, // Converter de centavos para a moeda
        status: "completed",
        paymentMethod: "credit_card", // Assumindo cartão de crédito
        transactionId: invoice.payment_intent,
        nextBillingDate,
      },
    });

    // Atualizar o status da assinatura se necessário
    if (tenant.subscriptionStatus !== "ACTIVE") {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndsAt: nextBillingDate,
        },
      });
    } else {
      // Apenas atualizar a data de fim da assinatura
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionEndsAt: nextBillingDate,
        },
      });
    }

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: "invoice_paid",
        description: `Fatura paga via Stripe. ID da fatura: ${invoice.id}`,
      },
    });
  } catch (error) {
    console.error("Erro ao processar invoice.paid:", error);
  }
}

// Manipulador para invoice.payment_failed
async function handleInvoicePaymentFailed(invoice) {
  try {
    const customerId = invoice.customer;

    // Buscar o tenant pelo ID do cliente do Stripe
    const tenant = await prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      console.error(
        `Tenant não encontrado para o cliente Stripe: ${customerId}`
      );
      return;
    }

    // Atualizar o status da assinatura
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: "PAST_DUE",
      },
    });

    // Registrar o pagamento falho
    await prisma.subscriptionPayment.create({
      data: {
        tenantId: tenant.id,
        planId: tenant.planId,
        amount: invoice.amount_due / 100, // Converter de centavos para a moeda
        status: "failed",
        paymentMethod: "credit_card", // Assumindo cartão de crédito
        transactionId: invoice.payment_intent,
      },
    });

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: "invoice_payment_failed",
        description: `Falha no pagamento da fatura via Stripe. ID da fatura: ${invoice.id}`,
      },
    });
  } catch (error) {
    console.error("Erro ao processar invoice.payment_failed:", error);
  }
}

// Manipulador para customer.subscription.updated
async function handleSubscriptionUpdated(subscription) {
  try {
    const customerId = subscription.customer;

    // Buscar o tenant pelo ID do cliente do Stripe
    const tenant = await prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      console.error(
        `Tenant não encontrado para o cliente Stripe: ${customerId}`
      );
      return;
    }

    // Definir o status com base no status do Stripe
    let status;
    switch (subscription.status) {
      case "active":
        status = "ACTIVE";
        break;
      case "past_due":
        status = "PAST_DUE";
        break;
      case "canceled":
        status = "CANCELED";
        break;
      case "unpaid":
        status = "PAST_DUE";
        break;
      default:
        status = tenant.subscriptionStatus; // Manter o status atual
    }

    // Atualizar o tenant
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: status,
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      },
    });

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: "subscription_updated",
        description: `Assinatura atualizada via Stripe. Novo status: ${status}`,
      },
    });
  } catch (error) {
    console.error("Erro ao processar customer.subscription.updated:", error);
  }
}

// Manipulador para customer.subscription.deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    const customerId = subscription.customer;

    // Buscar o tenant pelo ID do cliente do Stripe
    const tenant = await prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      console.error(
        `Tenant não encontrado para o cliente Stripe: ${customerId}`
      );
      return;
    }

    // Atualizar o tenant
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: "CANCELED",
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      },
    });

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: "subscription_canceled",
        description: `Assinatura cancelada via Stripe.`,
      },
    });
  } catch (error) {
    console.error("Erro ao processar customer.subscription.deleted:", error);
  }
}

export default router;
