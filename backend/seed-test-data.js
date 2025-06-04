// Script para facilitar a execução do seed com dados de teste
console.log(
  "Executando seed de dados de teste para o SaaS de Estética Automotiva..."
);

// Execução do comando npx prisma db seed
import { execSync } from "child_process";

try {
  console.log("\n1. Resetando o banco de dados...");
  execSync("npx prisma db push --force-reset", { stdio: "inherit" });

  console.log("\n2. Executando seed de dados...");
  execSync("npx prisma db seed", { stdio: "inherit" });

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("\nAgora você pode testar a aplicação com os seguintes dados:");
  console.log("\n📋 Tenants disponíveis:");
  console.log("   - premium.esteticasaas.local (Premium Estética)");
  console.log("   - modelo.esteticasaas.local (Estética Modelo)");
  console.log("   - teste.esteticasaas.local (Estética Teste)");

  console.log("\n👤 Usuários para teste:");
  console.log("   - Admin: admin@teste.com / Senha123");
  console.log("   - Funcionário: funcionario@teste.com / Senha123");
  console.log("   - Cliente: joao@exemplo.com / Senha123");

  console.log("\n🚗 Serviços disponíveis:");
  console.log("   - Lavagem Completa - R$80,00");
  console.log("   - Polimento - R$200,00");
  console.log("   - Higienização Interna - R$150,00");
  console.log("   - Cristalização - R$250,00");

  console.log(
    "\n📅 Já existem agendamentos de exemplo para hoje, amanhã e depois de amanhã"
  );
  console.log("\nPara iniciar o backend execute: npm run dev");
  console.log(
    "Para iniciar o frontend, em outro terminal execute: cd ../frontend && npm run dev"
  );
} catch (error) {
  console.error("\n❌ Erro ao executar o seed:", error.message);
  process.exit(1);
}
