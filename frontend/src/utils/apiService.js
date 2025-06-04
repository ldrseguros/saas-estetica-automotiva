import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api" // URL do backend em desenvolvimento
      : "/api", // URL relativa em produção (assumindo proxy ou o frontend sendo servido pelo backend)

  // Adicionar timeout e tratamento de erros mais detalhado
  timeout: 10000, // 10 segundos
});

// Adicionar interceptor para incluir o token JWT nas requisições (exceto login/register)
API.interceptors.request.use(
  (config) => {
    // Buscar o token diretamente do sessionStorage
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    console.group("API Request Interceptor");
    console.log("Token from sessionStorage:", token);
    console.log("User from sessionStorage:", user);
    console.log("Request URL:", config.url);
    console.log("Request Method:", config.method);
    console.log("Request Params:", config.params);
    console.groupEnd();

    // Se houver token e a URL não for para as rotas de auth, adicionar o header Authorization
    if (token && !config.url.includes("/auth")) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header:", config.headers.Authorization);
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

    // Tratamento específico para diferentes tipos de erros
    if (error.response) {
      // O servidor respondeu com um status de erro
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized: Token may be invalid or expired");
          // Redirecionar para login ou fazer refresh do token
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
      // A requisição foi feita, mas não houve resposta
      console.error("No response received:", error.request);
    } else {
      // Algo aconteceu na configuração da requisição que causou o erro
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

// Funções para as chamadas de API
export const registerUser = (userData) => API.post("/auth/register", userData);

export const loginUser = (credentials) => API.post("/auth/login", credentials);

// Adicionar função de busca de usuários com mais detalhes
export const fetchUsers = (params) => {
  console.log("Fetching users with params:", params);
  return API.get("/admin/users", { params });
};

export const fetchClients = (params) => {
  console.log("Fetching clients with params:", params);
  return API.get("/admin/users", { params });
};

// Exemplo de chamada para rota protegida
export const getProtectedData = () => API.get("/protected/data");

// --- Service API Calls ---
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

// --- Client Specific API Calls ---

// Bookings for the logged-in client
export const fetchMyBookings = () => API.get("/bookings/client");

export const createBooking = (bookingData) =>
  API.post("/bookings/client", bookingData);

export const cancelMyBooking = (bookingId) =>
  API.put(`/bookings/client/${bookingId}/cancel`);
// If backend expects a payload for cancellation (e.g., reason), add it as a second arg to put
// export const cancelMyBooking = (bookingId, cancellationData) => API.put(`/bookings/client/${bookingId}/cancel`, cancellationData);

// Vehicles for the logged-in client
export const fetchMyVehicles = async () => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await axios.get("/api/vehicles/client", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const addMyVehicle = async (vehicleData) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await axios.post("/api/vehicles/client", vehicleData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const updateMyVehicle = async (vehicleId, vehicleData) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await axios.put(
      `/api/vehicles/client/${vehicleId}`,
      vehicleData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

export const deleteMyVehicle = async (vehicleId) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await axios.delete(`/api/vehicles/client/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

// --- Booking flow API calls ---

// Get available time slots for a specific date
export const fetchAvailableTimeSlots = (date) =>
  API.get("/bookings/available-slots", { params: { date } });

// Função para reagendar um agendamento do cliente logado
export const rescheduleMyBooking = async (bookingId, newDate, newTime) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await axios.put(
      `/api/bookings/client/${bookingId}/reschedule`,
      { date: newDate, time: newTime },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

// --- Admin API Calls ---

// Fetch vehicles by client ID for admin area
export const fetchVehiclesByClientIdAdmin = async (clientId) => {
  console.log(`Fetching vehicles for client ID: ${clientId} (Admin)`);
  const token = sessionStorage.getItem("token");
  try {
    const response = await axios.get(
      `/api/vehicles/admin/clients/${clientId}/vehicles`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { data: response.data };
  } catch (error) {
    console.error(`Error fetching vehicles for client ${clientId}:`, error);
    throw error;
  }
};

export default API; // Exportar a instância configurada do axios também, se necessário
