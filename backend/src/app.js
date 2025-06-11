import express from "express";
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
import settingsRoutes from "./routes/settingsRoutes.js"; // Importar as rotas de configurações

// Novas rotas para o SaaS
import subscriptionRoutes from "./routes/subscriptionRoutes.js"; // Rotas para gerenciar assinaturas
import tenantRoutes from "./routes/tenantRoutes.js"; // Rotas para gerenciar tenants
import publicRoutes from "./routes/publicRoutes.js"; // Rotas públicas da landing page
import paymentRoutes from "./routes/paymentRoutes.js"; // Rotas para processamento de pagamentos

import { tenantMiddleware } from "./middlewares/tenantMiddleware.js"; // Middleware para identificar tenant

import transactionRoutes from "./routes/finance/transactions.js";
import categoryRoutes from "./routes/finance/categories.js";
import methodRoutes from "./routes/finance/methods.js";

const app = express();
const port = process.env.PORT || 3000;

// Para resolver o __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json()); // Middleware para parsear JSON no corpo da requisição
app.use(express.urlencoded({ extended: true })); // Middleware para parsear URL-encoded bodies

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
app.use("/api/admin/settings", settingsRoutes);

// Rotas de superadmin (gerenciamento do SaaS)
app.use("/api/superadmin/tenants", tenantRoutes); // Gerenciamento de tenants
app.use("/api/superadmin/subscriptions", subscriptionRoutes); // Gerenciamento de planos e assinaturas

app.use("/api/finance/transactions", transactionRoutes);
app.use("/api/finance/categories", categoryRoutes);
app.use("/api/finance/methods", methodRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
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
