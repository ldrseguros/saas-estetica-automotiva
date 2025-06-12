#!/usr/bin/env node

import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

// Cores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

class APITester {
  constructor() {
    this.tokens = {};
    this.tenantData = {};
    this.testResults = [];
  }

  log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  success(message) {
    this.log(`✅ ${message}`, "green");
  }

  error(message) {
    this.log(`❌ ${message}`, "red");
  }

  info(message) {
    this.log(`ℹ️  ${message}`, "blue");
  }

  warning(message) {
    this.log(`⚠️  ${message}`, "yellow");
  }

  async test(name, testFunction) {
    try {
      this.info(`Testando: ${name}`);
      await testFunction();
      this.success(`${name} - PASSOU`);
      this.testResults.push({ name, status: "PASS" });
    } catch (error) {
      this.error(`${name} - FALHOU: ${error.message}`);
      this.testResults.push({ name, status: "FAIL", error: error.message });
    }
  }

  async makeRequest(method, endpoint, data = null, token = null, headers = {}) {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }

  async testHealthCheck() {
    const response = await this.makeRequest("GET", "/");
    if (!response || typeof response !== "string") {
      throw new Error("Health check falhou");
    }
  }

  async testPublicEndpoints() {
    // Testar listagem de planos
    const plans = await this.makeRequest(
      "GET",
      "/api/public/subscription-plans"
    );
    if (!Array.isArray(plans) || plans.length === 0) {
      throw new Error("Nenhum plano encontrado");
    }
    this.testData = { ...this.testData, plans };
  }

  async testSuperAdminAuth() {
    // Login como super admin
    const loginData = {
      email: "admin@saasestetica.com",
      password: "admin123",
    };

    const response = await this.makeRequest(
      "POST",
      "/api/auth/login",
      loginData
    );
    if (!response.token) {
      throw new Error("Token não retornado no login");
    }

    this.tokens.superAdmin = response.token;
    this.info("Super admin logado com sucesso");
  }

  async testTenantAuth() {
    // Login como admin do tenant
    const loginData = {
      email: "admin@autoshine.com",
      password: "admin123",
    };

    const response = await this.makeRequest(
      "POST",
      "/api/auth/login",
      loginData
    );
    if (!response.token) {
      throw new Error("Token não retornado no login do tenant");
    }

    this.tokens.tenantAdmin = response.token;
    this.tenantData = response.user;
    this.info("Admin do tenant logado com sucesso");
  }

  async testTenantRegistration() {
    // Buscar plano básico
    const plans = await this.makeRequest(
      "GET",
      "/api/public/subscription-plans"
    );
    const basicPlan = plans.find((p) => p.name === "Básico");

    if (!basicPlan) {
      throw new Error("Plano básico não encontrado");
    }

    const registrationData = {
      businessName: "Estética Teste API",
      ownerName: "Teste Automático",
      email: `teste.${Date.now()}@testeapi.com`,
      password: "senha123",
      phone: "(11) 99999-9999",
      planId: basicPlan.id,
    };

    const response = await this.makeRequest(
      "POST",
      "/api/public/register",
      registrationData
    );
    if (!response.tenant || !response.token) {
      throw new Error("Registro falhou");
    }

    this.tokens.newTenant = response.token;
    this.info("Novo tenant registrado com sucesso");
  }

  async testServicesCRUD() {
    const token = this.tokens.tenantAdmin;

    // Criar serviço
    const serviceData = {
      title: "Teste Serviço API",
      description: "Serviço criado via teste automático",
      price: 75.0,
      duration: 90,
    };

    const created = await this.makeRequest(
      "POST",
      "/api/services",
      serviceData,
      token
    );
    if (!created.id) {
      throw new Error("Falha ao criar serviço");
    }

    // Listar serviços
    const services = await this.makeRequest(
      "GET",
      "/api/services",
      null,
      token
    );
    if (!Array.isArray(services)) {
      throw new Error("Falha ao listar serviços");
    }

    // Atualizar serviço
    const updateData = { ...serviceData, price: 85.0 };
    const updated = await this.makeRequest(
      "PUT",
      `/api/services/${created.id}`,
      updateData,
      token
    );
    if (updated.price !== 85.0) {
      throw new Error("Falha ao atualizar serviço");
    }

    // Deletar serviço
    await this.makeRequest(
      "DELETE",
      `/api/services/${created.id}`,
      null,
      token
    );
    this.info("CRUD de serviços testado com sucesso");
  }

  async testClientVehicleFlow() {
    const token = this.tokens.tenantAdmin;

    // Criar cliente
    const clientData = {
      name: "Cliente Teste API",
      email: `cliente.${Date.now()}@teste.com`,
      password: "senha123",
      whatsapp: "(11) 98888-8888",
    };

    const client = await this.makeRequest(
      "POST",
      "/api/admin/users/clients",
      clientData,
      token
    );
    if (!client.id) {
      throw new Error("Falha ao criar cliente");
    }

    // Criar veículo para o cliente
    const vehicleData = {
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      plate: "ABC-1234",
      color: "Prata",
      clientId: client.id,
    };

    const vehicle = await this.makeRequest(
      "POST",
      "/api/vehicles",
      vehicleData,
      token
    );
    if (!vehicle.id) {
      throw new Error("Falha ao criar veículo");
    }

    this.info("Fluxo cliente-veículo testado com sucesso");
    return { client, vehicle };
  }

  async testBookingFlow() {
    const token = this.tokens.tenantAdmin;

    // Obter dados necessários
    const services = await this.makeRequest(
      "GET",
      "/api/services",
      null,
      token
    );
    const { client, vehicle } = await this.testClientVehicleFlow();

    if (services.length === 0) {
      throw new Error("Nenhum serviço disponível para agendamento");
    }

    // Criar agendamento
    const bookingData = {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Amanhã
      time: "10:00",
      clientId: client.id,
      vehicleId: vehicle.id,
      serviceIds: [services[0].id],
      location: "Atendimento na Loja",
    };

    const booking = await this.makeRequest(
      "POST",
      "/api/bookings",
      bookingData,
      token
    );
    if (!booking.id) {
      throw new Error("Falha ao criar agendamento");
    }

    this.info("Fluxo de agendamento testado com sucesso");
  }

  async testDashboard() {
    const token = this.tokens.tenantAdmin;

    const stats = await this.makeRequest(
      "GET",
      "/api/admin/dashboard/stats",
      null,
      token
    );
    if (typeof stats !== "object") {
      throw new Error("Falha ao obter estatísticas do dashboard");
    }

    this.info("Dashboard testado com sucesso");
  }

  async testWhatsAppTemplates() {
    const token = this.tokens.tenantAdmin;

    // Criar template
    const templateData = {
      name: "Teste Template",
      message: "Olá {cliente}, seu agendamento está confirmado!",
      type: "booking_confirmation",
    };

    const template = await this.makeRequest(
      "POST",
      "/api/admin/whatsapp/templates",
      templateData,
      token
    );
    if (!template.id) {
      throw new Error("Falha ao criar template WhatsApp");
    }

    this.info("Templates WhatsApp testados com sucesso");
  }

  async testFinanceEndpoints() {
    const token = this.tokens.tenantAdmin;

    // Testar categorias
    const categoryData = {
      name: "Teste Categoria",
      color: "#FF5733",
    };

    const category = await this.makeRequest(
      "POST",
      "/api/finance/categories",
      categoryData,
      token
    );
    if (!category.id) {
      throw new Error("Falha ao criar categoria");
    }

    // Testar métodos de pagamento
    const methodData = {
      name: "Teste Método",
    };

    const method = await this.makeRequest(
      "POST",
      "/api/finance/methods",
      methodData,
      token
    );
    if (!method.id) {
      throw new Error("Falha ao criar método de pagamento");
    }

    // Testar transações
    const transactionData = {
      type: "INCOME",
      description: "Teste Transação",
      value: 100.0,
      date: new Date().toISOString(),
      categoryId: category.id,
      methodId: method.id,
    };

    const transaction = await this.makeRequest(
      "POST",
      "/api/finance/transactions",
      transactionData,
      token
    );
    if (!transaction.id) {
      throw new Error("Falha ao criar transação");
    }

    this.info("Endpoints financeiros testados com sucesso");
  }

  async runAllTests() {
    this.log("\n🧪 Iniciando testes automáticos da API...\n", "blue");

    // Verificar se o servidor está rodando
    try {
      await axios.get(BASE_URL);
    } catch (error) {
      this.error("Servidor não está rodando em http://localhost:3000");
      this.info("Execute: npm run dev");
      return;
    }

    // Executar testes
    await this.test("Health Check", () => this.testHealthCheck());
    await this.test("Endpoints Públicos", () => this.testPublicEndpoints());
    await this.test("Autenticação Super Admin", () =>
      this.testSuperAdminAuth()
    );
    await this.test("Autenticação Tenant Admin", () => this.testTenantAuth());
    await this.test("Registro de Novo Tenant", () =>
      this.testTenantRegistration()
    );
    await this.test("CRUD de Serviços", () => this.testServicesCRUD());
    await this.test("Fluxo de Agendamento", () => this.testBookingFlow());
    await this.test("Dashboard", () => this.testDashboard());
    await this.test("Templates WhatsApp", () => this.testWhatsAppTemplates());
    await this.test("Endpoints Financeiros", () => this.testFinanceEndpoints());

    // Resumo dos resultados
    this.log("\n📊 Resumo dos Testes:\n", "blue");

    const passed = this.testResults.filter((t) => t.status === "PASS").length;
    const failed = this.testResults.filter((t) => t.status === "FAIL").length;

    this.log(`Total: ${this.testResults.length}`, "blue");
    this.log(`Passou: ${passed}`, "green");
    this.log(`Falhou: ${failed}`, "red");

    if (failed > 0) {
      this.log("\n❌ Testes que falharam:", "red");
      this.testResults
        .filter((t) => t.status === "FAIL")
        .forEach((t) => this.log(`  - ${t.name}: ${t.error}`, "red"));
    }

    if (failed === 0) {
      this.log(
        "\n🎉 Todos os testes passaram! API está funcionando corretamente.",
        "green"
      );
    } else {
      this.log(
        `\n⚠️  ${failed} teste(s) falharam. Verifique os erros acima.`,
        "yellow"
      );
    }
  }
}

// Executar testes
const tester = new APITester();
tester
  .runAllTests()
  .catch((error) => {
    console.error("Erro fatal nos testes:", error);
  })
  .finally(() => {
    prisma.$disconnect();
  });
