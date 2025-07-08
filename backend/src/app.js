import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import Stripe from "stripe"
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js"; // Importar as rotas protegidas
import userRoutes from "./routes/userRoutes.js"; // Importar as novas rotas de usuário
import bookingRoutes from "./routes/bookingRoutes.js"; // Importar as rotas de agendamento (admin e client)
import serviceRoutes from "./routes/serviceRoutes.js"; // Importar as novas rotas de serviço
import vehicleRoutes from "./routes/vehicleRoutes.js"; // Importar as rotas de veículo (admin e client)
import dashboardRoutes from "./routes/dashboardRoutes.js"; // Importar as rotas do dashboard
import whatsappRoutes from "./routes/whatsappRoutes.js"; // Importar as rotas de WhatsApp
import emailRoutes from "./routes/emailRoutes.js";
import financialRoutes from "./routes/financialRoutes.js"; // Importar as rotas de email
import settingsRoutes from "./routes/settingsRoutes.js"; // Importar as rotas de configurações
import adminSubscriptionRoutes from "./routes/adminSubscriptionRoutes.js"; // Importar as rotas de planos para admin

// Novas rotas para o SaaS
import subscriptionRoutes from "./routes/subscriptionRoutes.js"; // Rotas para gerenciar assinaturas
import tenantRoutes from "./routes/tenantRoutes.js"; // Rotas para gerenciar tenants
import publicRoutes from "./routes/publicRoutes.js"; // Rotas públicas da landing page
import paymentRoutes from "./routes/paymentRoutes.js"; // Rotas para processamento de pagamentos

import { tenantMiddleware } from "./middlewares/tenantMiddleware.js"; // Middleware para identificar tenant

import transactionRoutes from "./routes/finance/transactions.js";
import categoryRoutes from "./routes/finance/categories.js";
import methodRoutes from "./routes/finance/methods.js";

import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3000;

// Para resolver o __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Prisma e Stripe
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Mantenha esta versão ou atualize para a mais recente se já testou
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Configurar CORS para permitir origens específicas
const allowedOrigins = [
    "http://localhost:8080", // Frontend local
    "http://localhost:3000", // Testes locais
    "https://saas-estetica-automotiva.vercel.app", // URL do Vercel em produção
    "https://saas-estetica-automotiva.onrender.com", // URL do backend (para testes)
    process.env.FRONTEND_URL, // URL adicional configurável
].filter(Boolean); // Remove valores undefined

app.use(
    cors({
        origin: function (origin, callback) {
            // Permite requisições sem origin (mobile apps, Postman, etc.) em desenvolvimento
            if (!origin && process.env.NODE_ENV === "development") {
                return callback(null, true);
            }
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error("Bloqueado pelo CORS"));
            }
        },
        credentials: true,
    })
);


app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    console.log('--- Webhook recebido ---');

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        console.log(`Webhook verificado com sucesso para o evento: ${event.type}`);
    } catch (err) {
        console.error(`Erro na verificação do Webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Tipo de evento detectado: ${event.type}`);

    switch (event.type) {
        case 'checkout.session.completed':
            console.log('Entrou no bloco checkout.session.completed');
            const session = event.data.object;
            console.log(`ID da sessão: ${session.id}`);

            try {
                const subscriptionId = session.subscription;
                const customerId = session.customer;
                const tenantIdFromMetadata = session.metadata.tenantId;

                console.log(`Subscription ID: ${subscriptionId}`);
                console.log(`Customer ID: ${customerId}`);
                console.log(`Tenant ID from Metadata: ${tenantIdFromMetadata}`);

                if (!tenantIdFromMetadata) {
                    console.error('tenantId não encontrado nos metadados da sessão do checkout.');
                    return res.status(400).send('Tenant ID not found in metadata.');
                }

                // Tenta encontrar o tenant existente pelo ID dos metadados
                const tenant = await prisma.tenant.findUnique({
                    where: { id: tenantIdFromMetadata },
                });

                if (tenant) {
                    console.log(`Tenant ${tenant.id} encontrado. Atualizando...`);

                    let priceId = null;
                    let subscriptionEndsAtValue = null; // Para armazenar o timestamp do Stripe

                    // Se a sessão tem um ID de assinatura, recupere os detalhes completos da assinatura do Stripe
                    if (subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
                        priceId = subscription.items.data[0]?.price?.id; 
                        subscriptionEndsAtValue = subscription.current_period_end;

                        console.log(`[checkout.session.completed] Subscription retrieved. Price ID: ${priceId}, Current Period End: ${subscriptionEndsAtValue}`);
                    } else if (session.line_items && session.line_items.data.length > 0) {
                        priceId = session.line_items.data[0]?.price?.id;
                        console.warn(`[checkout.session.completed] Subscription ID not directly on session. Price ID from line_items: ${priceId}. current_period_end will be null.`);
                    }

                    if (!priceId) {
                        console.error('Price ID não encontrado na sessão de checkout ou assinatura.');
                        return res.status(400).send('Price ID missing.');
                    }

                    const ourPlan = await prisma.subscriptionPlan.findFirst({
                        where: { stripePriceId: priceId }
                    });

                    if (ourPlan) {
                        let subscriptionEndsAtDate = null;
                        console.log(`[checkout.session.completed] Valor de subscriptionEndsAtValue antes de criar a data: ${subscriptionEndsAtValue}`);

                        if (subscriptionEndsAtValue && typeof subscriptionEndsAtValue === 'number') {
                            subscriptionEndsAtDate = new Date(subscriptionEndsAtValue * 1000);
                            if (isNaN(subscriptionEndsAtDate.getTime())) { // Verifica se é uma data inválida
                                console.error(`[checkout.session.completed] Data calculada para subscriptionEndsAt é inválida: ${subscriptionEndsAtValue}. Será null.`);
                                subscriptionEndsAtDate = null;
                            } else{
                              console.log(`[checkout.session.completed] Data de subscriptionEndsAt calculada com sucesso: ${subscriptionEndsAtDate.toISOString()}`);
                            }
                        } else {
                            console.warn(`[checkout.session.completed] subscriptionEndsAtValue inválido/ausente: ${subscriptionEndsAtValue}. subscriptionEndsAt será null.`);
                        }

                        await prisma.tenant.update({
                            where: { id: tenant.id },
                            data: {
                                stripeSubscriptionId: subscriptionId,
                                stripeCustomerId: customerId,
                                subscriptionStatus: 'ACTIVE', // Ou defina um status inicial como PENDING/TRIAL
                                planId: ourPlan.id,
                                subscriptionEndsAt: subscriptionEndsAtDate, // Usando a data tratada
                                trialEndsAt: null, // Trial finalizado (se aplicável)
                            },
                        });
                        console.log(`Tenant ${tenant.id} atualizado com sucesso para ACTIVE com assinatura ${subscriptionId}!`);
                    } else {
                        console.warn(`Plano Stripe com priceId ${priceId} não encontrado no seu banco de dados. Tenant ${tenant.id} não atualizado com plano.`);
                    }

                } else {
                    console.warn(`Tenant com ID ${tenantIdFromMetadata} não encontrado no banco de dados. Este pode ser um erro se o tenant já deveria existir.`);
                
                    return res.status(404).send('Tenant não encontrado para configuração inicial.');
                }

            } catch (dbError) {
                console.error(`Erro interno ao processar checkout.session.completed:`, dbError);
                return res.status(500).send('Erro interno do servidor ao processar webhook');
            }
            break;

        case 'customer.subscription.created':
            console.log('Entrou no bloco customer.subscription.created');
            const createdSubscription = event.data.object;
            console.log(`Evento customer.subscription.created recebido: ${createdSubscription.id}`);
            console.log(`Stripe Customer ID para created event: ${createdSubscription.customer}`);

            try {
                // Tenta encontrar o tenant pelo stripeSubscriptionId OU stripeCustomerId
                let tenantToUpdate = await prisma.tenant.findFirst({
                    where: { stripeSubscriptionId: createdSubscription.id }
                });

                if (!tenantToUpdate) {
                    tenantToUpdate = await prisma.tenant.findFirst({
                        where: { stripeCustomerId: createdSubscription.customer }
                    });
                }

                console.log(`Tenant encontrado para customer.subscription.created: ${tenantToUpdate ? tenantToUpdate.id : 'NÃO ENCONTRADO'}`);

                if (tenantToUpdate) {
                    let newPlanId = tenantToUpdate.planId;
                    const newPriceId = createdSubscription.items.data[0]?.price?.id; 

                    if (newPriceId) {
                        const newOurPlan = await prisma.subscriptionPlan.findFirst({
                            where: { stripePriceId: newPriceId }
                        });
                        if (newOurPlan) {
                            newPlanId = newOurPlan.id;
                        } else {
                            console.warn(`Novo plano Stripe com PriceId ${newPriceId} não encontrado no seu banco de dados.`);
                        }
                    } else {
                        console.warn(`PriceId não encontrado em createdSubscription.items.data[0].price.`);
                    }

                    let subscriptionEndsAtDate = null;
                    if (createdSubscription.current_period_end && typeof createdSubscription.current_period_end === 'number') {
                        subscriptionEndsAtDate = new Date(createdSubscription.current_period_end * 1000);
                        if (isNaN(subscriptionEndsAtDate.getTime())) {
                            console.error(`[customer.subscription.created] Data calculada para subscriptionEndsAt é inválida: ${createdSubscription.current_period_end}. Será null.`);
                            subscriptionEndsAtDate = null;
                        }
                    } else {
                        console.warn(`[customer.subscription.created] createdSubscription.current_period_end inválido/ausente: ${createdSubscription.current_period_end}. subscriptionEndsAt será null.`);
                    }

                    // ATUALIZA O TENANT COM OS DADOS MAIS COMPLETOS DA ASSINATURA CRIADA
                    await prisma.tenant.update({
                        where: { id: tenantToUpdate.id },
                        data: {
                            stripeSubscriptionId: createdSubscription.id, // Garante que o ID da assinatura Stripe está correto
                            stripeCustomerId: createdSubscription.customer, // Garante que o ID do cliente Stripe está correto
                            subscriptionStatus: createdSubscription.status.toUpperCase(),
                            planId: newPlanId,
                            subscriptionEndsAt: subscriptionEndsAtDate, // AGORA SIM, ESSA DEVE SER A DATA CORRETA
                            trialEndsAt: null // Trial finalizado
                        },
                    });
                    console.log(`Assinatura ${createdSubscription.id} criada e tenant ${tenantToUpdate.id} ATUALIZADO com detalhes completos.`);
                } else {
                    console.warn(`Tenant com stripeCustomerId ${createdSubscription.customer} ou stripeSubscriptionId ${createdSubscription.id} não encontrado no banco de dados para customer.subscription.created.`);
                }
            } catch (error) {
                console.error("Erro ao processar customer.subscription.created:", error);
            }
            break;

        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            console.log("Evento customer.subscription.updated recebido:", updatedSubscription.id);

            try {
                const tenantToUpdate = await prisma.tenant.findFirst({
                    where: { stripeSubscriptionId: updatedSubscription.id }
                });

                if (tenantToUpdate) {
                    let newPlanId = tenantToUpdate.planId;

                    if (updatedSubscription.items && updatedSubscription.items.data.length > 0) {
                        const newPriceId = updatedSubscription.items.data[0]?.price?.id;
                        if (newPriceId) {
                            const newOurPlan = await prisma.subscriptionPlan.findFirst({
                                where: { stripePriceId: newPriceId }
                            });
                            if (newOurPlan) {
                                newPlanId = newOurPlan.id;
                            } else {
                                console.warn(`Novo plano Stripe com PriceId ${newPriceId} não encontrado no seu banco de dados.`);
                            }
                        } else {
                            console.warn(`PriceId não encontrado em updatedSubscription.items.data[0].price.`);
                        }
                    }

                    let subscriptionEndsAtDate = null;
                    if (updatedSubscription.current_period_end && typeof updatedSubscription.current_period_end === 'number') {
                        subscriptionEndsAtDate = new Date(updatedSubscription.current_period_end * 1000);
                        if (isNaN(subscriptionEndsAtDate.getTime())) {
                            console.error(`[customer.subscription.updated] Data calculada para subscriptionEndsAt é inválida: ${updatedSubscription.current_period_end}. Será null.`);
                            subscriptionEndsAtDate = null;
                        }
                    } else {
                        console.warn(`[customer.subscription.updated] updatedSubscription.current_period_end inválido/ausente: ${updatedSubscription.current_period_end}. subscriptionEndsAt será null.`);
                    }

                    await prisma.tenant.update({
                        where: { stripeSubscriptionId: updatedSubscription.id },
                        data: {
                            subscriptionStatus: updatedSubscription.status.toUpperCase(),
                            planId: newPlanId, // Atualiza o plano interno
                            subscriptionEndsAt: subscriptionEndsAtDate,
                        },
                    });
                    console.log(`Assinatura ${updatedSubscription.id} atualizada para status ${updatedSubscription.status}`);
                } else {
                    console.warn(`Tenant com stripeSubscriptionId ${updatedSubscription.id} não encontrado no banco de dados para customer.subscription.updated.`);
                }
            } catch (error) {
                console.error("Erro ao processar customer.subscription.updated:", error);
                return res.status(500).send("Erro no servidor ao processar webhook");
            }
            break;

        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            console.log("Evento customer.subscription.deleted recebido:", deletedSubscription.id);

            try {
                let subscriptionEndsAtDate = null;
                if (deletedSubscription.current_period_end && typeof deletedSubscription.current_period_end === 'number') {
                    subscriptionEndsAtDate = new Date(deletedSubscription.current_period_end * 1000);
                    if (isNaN(subscriptionEndsAtDate.getTime())) {
                        console.error(`[customer.subscription.deleted] Data calculada para subscriptionEndsAt é inválida: ${deletedSubscription.current_period_end}. Será null.`);
                        subscriptionEndsAtDate = null;
                    }
                } else {
                    console.warn(`[customer.subscription.deleted] deletedSubscription.current_period_end inválido/ausente: ${deletedSubscription.current_period_end}. subscriptionEndsAt será null.`);
                }

                await prisma.tenant.update({
                    where: { stripeSubscriptionId: deletedSubscription.id },
                    data: {
                        subscriptionStatus: 'CANCELED',
                        subscriptionEndsAt: subscriptionEndsAtDate,
                    },
                });
                console.log(`Assinatura ${deletedSubscription.id} cancelada com sucesso.`);
            } catch (error) {
                console.error("Erro ao processar customer.subscription.deleted:", error);
                return res.status(500).send("Erro no servidor ao processar webhook");
            }
            break;

        case 'invoice.payment_succeeded':
            const invoiceSucceeded = event.data.object;
            console.log("Evento invoice.payment_succeeded recebido:", invoiceSucceeded.id);

            if (invoiceSucceeded.subscription) {
                const subscriptionIdForInvoice = invoiceSucceeded.subscription;
                console.log(`Pagamento bem-sucedido para assinatura ${subscriptionIdForInvoice}`);

            }
            break;

        case 'invoice.payment_failed':
            const invoiceFailed = event.data.object;
            console.log("Evento invoice.payment_failed recebido:", invoiceFailed.id);

            if (invoiceFailed.subscription) {
                const subscriptionIdForFailedInvoice = invoiceFailed.subscription;
                console.log(`Pagamento falhou para assinatura ${subscriptionIdForFailedInvoice}`);
            }
            break;

        default:
            console.warn(`Evento de webhook NÃO tratado: ${event.type}`);
    }
    res.status(200).json({ received: true });
});


// Middlewares para parsear JSON no corpo da requisição (para todas as outras rotas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar pasta de uploads como estática
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rotas públicas (sem autenticação)
app.use("/api/public", publicRoutes); // Rotas da landing page, planos, etc.
app.use("/api/auth", authRoutes); // Usar as rotas de autenticação sob o prefixo /api/auth

// Middleware para identificar o tenant baseado no subdomain ou header
app.use(tenantMiddleware);

// Rotas para pagamentos
app.use("/api/payments", paymentRoutes);

// Rotas protegidas por tenant
app.use("/api/protected", protectedRoutes); // Usar as rotas protegidas sob o prefixo /api/protected
app.use("/api/bookings", bookingRoutes); // Montar rotas de booking (admin e client) sob /api/bookings
app.use("/api/services", serviceRoutes); // Updated: Now includes both public and admin routes
app.use("/api/vehicles", vehicleRoutes); // Montar rotas de veículo (admin e client) sob /api/vehicles

// Rotas protegidas por tenant e restritas a admin
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/whatsapp", whatsappRoutes);
app.use("/api/admin/email", emailRoutes);

// Import da nova rota de automação
import emailAutomationRoutes from "./routes/emailAutomationRoutes.js";
// import { eventNames } from 'process'; // Esta linha deve ser removida se ainda estiver causando problemas
// import { sub } from 'date-fns'; // Esta linha não é necessária aqui, a menos que você a use em outro lugar
app.use("/api/admin/email-automation", emailAutomationRoutes);
app.use("/api/admin/financial", financialRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/subscription-plans", adminSubscriptionRoutes);

// Rotas de superadmin (gerenciamento do SaaS)
app.use("/api/superadmin/tenants", tenantRoutes); // Gerenciamento de tenants
app.use("/api/superadmin/subscriptions", subscriptionRoutes); // Gerenciamento de planos e assinaturas

app.use("/api/finance/transactions", transactionRoutes);
app.use("/api/finance/categories", categoryRoutes);
app.use("/api/finance/methods", methodRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Health check para Render
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
    console.error("Erro global:", err);
    res.status(500).json({
        message: "Erro interno do servidor",
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

app.listen(port, () => {
    console.log(
        `Backend server listening on port ${port} - http://localhost:${port}`
    );
});