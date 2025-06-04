# Instruções para Testar o SaaS de Estética Automotiva com Seeds

Este documento fornece instruções para testar o sistema usando dados pré-carregados (seeds).

## Pré-requisitos

- Node.js instalado (versão 16 ou superior)
- Navegador web moderno (Chrome, Firefox, Edge)
- Conexão com a internet (para testes de pagamento com Stripe)

## Como iniciar os testes usando seeds

### Passo 1: Preparar o banco de dados e carregar dados de exemplo

```bash
cd backend
npm install
npm run seed-test
```

Este comando irá:

1. Resetar o banco de dados
2. Carregar todos os dados de teste necessários
3. Mostrar informações sobre os dados disponíveis para teste

### Passo 2: Iniciar o backend

Em um terminal:

```bash
cd backend
npm run dev
```

### Passo 3: Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

### Passo 4: Acessar a aplicação

- Abra seu navegador e acesse: `http://localhost:5173`

## Dados pré-carregados para teste

Os seguintes dados foram pré-carregados pelo seed:

### Tenants (Estéticas)

- **Premium Estética** - subdomínio: `premium`
- **Estética Modelo** - subdomínio: `modelo`
- **Estética Teste** - subdomínio: `teste`

### Usuários

- **Administrador:**

  - Email: `admin@teste.com`
  - Senha: `Senha123`
  - Acesso: Todas as funcionalidades administrativas

- **Funcionário:**

  - Email: `funcionario@teste.com`
  - Senha: `Senha123`
  - Acesso: Agenda, agendamentos e atendimentos

- **Cliente:**
  - Email: `joao@exemplo.com`
  - Senha: `Senha123`

### Planos

- **Básico:** R$ 99,90/mês
- **Profissional:** R$ 199,90/mês
- **Premium:** R$ 299,90/mês

### Serviços

- Lavagem Completa - R$ 80,00
- Polimento - R$ 200,00
- Higienização Interna - R$ 150,00
- Cristalização - R$ 250,00

### Agendamentos

- Vários agendamentos de exemplo para hoje, amanhã e depois de amanhã

## Roteiro de Testes com Seeds

### 1. Teste como Cliente Final

- Acesse: `http://localhost:5173/agendar-servico`
- Selecione um dos serviços pré-carregados
- Escolha data e horário
- Complete o agendamento com seus dados
- Verifique a confirmação e referência gerada

### 2. Teste como Administrador

- Acesse: `http://localhost:5173/login`
- Use as credenciais: `admin@teste.com` / `Senha123`
- Explore o dashboard administrativo
- Verifique os agendamentos pré-carregados
- Teste a gestão de serviços
- Acesse a página de assinatura

### 3. Teste como Funcionário

- Acesse: `http://localhost:5173/login`
- Use as credenciais: `funcionario@teste.com` / `Senha123`
- Verifique os agendamentos do dia
- Confirme ou edite um agendamento
- Marque um serviço como concluído

## Simulação de multi-tenant sem modificar o arquivo hosts

Para testar o acesso multi-tenant sem modificar o arquivo hosts, você pode usar:

1. **Parâmetro de tenant na URL:**

   ```
   http://localhost:5173?tenant=premium
   http://localhost:5173?tenant=modelo
   http://localhost:5173?tenant=teste
   ```

2. **Cookies no navegador:**
   - Abra as ferramentas de desenvolvedor (F12)
   - Na aba Console, digite:
   ```javascript
   document.cookie = "TENANT_ID=premium; path=/";
   // Recarregue a página após definir o cookie
   ```

## Teste de Pagamentos (Stripe)

Para testar pagamentos:

1. Use o modo de desenvolvimento que pula a verificação de pagamento
2. Use cartões de teste diretamente no formulário de checkout:
   - Pagamento bem-sucedido: `4242 4242 4242 4242`
   - Pagamento recusado: `4000 0000 0000 0002`

## Documentação Completa

Para instruções detalhadas, consulte:

- [Guia de Testes](docs/README_TESTES.md) - Instruções passo a passo
- [Plano de Testes](docs/PLANO_DE_TESTES.md) - Plano completo de testes

## Problemas Comuns

- **Erro ao iniciar o backend**: Verifique se a porta 3000 não está sendo usada
- **Erro ao carregar seeds**: Verifique se o banco de dados está configurado corretamente no arquivo .env
- **Erro de conexão com o banco de dados**: Verifique a URL do banco de dados no .env
