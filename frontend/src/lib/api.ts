import axios from "axios";

// Interfaces para os tipos de dados
interface SignupData {
  name: string;
  subdomain: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  planId: string;
}

interface TenantData {
  name: string;
  subdomain: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: string;
}

interface PlanData {
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxEmployees: number;
  maxClients: number | null;
}

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface ServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  active: boolean;
}

interface BookingData {
  serviceId: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  time: string;
  status?: string;
  notes?: string;
}

import { ENV_CONFIG } from "../config/environment";

const API_BASE_URL_FOR_THIS_FILE = ENV_CONFIG.API_URL;

// Configuração base do axios
const api = axios.create({
  baseURL: API_BASE_URL_FOR_THIS_FILE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Adicionar o tenant ID para chamadas em subdominios
  const hostname = window.location.hostname;
  let tenantSubdomain = "";

  console.log(`[FrontEnd Interceptor] Hostname atual: ${hostname}`);

  //Cenário de subdomínio real (produção)
  if(hostname.includes(".meusaas.com.br")) {
    tenantSubdomain = hostname.split(".")[0];
    console.log(`[FrontEnd Interceptor] Subdomínio detectado(produção): ${tenantSubdomain}`);
  }
  //Cenário de subdomínio local (desenvolvimento com arquivos hosts)
  else if(hostname.includes(".localhost")) {
    tenantSubdomain = hostname.split(".")[0];
    console.log(`[FrontEnd Interceptor] Subdomínio detectado(local): ${tenantSubdomain}`);
  }
  //Cenário de localhost puro(sem subdomínio)
  else if(hostname === 'localhost' || hostname === '127.0.0.1'){
    tenantSubdomain = "esteticaas"; //defiana o subdomínio do seu tenant de desenvlvimento
    console.log(`[FrontEnd interceptor] Subdomínio fixo para localhost: ${tenantSubdomain}`);
  }

  //Evitar adicionar 'www' como tenant
  if(tenantSubdomain === "www"){
    tenantSubdomain = "";
    console.warn("[FrontEnd Interceptor] 'www' detectado como subdomínio. Não será usado como X-Tenant-ID.");
  }

  //Se um subdomínio foi detectado, adiciona o header X-Tenant-ID
  if(tenantSubdomain){
    config.headers["X-Tenant-ID"] = tenantSubdomain;
    console.log(`[FrontEnd Interceptor] X-Tenant-ID adicionado ao cabeçalho: ${tenantSubdomain}`);
  } else{
    console.warn("[FrontEnd Interceptor] X-Tenant-ID NÃO ADICIONADO. Subdomínio não detectado ou inválido.");
  }

  return config;
});

// Interceptor de resposta para tratar erros comuns
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Tratar erro 401 (não autenticado)
    if (response && response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Redirecionar para login se não for uma página pública
      const publicPaths = ["/", "/cadastro", "/login", "/checkout"];
      if (
        !publicPaths.some((path) => window.location.pathname.startsWith(path))
      ) {
        window.location.href = "/login";
      }
    }

    // Tratar erro 402 (pagamento necessário)
    if (response && response.status === 402) {
      window.location.href = "/checkout";
    }

    return Promise.reject(error);
  }
);

// API para autenticação
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post("/public/signup", data);
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// API para gerenciamento de tenants (apenas para superadmin)
export const tenantAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/superadmin/tenants", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/superadmin/tenants/${id}`);
    return response.data;
  },

  create: async (data: TenantData) => {
    const response = await api.post("/superadmin/tenants", data);
    return response.data;
  },

  update: async (id: string, data: Partial<TenantData>) => {
    const response = await api.put(`/superadmin/tenants/${id}`, data);
    return response.data;
  },

  getUsers: async (id: string) => {
    const response = await api.get(`/superadmin/tenants/${id}/users`);
    return response.data;
  },
};

// API para gerenciamento de planos e assinaturas (apenas para superadmin)
export const subscriptionAPI = {
  getPlans: async () => {
    const response = await api.get("/superadmin/subscriptions/plans");
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await api.get(`/superadmin/subscriptions/plans/${id}`);
    return response.data;
  },

  createPlan: async (data: PlanData) => {
    const response = await api.post("/superadmin/subscriptions/plans", data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<PlanData>) => {
    const response = await api.put(
      `/superadmin/subscriptions/plans/${id}`,
      data
    );
    return response.data;
  },

  getSubscriptions: async (params = {}) => {
    const response = await api.get("/superadmin/subscriptions", { params });
    return response.data;
  },

  updateSubscriptionStatus: async (
    tenantId: string,
    data: { status: string; expirationDate?: string }
  ) => {
    const response = await api.patch(
      `/superadmin/subscriptions/${tenantId}/status`,
      data
    );
    return response.data;
  },

  getPayments: async (params = {}) => {
    const response = await api.get("/superadmin/subscriptions/payments", {
      params,
    });
    return response.data;
  },
};

// API para as rotas públicas (acessíveis sem autenticação)
export const publicAPI = {
  getPlans: async () => {
    const response = await api.get("/public/plans");
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await api.get(`/public/plans/${id}`);
    return response.data;
  },

  checkSubdomain: async (subdomain: string) => {
    const response = await api.get(`/public/check-subdomain/${subdomain}`);
    return response.data;
  },

  contact: async (data: ContactData) => {
    const response = await api.post("/public/contact", data);
    return response.data;
  },
};

// API para pagamentos
export const paymentAPI = {
  createCheckoutSession: async (data: {
    planId: string;
    tenantId: string;
    successUrl: string;
    cancelUrl: string;
  }) => {
    const response = await api.post("/payments/create-checkout-session", data);
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await api.get("/payments/subscription-status");
    return response.data;
  },

  createCustomerPortal: async (returnUrl: string) => {
    const response = await api.post("/payments/create-customer-portal", {
      returnUrl,
    });
    return response.data;
  },

  getPaymentHistory: async (params = {}) => {
    const response = await api.get("/payments/history", { params });
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get("/payments/stats");
    return response.data;
  },

  getLastPayment: async () => {
    const response = await api.get("/payments/last");
    return response.data;
  },

  getNextBillingDate: async () => {
    const response = await api.get("/payments/next-billing");
    return response.data;
  },

  createPaymentRecord: async (data: {
    planId: string;
    amount: number;
    status?: string;
    paymentMethod?: string;
    transactionId?: string;
    nextBillingDate?: string;
  }) => {
    const response = await api.post("/payments/record", data);
    return response.data;
  },

  getPlanLimits: async () => {
    const response = await api.get("/payments/plan-limits");
    return response.data;
  },
};

// API para serviços
export const serviceAPI = {
  getAll: async () => {
    const response = await api.get("/services");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  create: async (data: ServiceData) => {
    const response = await api.post("/services", data);
    return response.data;
  },

  update: async (id: string, data: Partial<ServiceData>) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

// API para agendamentos
export const bookingAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/bookings", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (data: BookingData) => {
    const response = await api.post("/bookings", data);
    return response.data;
  },

  update: async (id: string, data: Partial<BookingData>) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};

// Exporta a instância base do axios para uso direto
export default api;
