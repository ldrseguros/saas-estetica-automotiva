# 🚀 Configuração para Produção - SaaS Estética Automotiva

## ✅ Status do Deploy

- **Frontend**: ✅ [https://saas-estetica-automotiva.vercel.app/](https://saas-estetica-automotiva.vercel.app/)
- **Backend**: ✅ [https://saas-estetica-automotiva.onrender.com](https://saas-estetica-automotiva.onrender.com)

---

## 🗄️ 1. Limpeza do Banco de Dados

### ⚠️ IMPORTANTE: Backup dos Dados

Antes de limpar, faça backup dos dados importantes se necessário.

### Executar Limpeza

No **Render**, vá até o terminal do seu serviço e execute:

```bash
npm run db:clean-production
```

Este script irá:

- ✅ Remover todos os agendamentos de teste
- ✅ Remover todos os veículos de teste
- ✅ Remover todos os clientes de teste
- ✅ Remover transações financeiras de teste
- ✅ Resetar configurações para padrão
- ✅ Criar planos de assinatura prontos para produção
- ✅ Manter estrutura de tenants e admins

---

## 🔧 2. Configurações de Produção

### Backend (Render)

Atualize estas variáveis de ambiente no Render:

```bash
# URLs de produção
FRONTEND_URL=https://saas-estetica-automotiva.vercel.app

# JWT Secret (gere uma nova chave forte)
JWT_SECRET=sua-chave-jwt-super-secreta-de-32-caracteres-ou-mais

# Stripe PRODUÇÃO (substitua pelas chaves reais)
STRIPE_SECRET_KEY=sk_live_sua_chave_real
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_real
STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_real

# Email PRODUÇÃO (configure SMTP real)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=contato@seudominio.com
EMAIL_PASS=sua-senha-de-aplicativo

# WhatsApp (opcional)
TWILIO_ACCOUNT_SID=seu_account_sid_real
TWILIO_AUTH_TOKEN=seu_auth_token_real
TWILIO_WHATSAPP_NUMBER=+5511999999999

# Ambiente
NODE_ENV=production
```

### Frontend (Vercel)

Atualize estas variáveis no Vercel:

```bash
# API URL de produção
VITE_API_URL=https://saas-estetica-automotiva.onrender.com/api

# Stripe chave pública PRODUÇÃO
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_real

# Ambiente
NODE_ENV=production
```

---

## 💳 3. Configurar Stripe para Produção

### 3.1 Criar Produtos no Stripe

1. Acesse [dashboard do Stripe](https://dashboard.stripe.com)
2. Mude para **modo LIVE** (toggle no canto superior direito)
3. Vá em **Products** → **Add Product**

**Criar 3 produtos:**

#### Plano Básico

- **Name**: Plano Básico - SaaS Estética
- **Price**: R$ 49,00 / mês
- **Recurring**: Monthly
- **Product ID**: Anote para usar no backend

#### Plano Premium

- **Name**: Plano Premium - SaaS Estética
- **Price**: R$ 99,00 / mês
- **Recurring**: Monthly
- **Product ID**: Anote para usar no backend

#### Plano Enterprise

- **Name**: Plano Enterprise - SaaS Estética
- **Price**: R$ 199,00 / mês
- **Recurring**: Monthly
- **Product ID**: Anote para usar no backend

### 3.2 Atualizar IDs no Banco

Execute no terminal do Render:

```sql
-- Atualizar planos com IDs reais do Stripe
UPDATE "SubscriptionPlan"
SET "stripeProductId" = 'prod_xxx', "stripePriceId" = 'price_xxx'
WHERE id = 'plan_basic';

UPDATE "SubscriptionPlan"
SET "stripeProductId" = 'prod_yyy', "stripePriceId" = 'price_yyy'
WHERE id = 'plan_premium';

UPDATE "SubscriptionPlan"
SET "stripeProductId" = 'prod_zzz', "stripePriceId" = 'price_zzz'
WHERE id = 'plan_enterprise';
```

---

## 📧 4. Configurar Email para Produção

### Gmail SMTP (Recomendado para início)

1. **Ativar 2FA** na sua conta Google
2. **Gerar senha de aplicativo**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Selecione "Mail" e "Other"
   - Nome: "SaaS Estética"
   - Use a senha gerada no `EMAIL_PASS`

### Configurações:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=contato@seudominio.com
EMAIL_PASS=senha-de-16-caracteres-gerada
```

---

## 📱 5. WhatsApp (Opcional)

### Twilio Setup:

1. Crie conta no [Twilio](https://twilio.com)
2. Verifique seu número de telefone
3. Configure WhatsApp Sandbox ou número dedicado
4. Anote: Account SID, Auth Token, WhatsApp Number

---

## 🌐 6. Domínio Personalizado (Opcional)

### Frontend (Vercel)

1. No Vercel: Settings → Domains
2. Add Domain: `seudominio.com`
3. Configure DNS conforme instruções

### Backend (Render)

1. No Render: Settings → Custom Domains
2. Add Domain: `api.seudominio.com`
3. Configure DNS conforme instruções

---

## 🔒 7. Segurança

### JWT Secret

Gere uma chave forte:

```bash
openssl rand -base64 32
```

### HTTPS

- ✅ Vercel: HTTPS automático
- ✅ Render: HTTPS automático

### Variáveis Sensíveis

- ❌ NUNCA commite chaves reais no código
- ✅ Use variáveis de ambiente sempre
- ✅ Diferentes chaves para dev/prod

---

## 📊 8. Monitoramento

### Logs

- **Render**: Dashboard → Logs (tempo real)
- **Vercel**: Dashboard → Functions → View Logs

### Performance

- **Render**: Dashboard → Metrics
- **Vercel**: Dashboard → Analytics

### Uptime

Configure notificações:

- **Render**: Pode configurar alerts
- **Externa**: UptimeRobot, Pingdom

---

## 🚀 9. Checklist de Produção

### Antes do Lançamento

- [ ] Banco de dados limpo com script
- [ ] Variáveis de ambiente atualizadas
- [ ] Chaves Stripe LIVE configuradas
- [ ] Email SMTP funcionando
- [ ] CORS configurado com URLs corretas
- [ ] Domínios configurados (se aplicável)
- [ ] Testes de cadastro/login funcionando
- [ ] Teste de criação de agendamento
- [ ] Teste de pagamento (pequeno valor)

### Pós-Lançamento

- [ ] Monitoramento ativo
- [ ] Backup automático configurado
- [ ] Documentação de APIs atualizada
- [ ] Suporte/contato configurado
- [ ] Analytics configurado

---

## 🆘 Comandos de Emergência

### Reiniciar Serviços

```bash
# Render: Deploy → Manual Deploy
# Vercel: Deployments → Redeploy
```

### Ver Logs em Tempo Real

```bash
# Render: Dashboard → Logs
# Vercel: Dashboard → Functions
```

### Rollback

```bash
# Render: Deploy → Previous Deployment
# Vercel: Deployments → Previous → Promote
```

---

## 📞 Suporte

Em caso de problemas:

1. Verifique logs primeiro
2. Confirme variáveis de ambiente
3. Teste endpoints individualmente
4. Verifique status dos serviços

**🎉 Seu SaaS está pronto para receber os primeiros clientes!**

## ✅ Próximos Passos

1. **Execute o script de limpeza**
2. **Atualize as variáveis de ambiente**
3. **Configure Stripe com chaves reais**
4. **Teste o sistema completo**

**🎉 Seu SaaS estará pronto para produção!**
