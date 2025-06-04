# Plano de Testes - SaaS Estética Automotiva

Este documento descreve o processo para testar todas as funcionalidades do sistema SaaS para estéticas automotivas, considerando as diferentes perspectivas de usuário.

## Ambiente de Testes

### Configuração do Ambiente

1. **Iniciar o backend:**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Iniciar o frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Configurar variáveis de ambiente:**

   - Garantir que o arquivo `.env` no backend contém as configurações necessárias para:
     - Banco de dados
     - Chaves Stripe (modo teste)
     - Configurações de email
     - Configurações WhatsApp (se aplicável)

4. **Ferramentas adicionais:**
   - [Stripe CLI](https://stripe.com/docs/stripe-cli) (para testar webhooks)
   - Navegador com ferramentas de desenvolvedor

## 1. Testes da Landing Page e Cadastro

### 1.1 Landing Page

- Verificar se a página inicial carrega corretamente
- Testar responsividade em desktop, tablet e mobile
- Confirmar que os links de navegação funcionam
- Verificar se os planos são exibidos corretamente

### 1.2 Processo de Cadastro

- Testar fluxo completo de cadastro:
  - Preencher informações da empresa
  - Validar campo de subdomínio (verificação de disponibilidade)
  - Preencher informações do administrador
  - Selecionar plano
  - Aceitar termos e condições
- Verificar validações de formulário
- Testar redirecionamento para checkout

## 2. Testes de Pagamento e Assinatura

### 2.1 Checkout e Pagamento

- Verificar se a página de checkout exibe corretamente os detalhes do plano
- Testar integração com Stripe:
  - Usar cartão de teste do Stripe: `4242 4242 4242 4242`
  - Verificar se o pagamento é processado
  - Testar cenário de falha com cartão `4000 0000 0000 0002`
- Verificar redirecionamento após pagamento bem-sucedido

### 2.2 Gerenciamento de Assinatura

- Verificar se o status da assinatura é exibido corretamente
- Testar cancelamento de assinatura
- Testar atualização de plano
- Verificar se o sistema reconhece pagamentos pendentes

## 3. Testes de Acesso Multi-tenant

### 3.1 Subdomínios

- Verificar acesso pelo subdomínio configurado
- Testar isolamento entre diferentes tenants
- Verificar se os dados são específicos para cada tenant

### 3.2 Login e Autenticação

- Testar login de administrador
- Testar login de funcionário
- Verificar redirecionamento para páginas corretas
- Testar funcionalidade de recuperação de senha

## 4. Testes como Dono da Estética (Administrador)

### 4.1 Dashboard Administrativo

- Verificar métricas e estatísticas
- Testar visualização de agendamentos recentes
- Verificar alertas de assinatura

### 4.2 Gerenciamento de Funcionários

- Adicionar novo funcionário
- Editar funcionário existente
- Remover funcionário
- Configurar permissões

### 4.3 Gerenciamento de Serviços

- Adicionar novo serviço
- Editar serviço existente
- Desativar/ativar serviço
- Configurar preços e duração

### 4.4 Gestão de Clientes

- Visualizar lista de clientes
- Adicionar novo cliente
- Editar informações de cliente
- Verificar histórico de agendamentos por cliente

### 4.5 Configurações de WhatsApp

- Configurar integração com WhatsApp
- Testar envio de mensagens automáticas
- Verificar lembretes de agendamento

### 4.6 Relatórios

- Gerar relatórios de faturamento
- Visualizar estatísticas de serviços mais populares
- Verificar relatórios por período

## 5. Testes como Funcionário da Estética

### 5.1 Painel do Funcionário

- Verificar agenda do dia
- Visualizar próximos agendamentos
- Registrar conclusão de serviço

### 5.2 Gerenciamento de Agendamentos

- Visualizar agendamentos designados
- Confirmar agendamento
- Cancelar agendamento
- Reagendar serviço

### 5.3 Atendimento ao Cliente

- Registrar informações sobre o atendimento
- Adicionar observações ao perfil do cliente
- Recomendar serviços adicionais

## 6. Testes como Cliente Final

### 6.1 Agendamento Público

- Acessar página de agendamento público
- Selecionar serviço
- Escolher data e horário disponíveis
- Preencher informações pessoais e do veículo
- Confirmar agendamento
- Verificar email de confirmação

### 6.2 Portal do Cliente (se implementado)

- Criar conta de cliente
- Visualizar agendamentos passados e futuros
- Cancelar ou reagendar serviço
- Atualizar informações pessoais

## 7. Testes de Integração

### 7.1 Notificações

- Verificar envio de emails de confirmação
- Testar notificações WhatsApp
- Verificar lembretes automáticos

### 7.2 Pagamentos

- Testar integração com Stripe para pagamentos recorrentes
- Verificar tratamento de falhas de pagamento
- Testar renovação automática de assinatura

## 8. Testes de Desempenho e Segurança

### 8.1 Desempenho

- Verificar tempo de carregamento das páginas
- Testar comportamento com múltiplos usuários simultâneos
- Verificar consumo de recursos do servidor

### 8.2 Segurança

- Verificar proteção de rotas autenticadas
- Testar isolamento de dados entre tenants
- Verificar validações de entrada
- Testar proteção contra CSRF, XSS e injeção SQL

## Roteiro de Testes Manuais

A seguir está um roteiro passo a passo para testar manualmente o sistema do ponto de vista de cada tipo de usuário:

### Teste como Cliente Final

1. Acesse a página pública de agendamento
2. Selecione um serviço
3. Escolha uma data e horário disponíveis
4. Preencha informações pessoais e do veículo
5. Confirme o agendamento
6. Verifique a confirmação e referência gerada

### Teste como Dono da Estética

1. Acesse a página de cadastro
2. Complete o processo de cadastro com informações da empresa
3. Escolha um plano
4. Complete o checkout (use cartão de teste Stripe)
5. Acesse o dashboard administrativo
6. Configure serviços disponíveis
7. Adicione funcionários
8. Visualize agendamentos
9. Acesse a página de gerenciamento de assinatura

### Teste como Funcionário

1. Faça login com credenciais de funcionário
2. Verifique a agenda do dia
3. Confirme um agendamento
4. Marque um serviço como concluído
5. Registre informações sobre o atendimento

## Dados de Teste

### Cartões de Teste Stripe

- Pagamento bem-sucedido: `4242 4242 4242 4242`
- Pagamento recusado: `4000 0000 0000 0002`
- Autenticação necessária: `4000 0025 0000 3155`

### Contas de Usuário para Teste

- **Admin**: admin@esteticateste.com / Senha123
- **Funcionário**: funcionario@esteticateste.com / Senha123
- **Cliente**: cliente@exemplo.com / Senha123

## Registrando Problemas

Ao encontrar problemas durante os testes, documente:

1. Descrição do problema
2. Passos para reproduzir
3. Comportamento esperado vs. comportamento observado
4. Captura de tela (se aplicável)
5. Ambiente (navegador, dispositivo)
