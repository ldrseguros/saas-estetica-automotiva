# 🚀 Guia de Deploy - SaaS Estética Automotiva

## 📋 Resumo da Arquitetura

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Banco de Dados**: Render PostgreSQL
- **Arquivos**: Render (uploads)

---

## 1. 🗄️ Deploy do Backend (Render)

### Passo 1: Criar conta no Render

1. Acesse [render.com](https://render.com)
2. Crie uma conta gratuita
3. Conecte sua conta do GitHub

### Passo 2: Criar PostgreSQL Database

1. No dashboard do Render, clique "New +"
2. Selecione "PostgreSQL"
3. Configure:
   - **Name**: `saas-estetica-db`
   - **Database**: `saas_estetica_prod`
   - **User**: `saas_user`
   - **Region**: `Oregon (US West)`
   - **Plan**: `Free`
4. Clique "Create Database"
5. **Importante**: Anote a `DATABASE_URL` interna

### Passo 3: Deploy do Backend

1. No dashboard, clique "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `saas-estetica-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`

### Passo 4: Configurar Variáveis de Ambiente

No Render, adicione estas variáveis:

```bash
# Database (use a URL interna do Render)
DATABASE_URL=postgresql://saas_user:password@dpg-xxx/saas_estetica_prod

# JWT Secret (gere uma chave forte)
JWT_SECRET=sua-chave-jwt-super-secreta-aqui-com-32-caracteres

# Stripe (suas chaves reais)
STRIPE_SECRET_KEY=sk_live_seu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_seu_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# WhatsApp/Twilio (opcional por enquanto)
TWILIO_ACCOUNT_SID=seu_twilio_account_sid
TWILIO_AUTH_TOKEN=seu_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Email (configure com seu Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# Environment
NODE_ENV=production
PORT=10000

# Frontend URL (será atualizado após deploy do Vercel)
FRONTEND_URL=https://seu-app.vercel.app
```

---

## 2. 🌐 Deploy do Frontend (Vercel)

### Passo 1: Preparar o projeto

1. Certifique-se que está na pasta `frontend`
2. Teste o build local:
   ```bash
   cd frontend
   npm run build
   ```

### Passo 2: Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Crie conta e conecte GitHub
3. Clique "New Project"
4. Selecione seu repositório
5. Configure:
   - **Project Name**: `saas-estetica-frontend`
   - **Framework**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

### Passo 3: Configurar Variáveis de Ambiente

No Vercel, adicione:

```bash
# Backend URL (use a URL do Render)
VITE_API_URL=https://saas-estetica-backend.onrender.com/api

# Stripe (chave pública)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_seu_stripe_publishable_key

# Environment
NODE_ENV=production
```

### Passo 4: Atualizar Frontend

No arquivo `frontend/src/utils/apiService.js`, atualize:

```javascript
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
});
```

---

## 3. ⚙️ Configurações Finais

### Atualizar CORS no Backend

No arquivo `backend/src/app.js`:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://seu-app.vercel.app",
      "https://saas-estetica-frontend.vercel.app",
    ],
    credentials: true,
  })
);
```

### Atualizar Frontend URL no Render

1. Vá nas variáveis de ambiente do backend no Render
2. Atualize `FRONTEND_URL` com a URL do Vercel

---

## 4. 🧪 Teste do Deploy

### Verificar Backend

1. Acesse: `https://seu-backend.onrender.com/health`
2. Deve retornar: `{"status":"healthy",...}`

### Verificar Frontend

1. Acesse sua URL do Vercel
2. Teste login/cadastro
3. Verifique console do navegador

---

## 5. 📊 Monitoramento

### Logs do Render

- Dashboard → Service → Logs
- Monitore erros e performance

### Analytics do Vercel

- Dashboard → Project → Analytics
- Monitore visitantes e performance

---

## 6. 🔄 Atualizações Futuras

### Deploy Automático

- Pushes na branch `main` fazem deploy automático
- Vercel: frontend atualiza instantaneamente
- Render: backend reinicia automaticamente

---

## 7. 💰 Custos Esperados

### Render (Backend + DB)

- **Gratuito**: 750 horas/mês, 0.1 CPU, 512MB RAM
- **Pago**: $7/mês por 1 CPU, 1GB RAM

### Vercel (Frontend)

- **Gratuito**: 100GB bandwidth, domínios personalizados
- **Pago**: $20/mês para team features

---

## 🆘 Troubleshooting

### Backend não inicia

1. Verifique logs no Render
2. Confirme `DATABASE_URL`
3. Teste migrations: `npx prisma migrate deploy`

### Frontend com erro 404

1. Verifique `vercel.json`
2. Confirme variável `VITE_API_URL`
3. Teste CORS no backend

### Database Connection Error

1. Verifique `DATABASE_URL` no Render
2. Use URL **interna** do banco
3. Aguarde banco estar "Available"

---

## ✅ Checklist Final

- [ ] Backend funcionando no Render
- [ ] Database PostgreSQL criado
- [ ] Frontend funcionando no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] SSL certificados ativos
- [ ] Domínio personalizado (opcional)
- [ ] Monitoring configurado

**🎉 Parabéns! Seu SaaS está no ar!**
