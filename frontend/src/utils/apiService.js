import axios from "axios";
import { getSubdomainFromUrl } from './urlService';
import { ENV_CONFIG } from '../config/environment';

const getDynamicApiBaseUrl = () => {
    const subdomain = getSubdomainFromUrl();
    const backendPort = ENV_CONFIG.BACKEND_PORT;
    const baseDomain = ENV_CONFIG.BASE_DOMAIN;
    const protocol = window.location.protocol;

    let apiUrl;
    if (subdomain && subdomain !== 'www') {
        apiUrl = `${protocol}//${subdomain}.${baseDomain}:${backendPort}/api`; 
    } else {
        console.warn("Subdomínio não detectado na URL do navegador para API. Usando domínio base padrão.");
        apiUrl = `${protocol}//localhost:${backendPort}/api`; 
    }

    console.log("DEBUG: API Base URL gerada:", apiUrl);
    return apiUrl;
};

const API = axios.create({
  baseURL: getDynamicApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});



// Adicionar interceptor para incluir o token JWT nas requisições (exceto login/register)
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    console.group("API Request Interceptor");
    console.log("Token from sessionStorage:", token);
    console.log("Request URL:", config.url);
    console.log("Request Method:", config.method);
    console.log("Request Params:", config.params);
    console.groupEnd();

    if (token && !config.url.includes("/auth")) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header:", config.headers.Authorization);
    }

    const tenantIdFromUrl = getSubdomainFromUrl();
    const tenantIdFromSession = sessionStorage.getItem("x-tenant-id");

    if (tenantIdFromUrl) {
      config.headers["X-Tenant-ID"] = tenantIdFromUrl;
      console.log("Added X-Tenant-ID header (from URL subdomain):", config.headers["X-Tenant-ID"]);
    } else if (tenantIdFromSession) {
      config.headers["X-Tenant-ID"] = tenantIdFromSession;
      console.log("Added X-Tenant-ID header (from sessionStorage):", config.headers["X-Tenant-ID"]);
    } else {
      console.log("X-Tenant-ID header NOT added (no tenantId from URL or sessionStorage).");
    }
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Adicionar interceptor de resposta para tratamento de erros
API.interceptors.response.use(
  (response) => {
    console.group("API Response Interceptor");
    console.log("Response URL:", response.config.url);
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.group("API Response Error");
    console.error("Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config,
    });
    console.groupEnd();

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized: Token may be invalid or expired");
          break;
        case 403:
          console.error("Forbidden: You don't have permission");
          break;
        case 404:
          console.error("Not Found: The requested resource doesn't exist");
          break;
        case 500:
          console.error("Server Error: Internal server error");
          break;
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

// Funções para as chamadas de API
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const fetchUsers = (params) => {
  console.log("Fetching users with params:", params);
  return API.get("/admin/users", { params });
};
export const fetchClients = (params) => {
  console.log("Fetching clients with params:", params);
  return API.get("/admin/users", { params });
};
export const getProtectedData = () => API.get("/protected/data");
export const fetchAdminServices = () => {
  console.log("Fetching admin services");
  return API.get("/services");
};
export const fetchPublicServices = () => {
  console.log("Fetching public services");
  return API.get("/services");
};
export const createService = (serviceData) => {
  console.log("Creating service:", serviceData);
  return API.post("/services", serviceData);
};
export const updateService = (serviceId, serviceData) => {
  console.log(`Updating service ${serviceId}:`, serviceData);
  return API.put(`/services/${serviceId}`, serviceData);
};
export const deleteService = (serviceId) => {
  console.log(`Deleting service ${serviceId}`);
  return API.delete(`/services/${serviceId}`);
};
export const fetchMyBookings = () => API.get("/bookings/client");
export const createBooking = (bookingData) =>
  API.post("/bookings/client", bookingData);
export const cancelMyBooking = (bookingId) =>
  API.put(`/bookings/client/${bookingId}/cancel`);

// --- As funções de VEÍCULOS corrigidas ---
export const fetchMyVehicles = async () => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await API.get("/vehicles/client"); // REMOVIDO o "/api"
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const addMyVehicle = async (vehicleData) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await API.post("/vehicles/client", vehicleData); // REMOVIDO o "/api"
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const updateMyVehicle = async (vehicleId, vehicleData) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await API.put(
      `/vehicles/client/${vehicleId}`, // REMOVIDO o "/api"
      vehicleData,
    );
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const deleteMyVehicle = async (vehicleId) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await API.delete(`/vehicles/client/${vehicleId}`, { // REMOVIDO o "/api"
    });
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const fetchAvailableTimeSlots = (date) =>
  API.get("/bookings/available-slots", { params: { date } });

export const rescheduleMyBooking = async (bookingId, newDate, newTime) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await API.put(
      `/bookings/client/${bookingId}/reschedule`, // Este parece estar correto como está, pois tem apenas um /api
      { date: newDate, time: newTime },
    );
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const fetchVehiclesByClientIdAdmin = async (clientId) => {
  console.log(`Fetching vehicles for client ID: ${clientId} (Admin)`);
  const token = sessionStorage.getItem("token");
  try {
    const response = await API.get(
      `/vehicles/admin/clients/${clientId}/vehicles`, // REMOVIDO o "/api"
    );
    return { data: response.data };
  } catch (error) {
    console.error(`Error fetching vehicles for client ${clientId}:`, error);
    throw error;
  }
};

export default API;