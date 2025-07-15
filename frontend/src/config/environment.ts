// frontend/src/config/environment.ts

// Defina as variáveis diretamente com os valores para ambiente de desenvolvimento:
const VITE_BASE_DOMAIN = 'meusaas.com.br'; // <<< Definido diretamente
const VITE_BACKEND_PORT = 3000;          // <<< Definido diretamente
const VITE_STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY; // Mantenha se gerenciado via .env, caso contrário, defina diretamente ou remova.

// Remova ou ajuste as linhas de DEBUG relacionadas a 'from .env' se não houver .env
// console.log("ENV DEBUG: VITE_BASE_DOMAIN from .env =", import.meta.env.VITE_BASE_DOMAIN); // Remova esta linha
// console.log("ENV DEBUG: VITE_BACKEND_PORT from .env =", import.meta.env.VITE_BACKEND_PORT);   // Remova esta linha
console.log("ENV DEBUG: VITE_STRIPE_PUBLISHABLE_KEY from .env =", VITE_STRIPE_PUBLISHABLE_KEY); // Ajuste para usar a variável local


interface EnvConfig {
    API_URL: string;
    FRONTEND_URL: string;
    STRIPE_PUBLISHABLE_KEY: string;
    BASE_DOMAIN: string;
    BACKEND_PORT: number;
    ENVIRONMENT: string;
    IS_DEVELOPMENT: boolean;
    IS_PRODUCTION: boolean;
}

const config = {
  development: {
    API_URL: `http://localhost:${VITE_BACKEND_PORT}/api`, // Usa VITE_BACKEND_PORT que agora é 3000
    FRONTEND_URL: "http://localhost:8080",
    STRIPE_PUBLISHABLE_KEY: VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_...",
    BASE_DOMAIN: VITE_BASE_DOMAIN, // Usa VITE_BASE_DOMAIN que agora é 'meusaas.com.br'
    BACKEND_PORT: VITE_BACKEND_PORT,
  },

  production: {
    API_URL: "https://saas-estetica-automotiva.onrender.com/api",
    FRONTEND_URL: "https://saas-estetica-automotiva.vercel.app",
    STRIPE_PUBLISHABLE_KEY: VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_...",
    BASE_DOMAIN: "saas-estetica-automotiva.vercel.app",
    BACKEND_PORT: 443,
  },
};

const isDevelopment = import.meta.env.DEV; // Mantém a detecção de ambiente do Vite
const environment = isDevelopment ? "development" : "production";

export const ENV_CONFIG: EnvConfig = {
  ...config[environment],
  ENVIRONMENT: environment,
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: !isDevelopment,
};

export const API_BASE_URL = ENV_CONFIG.API_URL;

export const FRONTEND_URL = ENV_CONFIG.FRONTEND_URL;
export const STRIPE_PUBLISHABLE_KEY = ENV_CONFIG.STRIPE_PUBLISHABLE_KEY;

// DEBUG: Logs para verificar o objeto ENV_CONFIG final
console.log("ENV_CONFIG DEBUG: BASE_DOMAIN =", ENV_CONFIG.BASE_DOMAIN);
console.log("ENV_CONFIG DEBUG: BACKEND_PORT =", ENV_CONFIG.BACKEND_PORT);
console.log("ENV_CONFIG DEBUG: API_URL =", ENV_CONFIG.API_URL);

export default ENV_CONFIG;