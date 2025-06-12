#!/usr/bin/env node

import dotenv from "dotenv";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

// Verificar se as chaves do Stripe estão configuradas
if (!process.env.STRIPE_SECRET_KEY) {
  console.log("❌ STRIPE_SECRET_KEY não configurada no .env");
  console.log("📋 Para testar o Stripe, você precisa:");
  console.log("1. Criar uma conta no Stripe (https://stripe.com)");
  console.log("2. Obter suas chaves de teste");
  console.log("3. Configurar no arquivo .env:");
  console.log("   STRIPE_SECRET_KEY=sk_test_...");
  console.log("   STRIPE_PUBLISHABLE_KEY=pk_test_...");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeIntegration() {
  console.log("🧪 Testando integração com Stripe...\n");

  try {
    // 1. Testar conexão com Stripe
    console.log("🔌 Testando conexão com Stripe...");
    const account = await stripe.account.retrieve();
    console.log(`✅ Conectado à conta Stripe: ${account.email || account.id}`);

    // 2. Listar produtos existentes
    console.log("\n📦 Listando produtos no Stripe...");
    const products = await stripe.products.list({ limit: 10 });
    console.log(`📦 Produtos encontrados: ${products.data.length}`);

    if (products.data.length > 0) {
      products.data.forEach((product) => {
        console.log(`  - ${product.name} (ID: ${product.id})`);
      });
    }

    // 3. Buscar planos no banco de dados
    console.log("\n📋 Buscando planos no banco de dados...");
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });
    console.log(`📋 Planos ativos encontrados: ${plans.length}`);

    // 4. Para cada plano, criar ou verificar produto e preço no Stripe
    for (const plan of plans) {
      console.log(`\n🏷️ Processando plano: ${plan.name}`);

      // Verificar se já existe um produto para este plano
      let stripeProduct = products.data.find((p) => p.name === plan.name);

      if (!stripeProduct) {
        console.log(`   📦 Criando produto no Stripe...`);
        stripeProduct = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            planId: plan.id,
            maxEmployees: plan.maxEmployees.toString(),
            maxClients: plan.maxClients?.toString() || "unlimited",
          },
        });
        console.log(`   ✅ Produto criado: ${stripeProduct.id}`);
      } else {
        console.log(`   ℹ️  Produto já existe: ${stripeProduct.id}`);
      }

      // Verificar preços para este produto
      const prices = await stripe.prices.list({
        product: stripeProduct.id,
        active: true,
      });

      const expectedPriceInCents = Math.round(plan.price * 100);
      let stripePrice = prices.data.find(
        (p) =>
          p.unit_amount === expectedPriceInCents &&
          p.recurring?.interval ===
            (plan.billingCycle === "monthly" ? "month" : "year")
      );

      if (!stripePrice) {
        console.log(`   💰 Criando preço no Stripe...`);
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: expectedPriceInCents,
          currency: "brl",
          recurring: {
            interval: plan.billingCycle === "monthly" ? "month" : "year",
          },
          metadata: {
            planId: plan.id,
          },
        });
        console.log(`   ✅ Preço criado: ${stripePrice.id} (R$ ${plan.price})`);
      } else {
        console.log(
          `   ℹ️  Preço já existe: ${stripePrice.id} (R$ ${plan.price})`
        );
      }
    }

    // 5. Testar criação de sessão de checkout
    console.log("\n🛒 Testando criação de sessão de checkout...");

    const testPlan = plans[0]; // Usar o primeiro plano para teste
    const testTenant = await prisma.tenant.findFirst();

    if (testPlan && testTenant) {
      // Buscar o produto e preço corretos
      const productName = testPlan.name;
      const stripeProducts = await stripe.products.list({ limit: 100 });
      const product = stripeProducts.data.find((p) => p.name === productName);

      if (product) {
        const prices = await stripe.prices.list({ product: product.id });
        const price = prices.data.find(
          (p) => p.unit_amount === Math.round(testPlan.price * 100)
        );

        if (price) {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
            mode: "subscription",
            success_url:
              "http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3001/cancel",
            client_reference_id: testTenant.id,
            customer_email: testTenant.contactEmail,
            metadata: {
              tenantId: testTenant.id,
              planId: testPlan.id,
              planName: testPlan.name,
            },
          });

          console.log(`✅ Sessão de checkout criada: ${session.id}`);
          console.log(`🔗 URL de teste: ${session.url}`);
          console.log("\n📋 Para testar o pagamento:");
          console.log("1. Acesse a URL acima");
          console.log("2. Use cartão de teste: 4242 4242 4242 4242");
          console.log("3. Data: qualquer data futura");
          console.log("4. CVC: qualquer 3 dígitos");
        } else {
          console.log(`❌ Preço não encontrado para o plano ${testPlan.name}`);
        }
      } else {
        console.log(`❌ Produto não encontrado para o plano ${testPlan.name}`);
      }
    } else {
      console.log("❌ Não foi possível encontrar plano ou tenant para teste");
    }

    console.log("\n🎉 Teste do Stripe concluído com sucesso!");
    console.log("\n📚 Próximos passos:");
    console.log("1. Configure o webhook do Stripe para receber eventos");
    console.log(
      "2. URL do webhook: http://localhost:3000/api/payments/webhook"
    );
    console.log(
      "3. Eventos importantes: checkout.session.completed, invoice.paid, customer.subscription.updated"
    );
  } catch (error) {
    console.error("❌ Erro durante o teste:", error.message);

    if (error.type === "StripeAuthenticationError") {
      console.log(
        "\n💡 Dica: Verifique se sua chave do Stripe está correta no .env"
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testStripeIntegration();
