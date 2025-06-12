#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function setupDevelopment() {
  console.log("🚀 Configurando ambiente de desenvolvimento...\n");

  try {
    // 1. Criar planos de assinatura
    console.log("📋 Criando planos de assinatura...");

    const plans = [
      {
        name: "Básico",
        description: "Plano ideal para começar",
        price: 29.9,
        billingCycle: "monthly",
        features: [
          "Até 1 funcionário",
          "Até 50 clientes",
          "Agendamentos ilimitados",
          "WhatsApp básico",
        ],
        maxEmployees: 1,
        maxClients: 50,
      },
      {
        name: "Profissional",
        description: "Para estéticas em crescimento",
        price: 49.9,
        billingCycle: "monthly",
        features: [
          "Até 3 funcionários",
          "Clientes ilimitados",
          "Agendamentos ilimitados",
          "WhatsApp automático",
          "Relatórios de serviço",
          "Gestão financeira",
        ],
        maxEmployees: 3,
        maxClients: null,
      },
      {
        name: "Premium",
        description: "Solução completa para grandes estéticas",
        price: 89.9,
        billingCycle: "monthly",
        features: [
          "Funcionários ilimitados",
          "Clientes ilimitados",
          "Agendamentos ilimitados",
          "WhatsApp automático avançado",
          "Relatórios de serviço",
          "Gestão financeira completa",
          "API personalizada",
          "Suporte prioritário",
        ],
        maxEmployees: 999,
        maxClients: null,
      },
    ];

    for (const planData of plans) {
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { name: planData.name },
      });

      if (!existingPlan) {
        await prisma.subscriptionPlan.create({
          data: planData,
        });
        console.log(`✅ Plano "${planData.name}" criado`);
      } else {
        console.log(`ℹ️  Plano "${planData.name}" já existe`);
      }
    }

    // 2. Criar super admin
    console.log("\n👤 Criando usuário Super Admin...");

    const superAdminEmail = "admin@saasestetica.com";
    const superAdminPassword = "admin123";

    const existingSuperAdmin = await prisma.authAccount.findUnique({
      where: { email: superAdminEmail },
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

      await prisma.authAccount.create({
        data: {
          email: superAdminEmail,
          password: hashedPassword,
          role: "SUPER_ADMIN",
        },
      });

      console.log(`✅ Super Admin criado:`);
      console.log(`   Email: ${superAdminEmail}`);
      console.log(`   Senha: ${superAdminPassword}`);
    } else {
      console.log(`ℹ️  Super Admin já existe: ${superAdminEmail}`);
    }

    // 3. Criar tenant de teste
    console.log("\n🏢 Criando estética de teste...");

    const basicPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: "Básico" },
    });

    const testTenantData = {
      name: "AutoShine Estética",
      subdomain: "autoshine",
      contactEmail: "contato@autoshine.com",
      contactPhone: "(11) 99999-9999",
      address: "Rua das Estéticas, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      planId: basicPlan.id,
      subscriptionStatus: "TRIAL",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
    };

    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain: "autoshine" },
    });

    let tenant;
    if (!existingTenant) {
      tenant = await prisma.tenant.create({
        data: testTenantData,
      });
      console.log(`✅ Estética de teste criada: ${tenant.name}`);
    } else {
      tenant = existingTenant;
      console.log(`ℹ️  Estética de teste já existe: ${tenant.name}`);
    }

    // 4. Criar admin do tenant de teste
    console.log("\n👨‍💼 Criando admin da estética de teste...");

    const tenantAdminEmail = "admin@autoshine.com";
    const tenantAdminPassword = "admin123";

    const existingTenantAdmin = await prisma.authAccount.findFirst({
      where: {
        email: tenantAdminEmail,
        tenantId: tenant.id,
      },
    });

    if (!existingTenantAdmin) {
      const hashedPassword = await bcrypt.hash(tenantAdminPassword, 10);

      const tenantAdmin = await prisma.authAccount.create({
        data: {
          email: tenantAdminEmail,
          password: hashedPassword,
          role: "TENANT_ADMIN",
          tenantId: tenant.id,
          employee: {
            create: {
              name: "João Silva",
              phone: "(11) 99999-9999",
              position: "Proprietário",
            },
          },
        },
      });

      console.log(`✅ Admin da estética criado:`);
      console.log(`   Email: ${tenantAdminEmail}`);
      console.log(`   Senha: ${tenantAdminPassword}`);
    } else {
      console.log(`ℹ️  Admin da estética já existe: ${tenantAdminEmail}`);
    }

    // 5. Criar serviços de exemplo
    console.log("\n🛠️ Criando serviços de exemplo...");

    const sampleServices = [
      {
        title: "Lavagem Completa",
        description: "Lavagem externa e interna completa",
        price: 50.0,
        duration: 60,
        tenantId: tenant.id,
      },
      {
        title: "Enceramento",
        description: "Enceramento e proteção da pintura",
        price: 80.0,
        duration: 90,
        tenantId: tenant.id,
      },
      {
        title: "Lavagem Simples",
        description: "Lavagem externa básica",
        price: 25.0,
        duration: 30,
        tenantId: tenant.id,
      },
    ];

    for (const serviceData of sampleServices) {
      const existingService = await prisma.service.findFirst({
        where: {
          title: serviceData.title,
          tenantId: serviceData.tenantId,
        },
      });

      if (!existingService) {
        await prisma.service.create({ data: serviceData });
        console.log(`✅ Serviço "${serviceData.title}" criado`);
      } else {
        console.log(`ℹ️  Serviço "${serviceData.title}" já existe`);
      }
    }

    console.log("\n🎉 Setup concluído com sucesso!\n");
    console.log("📋 Informações para teste:");
    console.log("┌─────────────────────────────────────────┐");
    console.log("│ SUPER ADMIN                             │");
    console.log("├─────────────────────────────────────────┤");
    console.log(`│ Email: admin@saasestetica.com           │`);
    console.log(`│ Senha: admin123                         │`);
    console.log("├─────────────────────────────────────────┤");
    console.log("│ ADMIN DA ESTÉTICA                       │");
    console.log("├─────────────────────────────────────────┤");
    console.log(`│ Email: admin@autoshine.com              │`);
    console.log(`│ Senha: admin123                         │`);
    console.log(`│ Estética: AutoShine Estética            │`);
    console.log(`│ Subdomínio: autoshine                   │`);
    console.log("└─────────────────────────────────────────┘\n");
  } catch (error) {
    console.error("❌ Erro durante o setup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar setup
setupDevelopment();
