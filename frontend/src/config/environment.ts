// Configurações de ambiente para o frontend

const config = {
  // URLs de desenvolvimento
  development: {
    API_URL: "http://localhost:3000/api",
    FRONTEND_URL: "http://localhost:8080",
    STRIPE_PUBLISHABLE_KEY:
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_...",

       BASE_DOMAIN: "meusaas.com.br",
  },

  // URLs de produção
  production: {
    API_URL: "https://saas-estetica-automotiva.onrender.com/api",
    FRONTEND_URL: "https://saas-estetica-automotiva.vercel.app",
    STRIPE_PUBLISHABLE_KEY:
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_...",
    BASE_DOMAIN: "saas-estetica-automotiva.vercel.app",
   
  },
};

// Detectar ambiente
const isDevelopment = import.meta.env.DEV;
const environment = isDevelopment ? "development" : "production";

// Exportar configuração atual
export const ENV_CONFIG = {
  ...config[environment],
  ENVIRONMENT: environment,
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: !isDevelopment,
};

// URLs específicas
export const API_BASE_URL = import.meta.env.VITE_API_URL || ENV_CONFIG.API_URL;
export const FRONTEND_URL = ENV_CONFIG.FRONTEND_URL;
export const STRIPE_PUBLISHABLE_KEY = ENV_CONFIG.STRIPE_PUBLISHABLE_KEY;

// Debug info (apenas em desenvolvimento)
if (isDevelopment) {
  console.log("🔧 Environment Config:", {
    environment,
    apiUrl: API_BASE_URL,
    frontendUrl: FRONTEND_URL,
    hasStripeKey: !!STRIPE_PUBLISHABLE_KEY,
  });
}

export default ENV_CONFIG;
