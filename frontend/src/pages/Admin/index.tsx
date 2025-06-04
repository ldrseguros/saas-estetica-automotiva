import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Settings,
  LayoutDashboard,
  Camera,
  Wrench,
  Activity,
  PieChart,
  TrendingUp,
  Clock,
  Car,
  Tag,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import UserTable from "@/components/Admin/UserTable";
import ClientTable from "@/components/Admin/ClientTable";
import EditUserModal from "@/components/Admin/EditUserModal";
import BookingTable, {
  BookingTableBooking,
} from "@/components/Admin/BookingTable";
import CreateBookingModal from "@/components/Admin/CreateBookingModal";
import CreateServiceModal from "@/components/Admin/CreateServiceModal";
import EditServiceModal from "@/components/Admin/EditServiceModal";
import ServiceTable from "@/components/Admin/ServiceTable";
import EditClientModal from "@/components/Admin/EditClientModal";
import EditBookingModal from "@/components/Admin/EditBookingModal";

import API from "@/utils/apiService";
import { toast } from "sonner";
import { fetchUsers, fetchClients } from "@/utils/apiService";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for Service (full details for CRUD operations)
interface Service {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  duration: number;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardStats {
  bookingsToday: number;
  totalBookings: number;
  newClientsPerMonth: Array<{ month: string; count: number }>;
}

// Interface for Operating Hours (assuming simple strings like "HH:MM")
interface OperatingHours {
  weekdayOpeningTime: string;
  weekdayClosingTime: string;
  saturdayOpeningTime?: string | null;
  saturdayClosingTime?: string | null;
}

// Dashboard para o administrador
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState<boolean>(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  // Estado para edição de cliente no dashboard
  const [editCliente, setEditCliente] = useState<Client | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Estado para Gerenciamento de Agendamentos
  const [bookings, setBookings] = useState<BookingTableBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [bookingToDeleteId, setBookingToDeleteId] = useState<string | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditBookingModalOpen, setIsEditBookingModalOpen] =
    useState<boolean>(false);
  const [bookingToEdit, setBookingToEdit] =
    useState<BookingTableBooking | null>(null);

  // State for dashboard statistics
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // State for Services CRUD
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] =
    useState<boolean>(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] =
    useState<boolean>(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [isDeleteServiceDialogOpen, setIsDeleteServiceDialogOpen] =
    useState<boolean>(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(
    null
  );

  // State for Settings tab inputs and fetched data
  const [adminName, setAdminName] = useState<string>("Administrador");
  const [adminEmail, setAdminEmail] = useState<string>("admin@dm.com");
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(
    null
  );
  const [loadingSettings, setLoadingSettings] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Verificar se o usuário está logado como admin
  React.useEffect(() => {
    const fetchData = async () => {
      const userStr = sessionStorage.getItem("user");
      const token = sessionStorage.getItem("token");

      console.group("Admin Dashboard Data Fetching");
      console.log("User from sessionStorage:", userStr);
      console.log("Token from sessionStorage:", token);

      if (!userStr || !token) {
        console.error("No user or token found");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userStr);
      console.log("Parsed User:", user);

      if (user.role !== "ADMIN") {
        console.error("User is not an admin");
        navigate("/painel");
        return;
      }

      try {
        if (activeTab === "users") {
          setLoadingUsers(true);
          setUsersError(null);
          try {
            const response = await fetchUsers({ role: ["USER", "ADMIN"] });
            console.log("Users Fetch Response:", response);

            if (Array.isArray(response.data)) {
              setUsers(
                response.data.filter(
                  (user) => user.role === "USER" || user.role === "ADMIN"
                )
              );
            } else if (response.data && Array.isArray(response.data.users)) {
              setUsers(
                response.data.users.filter(
                  (user) => user.role === "USER" || user.role === "ADMIN"
                )
              );
            } else {
              console.error("Unexpected users response format:", response.data);
              setUsersError("Formato de resposta inesperado");
            }
          } catch (error) {
            console.error("Error fetching users:", error);
            const err = error as Error & {
              response?: { data?: { message?: string } };
            };
            setUsersError(
              err.response?.data?.message ||
                err.message ||
                "Erro ao carregar usuários"
            );
            toast.error(
              err.response?.data?.message ||
                err.message ||
                "Erro ao carregar usuários"
            );
          } finally {
            setLoadingUsers(false);
          }
        }

        if (activeTab === "clients") {
          setLoadingClients(true);
          setClientsError(null);
          try {
            const response = await fetchClients({ role: "CLIENT" });
            console.log("Clients Fetch Response:", response);

            if (Array.isArray(response.data)) {
              setClients(response.data);
            } else if (response.data && Array.isArray(response.data.clients)) {
              setClients(response.data.clients);
            } else if (response.data && Array.isArray(response.data.users)) {
              setClients(
                response.data.users.map(
                  (u: User) =>
                    ({
                      ...u,
                      id: u.id,
                      name: u.name || u.email.split("@")[0],
                    } as Client)
                )
              );
            } else {
              console.error(
                "Unexpected clients response format:",
                response.data
              );
              setClientsError("Formato de resposta inesperado para clientes.");
            }
          } catch (error) {
            console.error("Detailed Fetch Error (Clients):", error);
            const err = error as Error & {
              response?: { data?: { message?: string } };
            };
            const errorMessage =
              err.response?.data?.message ||
              err.message ||
              "Erro ao carregar clientes";
            setClientsError(errorMessage);
          } finally {
            setLoadingClients(false);
          }
        }

        if (activeTab === "bookings") {
          const fetchBookings = async () => {
            setLoadingBookings(true);
            setBookingsError(null);
            try {
              const response = await API.get<BookingTableBooking[]>(
                "/bookings/admin"
              );
              setBookings(response.data);
            } catch (error) {
              console.error("Error fetching bookings:", error);
              const err = error as Error & {
                response?: { data?: { message?: string } };
              };
              setBookingsError(
                err.response?.data?.message ||
                  err.message ||
                  "Failed to load bookings."
              );
              toast.error(
                err.response?.data?.message ||
                  err.message ||
                  "Failed to load bookings."
              );
            } finally {
              setLoadingBookings(false);
            }
          };

          await fetchBookings();
        }

        if (activeTab === "overview") {
          setLoadingStats(true);
          setStatsError(null);
          try {
            console.log("Fetching dashboard stats...");
            const response = await API.get<DashboardStats>(
              "/admin/dashboard/stats"
            );
            console.log("Dashboard Stats Response:", response.data);
            setDashboardStats(response.data);
          } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            const err = error as Error & {
              response?: { data?: { message?: string } };
            };
            setStatsError(
              err.response?.data?.message ||
                err.message ||
                "Erro ao carregar estatísticas."
            );
          } finally {
            setLoadingStats(false);
          }
        }

        // --- Add Service Fetching Logic ---
        else if (activeTab === "services") {
          setLoadingServices(true);
          setServicesError(null);
          try {
            console.log("Fetching admin services...");
            const response = await API.get<Service[]>("/services");
            console.log("Admin Services Response:", response.data);
            setServices(response.data);
          } catch (error) {
            console.error("Error fetching admin services:", error);
            const err = error as Error & {
              response?: { data?: { message?: string } };
            };
            const msg =
              err.response?.data?.message ||
              err.message ||
              "Erro ao carregar serviços.";
            setServicesError(msg);
            toast.error(msg);
          } finally {
            setLoadingServices(false);
          }
        }
        // --- End Service Fetching Logic ---

        // --- Add Settings Fetching Logic ---
        else if (activeTab === "settings") {
          setLoadingSettings(true);
          setSettingsError(null);
          try {
            console.log("Fetching settings...");
            const response = await API.get<OperatingHours>("/settings/hours");
            console.log("Settings Response:", response.data);
            setOperatingHours(response.data);
            // Assuming admin name/email might also come from settings or user profile
            // setAdminName(response.data.adminName || user.name); // Example if settings include admin name
            // setAdminEmail(response.data.adminEmail || user.email); // Example if settings include admin email
          } catch (error) {
            console.error("Error fetching settings:", error);
            const err = error as Error & {
              response?: { data?: { message?: string } };
            };
            const msg =
              err.response?.data?.message ||
              err.message ||
              "Erro ao carregar configurações.";
            setSettingsError(msg);
            toast.error(msg);
          } finally {
            setLoadingSettings(false);
          }
        }
        // --- End Settings Fetching Logic ---
      } catch (error) {
        console.error("Detailed Fetch Error in fetchData:", error);
        const err = error as Error & {
          response?: { data?: { message?: string } };
        };

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Erro ao carregar dados";

        if (activeTab === "users") {
          setUsersError(errorMessage);
          toast.error("Erro ao carregar usuários: " + errorMessage);
        } else if (activeTab === "clients") {
          setClientsError(errorMessage);
          toast.error("Erro ao carregar clientes: " + errorMessage);
        } else if (activeTab === "bookings") {
          setBookingsError(errorMessage);
          toast.error("Erro ao carregar agendamentos: " + errorMessage);
        } else if (activeTab === "services") {
          // Add error handling for services tab
          setServicesError(errorMessage);
          toast.error("Erro ao carregar serviços: " + errorMessage);
        } else if (activeTab === "settings") {
          // Add error handling for settings tab
          setSettingsError(errorMessage);
          toast.error("Erro ao carregar configurações: " + errorMessage);
        }
      } finally {
        if (activeTab === "users") {
          setLoadingUsers(false);
        }
        if (activeTab === "clients") {
          setLoadingClients(false);
        }
        if (activeTab === "bookings") {
          setLoadingBookings(false);
        }
        if (activeTab === "services") {
          // Add loading state finalization for services
          setLoadingServices(false);
        } else if (activeTab === "settings") {
          // Add loading state finalization for settings
          setLoadingSettings(false);
        }
        console.groupEnd();
      }
    };

    fetchData();
  }, [activeTab, navigate]);

  useEffect(() => {
    if (activeTab === "bookings") {
      const fetchBookings = async () => {
        setLoadingBookings(true);
        setBookingsError(null);
        try {
          const response = await API.get("/bookings/admin");
          setBookings(response.data);
        } catch (error) {
          console.error("Error fetching bookings:", error);
          setBookingsError("Failed to load bookings.");
          toast.error("Failed to load bookings.");
        } finally {
          setLoadingBookings(false);
        }
      };

      fetchBookings();
    }
  }, [activeTab]);

  // Função para abrir o modal de edição
  const handleEditUserClick = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  // Função para fechar o modal de edição
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  // Função para salvar usuário (chamada pelo modal)
  const handleSaveUser = async (
    userId: string,
    updates: Partial<User & { password?: string }>
  ) => {
    try {
      // Chama o endpoint PATCH do backend (modificado de PUT para PATCH)
      const response = await API.patch(`/admin/users/${userId}`, updates);
      const updatedUser = response.data;

      // Atualiza a lista de usuários no estado local
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)));

      toast.success("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating user:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        err.response?.data?.message || err.message || "Failed to update user."
      );
    }
  };

  // Função para deletar usuário
  const handleDeleteUser = async (userId: string) => {
    try {
      // Chama o endpoint DELETE do backend
      await API.delete(`/admin/users/${userId}`);

      // Remove o usuário da lista no estado local
      setUsers(users.filter((user) => user.id !== userId));

      toast.success("Usuário deletado com sucesso!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  // NOVAS Funções para Gerenciamento de Agendamentos

  // Função para abrir modal/formulário de edição de agendamento
  const handleEditBookingClick = async (booking: BookingTableBooking) => {
    // Definir o agendamento para edição e abrir o modal
    setBookingToEdit(booking);
    setIsEditBookingModalOpen(true);
  };

  // Função para deletar agendamento (implementar)
  const handleDeleteBookingClick = (bookingId: string) => {
    setBookingToDeleteId(bookingId);
    setIsDeleteDialogOpen(true);
  };

  const deleteBooking = async () => {
    if (!bookingToDeleteId) return;

    try {
      await API.delete(`/bookings/admin/${bookingToDeleteId}`);
      setBookings(
        bookings.filter((booking) => booking.id !== bookingToDeleteId)
      );
      toast.success("Agendamento deletado com sucesso!");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking.");
    } finally {
      setIsDeleteDialogOpen(false);
      setBookingToDeleteId(null);
    }
  };

  // Function to open create booking modal
  const handleCreateBookingClick = () => {
    setIsCreateModalOpen(true);
  };

  // Function to close create booking modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Function to save new booking (called by modal)
  const handleSaveNewBooking = async (newBookingData: {
    clientId: string;
    vehicleId: string;
    serviceIds: string[];
    date: string;
    time: string;
    status: string;
    specialInstructions?: string;
    location?: string;
  }) => {
    try {
      console.log("Enviando dados para criar agendamento:", newBookingData);
      // Call the backend POST endpoint to create a new booking
      const response = await API.post("/bookings/admin", newBookingData);
      const createdBooking = response.data;

      // Add the new booking to the local state
      setBookings([...bookings, createdBooking]); // Or fetch bookings again if sorting is needed

      toast.success("Agendamento criado com sucesso!");
      handleCloseCreateModal(); // Close the modal on success
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Falha ao criar agendamento.");
    }
  };

  // Client management methods
  const handleEditClientClick = (client: Client) => {
    setEditCliente(client);
    setOpenEditModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await API.delete(`/admin/users/${clientId}`);
      setClients(clients.filter((client) => client.id !== clientId));
      toast.success("Cliente deletado com sucesso!");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client.");
    }
  };

  // CRUD functions for Services
  const handleCreateService = async (serviceData: Omit<Service, "id">) => {
    try {
      const response = await API.post<Service>("/services", serviceData);
      setServices([...services, response.data]);
      toast.success("Serviço criado com sucesso!");
      setIsCreateServiceModalOpen(false);
    } catch (error) {
      console.error("Error creating service:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        err.response?.data?.message || err.message || "Erro ao criar serviço"
      );
    }
  };

  const handleEditServiceClick = (service: Service) => {
    setServiceToEdit(service);
    setIsEditServiceModalOpen(true);
  };

  const handleUpdateService = async (
    serviceId: string,
    serviceData: Partial<Service>
  ) => {
    try {
      const response = await API.put<Service>(
        `/services/${serviceId}`,
        serviceData
      );
      setServices(
        services.map((s) => (s.id === serviceId ? response.data : s))
      );
      toast.success("Serviço atualizado com sucesso!");
      setIsEditServiceModalOpen(false);
      setServiceToEdit(null);
    } catch (error) {
      console.error("Error updating service:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erro ao atualizar serviço"
      );
    }
  };

  const handleDeleteServiceClick = (serviceId: string) => {
    setServiceToDeleteId(serviceId);
    setIsDeleteServiceDialogOpen(true);
  };

  const deleteService = async () => {
    if (!serviceToDeleteId) return;

    try {
      await API.delete(`/services/${serviceToDeleteId}`);
      setServices(services.filter((s) => s.id !== serviceToDeleteId));
      toast.success("Serviço deletado com sucesso!");
    } catch (error) {
      console.error("Error deleting service:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        err.response?.data?.message || err.message || "Erro ao deletar serviço"
      );
    } finally {
      setIsDeleteServiceDialogOpen(false);
      setServiceToDeleteId(null);
    }
  };

  // Function to handle saving settings
  const handleSaveSettings = async () => {
    if (!operatingHours) {
      toast.error("Nenhum dado de configuração para salvar.");
      return;
    }
    setLoadingSettings(true);
    setSettingsError(null);

    try {
      // Assuming the backend PUT /settings/hours expects an object with hour details
      const settingsDataToSave = {
        weekdayOpeningTime: operatingHours.weekdayOpeningTime,
        weekdayClosingTime: operatingHours.weekdayClosingTime,
        saturdayOpeningTime: operatingHours.saturdayOpeningTime || null,
        saturdayClosingTime: operatingHours.saturdayClosingTime || null,
        // Include adminName and adminEmail if they are saved via this endpoint
        // adminName: adminName,
        // adminEmail: adminEmail,
      };

      const response = await API.put("/settings/hours", settingsDataToSave);
      console.log("Settings saved successfully:", response.data);
      toast.success("Configurações salvas com sucesso!");
      setOperatingHours(response.data); // Update state with response data
    } catch (error) {
      console.error("Error saving settings:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao salvar configurações.";
      setSettingsError(msg);
      toast.error(msg);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Render Stats Cards for Overview
  const renderStatsCards = () => {
    if (loadingStats) return <p>Carregando estatísticas...</p>;
    if (statsError) return <p className="text-red-500">{statsError}</p>;
    if (!dashboardStats) return <p>Nenhuma estatística disponível.</p>;

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardTitle className="text-base font-medium text-blue-400">
              Agendamentos Hoje
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">
              {dashboardStats.bookingsToday}
            </div>
            <p className="mt-2 text-xs text-blue-300/70">
              Agendamentos para o dia atual
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
            <CardTitle className="text-base font-medium text-emerald-400">
              Total de Agendamentos
            </CardTitle>
            <div className="p-2 rounded-full bg-emerald-500/20">
              <PieChart className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">
              {dashboardStats.totalBookings}
            </div>
            <p className="mt-2 text-xs text-emerald-300/70">
              Total acumulado de todos os serviços
            </p>
          </CardContent>
        </Card>

        {dashboardStats.newClientsPerMonth &&
          dashboardStats.newClientsPerMonth.length > 0 && (
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium text-purple-400">
                    Novos Clientes
                  </CardTitle>
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
                <CardDescription className="text-purple-300/70 text-xs">
                  Crescimento mensal
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {dashboardStats.newClientsPerMonth.map((item) => (
                    <div
                      key={item.month}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm text-gray-300">{item.month}</div>
                      <div className="flex items-center">
                        <div className="w-12 h-2 rounded-full overflow-hidden bg-slate-700 mr-2">
                          <div
                            className="h-full bg-purple-500"
                            style={{
                              width: `${Math.min(item.count * 10, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header do Dashboard */}
      <header className="backdrop-blur-sm bg-slate-950/90 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-brand-red/20">
              <LayoutDashboard className="text-brand-red h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-white">DM Estética Admin</h1>
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-400">Olá, Administrador</span>
            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem("user");
                navigate("/login");
              }}
              className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white transition-all duration-200"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        {/* Estatísticas Rápidas */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Activity className="mr-2 h-5 w-5 text-brand-red" />
          Dashboard
        </h2>
        {renderStatsCards()}

        {/* Conteúdo Principal */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="w-full max-w-[90%] grid grid-cols-6 h-auto p-1.5 mx-auto bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red/80 data-[state=active]:to-brand-red data-[state=active]:text-white rounded-lg transition-all"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red/80 data-[state=active]:to-brand-red data-[state=active]:text-white rounded-lg transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red/80 data-[state=active]:to-brand-red data-[state=active]:text-white rounded-lg transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red/80 data-[state=active]:to-brand-red data-[state=active]:text-white rounded-lg transition-all"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red/80 data-[state=active]:to-brand-red data-[state=active]:text-white rounded-lg transition-all"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Serviços
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red/80 data-[state=active]:to-brand-red data-[state=active]:text-white rounded-lg transition-all"
            >
              <Settings className="h-4 w-4 mr-2" />
              Config.
            </TabsTrigger>
          </TabsList>

          {/* Tab de Agendamentos */}
          <TabsContent value="overview">
            <Card className="border-none shadow-lg bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="flex items-center text-white">
                  <LayoutDashboard className="mr-2 h-5 w-5 text-brand-red" />
                  Visão Geral
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Resumo das atividades e estatísticas do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-400" />
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab("bookings")}
                    className="w-full justify-start items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-4 h-auto rounded-xl group shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="p-2 rounded-full bg-blue-400/20 group-hover:bg-blue-400/30 transition-all">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Ver Agendamentos</div>
                      <div className="text-xs text-blue-200 mt-1">
                        Gerencie todos os serviços marcados
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("users")}
                    className="w-full justify-start items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white p-4 h-auto rounded-xl group shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="p-2 rounded-full bg-emerald-400/20 group-hover:bg-emerald-400/30 transition-all">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Gerenciar Usuários</div>
                      <div className="text-xs text-emerald-200 mt-1">
                        Acesso a todos os usuários do sistema
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("clients")}
                    className="w-full justify-start items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white p-4 h-auto rounded-xl group shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="p-2 rounded-full bg-purple-400/20 group-hover:bg-purple-400/30 transition-all">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Gerenciar Clientes</div>
                      <div className="text-xs text-purple-200 mt-1">
                        Acesso a todos os clientes cadastrados
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => navigate("/admin/whatsapp")}
                    className="w-full justify-start items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-4 h-auto rounded-xl group shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="p-2 rounded-full bg-green-400/20 group-hover:bg-green-400/30 transition-all">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">WhatsApp Business</div>
                      <div className="text-xs text-green-200 mt-1">
                        Mensagens e relatórios via WhatsApp
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Usuários */}
          <TabsContent value="users">
            <Card className="border-none shadow-lg bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700/50">
                <div>
                  <CardTitle className="flex items-center text-white">
                    <Users className="mr-2 h-5 w-5 text-blue-400" />
                    Usuários
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Gerencie usuários do sistema
                  </CardDescription>
                </div>
                <Button
                  className="bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red/90 hover:to-red-600 shadow-md"
                  onClick={() => {
                    console.log("Adicionar novo usuário");
                  }}
                >
                  Novo Usuário
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingUsers ? (
                  <div className="text-center py-4 text-gray-400">
                    Carregando usuários...
                  </div>
                ) : usersError ? (
                  <div className="text-red-400 text-center py-4 bg-red-400/10 rounded-lg border border-red-400/20 p-3">
                    {usersError}
                  </div>
                ) : (
                  <UserTable
                    users={users}
                    onEditUser={handleEditUserClick}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Clientes */}
          <TabsContent value="clients">
            <Card className="border-none shadow-lg bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700/50">
                <div>
                  <CardTitle className="flex items-center text-white">
                    <Users className="mr-2 h-5 w-5 text-purple-400" />
                    Clientes
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Gerencie clientes do sistema
                  </CardDescription>
                </div>
                <Button
                  className="bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red/90 hover:to-red-600 shadow-md"
                  onClick={() => {
                    console.log("Adicionar novo cliente");
                  }}
                >
                  Novo Cliente
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingClients ? (
                  <div className="text-center py-4 text-gray-400">
                    Carregando clientes...
                  </div>
                ) : clientsError ? (
                  <div className="text-red-400 text-center py-4 bg-red-400/10 rounded-lg border border-red-400/20 p-3">
                    {clientsError}
                  </div>
                ) : (
                  <ClientTable
                    clients={clients}
                    onEditClient={handleEditClientClick}
                    onDeleteClient={handleDeleteClient}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Agendamentos */}
          <TabsContent value="bookings">
            <Card className="border-none shadow-lg bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700/50">
                <div>
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                    Gerenciamento de Agendamentos
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Visualize, edite e gerencie agendamentos
                  </CardDescription>
                </div>
                <Button
                  className="bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red/90 hover:to-red-600 shadow-md"
                  onClick={handleCreateBookingClick}
                >
                  Novo Agendamento
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingBookings ? (
                  <div className="text-center py-4 text-gray-400">
                    Carregando agendamentos...
                  </div>
                ) : bookingsError ? (
                  <div className="text-red-400 text-center py-4 bg-red-400/10 rounded-lg border border-red-400/20 p-3">
                    {bookingsError}
                  </div>
                ) : (
                  <BookingTable
                    bookings={bookings}
                    onEditBooking={handleEditBookingClick}
                    onDeleteBooking={handleDeleteBookingClick}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Serviços */}
          <TabsContent value="services">
            <Card className="border-none shadow-lg bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700/50">
                <div>
                  <CardTitle className="flex items-center text-white">
                    <Wrench className="mr-2 h-5 w-5 text-yellow-400" />
                    Gerenciamento de Serviços
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Adicione, edite ou remova os serviços oferecidos.
                  </CardDescription>
                </div>
                <Button
                  className="bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red/90 hover:to-red-600 shadow-md"
                  onClick={() => setIsCreateServiceModalOpen(true)}
                >
                  Novo Serviço
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingServices ? (
                  <div className="text-center py-4 text-gray-400">
                    Carregando serviços...
                  </div>
                ) : servicesError ? (
                  <div className="text-red-400 text-center py-4 bg-red-400/10 rounded-lg border border-red-400/20 p-3">
                    {servicesError}
                  </div>
                ) : services.length > 0 ? (
                  <ServiceTable
                    services={services}
                    onEditService={handleEditServiceClick}
                    onDeleteService={handleDeleteServiceClick}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-slate-700/20 rounded-lg border border-slate-700/30">
                    <Tag className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                    <p className="text-lg font-medium">
                      Nenhum serviço cadastrado
                    </p>
                    <p className="text-sm mt-1 text-slate-500">
                      Clique em "Novo Serviço" para adicionar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configurações */}
          <TabsContent value="settings">
            <Card className="border-none shadow-lg bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="flex items-center text-white">
                  <Settings className="mr-2 h-5 w-5 text-slate-400" />
                  Configurações
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Gerenciar configurações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-white flex items-center">
                    <Users className="mr-2 h-4 w-4 text-blue-400" />
                    Perfil
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-white flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-emerald-400" />
                    Horários de Funcionamento
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Segunda-Sexta</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="08:00"
                          defaultValue="08:00"
                          value={operatingHours?.weekdayOpeningTime || ""}
                          onChange={(e) =>
                            setOperatingHours({
                              ...operatingHours,
                              weekdayOpeningTime: e.target.value,
                            } as OperatingHours)
                          }
                          className="w-24 bg-slate-700/50 border-slate-600"
                        />
                        <span className="text-slate-400">às</span>
                        <Input
                          placeholder="18:00"
                          defaultValue="18:00"
                          value={operatingHours?.weekdayClosingTime || ""}
                          onChange={(e) =>
                            setOperatingHours({
                              ...operatingHours,
                              weekdayClosingTime: e.target.value,
                            } as OperatingHours)
                          }
                          className="w-24 bg-slate-700/50 border-slate-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Sábado</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="08:00"
                          defaultValue="09:00"
                          value={operatingHours?.saturdayOpeningTime || ""}
                          onChange={(e) =>
                            setOperatingHours({
                              ...operatingHours,
                              saturdayOpeningTime: e.target.value,
                            } as OperatingHours)
                          }
                          className="w-24 bg-slate-700/50 border-slate-600"
                        />
                        <span className="text-slate-400">às</span>
                        <Input
                          placeholder="18:00"
                          defaultValue="15:00"
                          value={operatingHours?.saturdayClosingTime || ""}
                          onChange={(e) =>
                            setOperatingHours({
                              ...operatingHours,
                              saturdayClosingTime: e.target.value,
                            } as OperatingHours)
                          }
                          className="w-24 bg-slate-700/50 border-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red/90 hover:to-red-600 shadow-md"
                    onClick={handleSaveSettings}
                  >
                    Salvar Configurações
                  </Button>
                  {loadingSettings && (
                    <p className="text-slate-400 mt-2">Salvando...</p>
                  )}
                  {settingsError && (
                    <p className="text-red-400 mt-2">{settingsError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EditUserModal
        user={userToEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveUser}
      />

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleSaveNewBooking}
      />

      {/* Service Modals */}
      <CreateServiceModal
        isOpen={isCreateServiceModalOpen}
        onClose={() => setIsCreateServiceModalOpen(false)}
        onSave={handleCreateService}
      />

      <EditServiceModal
        isOpen={isEditServiceModalOpen}
        onClose={() => {
          setIsEditServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        onSave={handleUpdateService}
        service={serviceToEdit}
      />

      {/* Delete Service Dialog */}
      <AlertDialog
        open={isDeleteServiceDialogOpen}
        onOpenChange={setIsDeleteServiceDialogOpen}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este serviço? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => {
                setIsDeleteServiceDialogOpen(false);
                setServiceToDeleteId(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={deleteService}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso deletará permanentemente
              este agendamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBooking}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edição de Cliente para o Dashboard */}
      <EditClientModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        cliente={editCliente}
        onSaveSuccess={() => {
          // Após salvar, buscar a lista de clientes novamente para atualizar a tabela
          fetchClients({ role: "CLIENT" })
            .then((response) => {
              if (Array.isArray(response.data)) {
                setClients(response.data);
              } else if (
                response.data &&
                Array.isArray(response.data.clients)
              ) {
                setClients(response.data.clients);
              }
            })
            .catch((error) => {
              console.error("Erro ao recarregar clientes após edição:", error);
              toast.error("Erro ao recarregar clientes.");
            });
        }}
      />

      {/* Modal de Edição de Agendamento para o Admin */}
      <EditBookingModal
        open={isEditBookingModalOpen}
        onClose={() => {
          setIsEditBookingModalOpen(false);
          setBookingToEdit(null);
        }}
        booking={bookingToEdit}
        onSaveSuccess={() => {
          // Recarregar a lista de agendamentos após a edição bem sucedida
          const fetchBookings = async () => {
            setLoadingBookings(true);
            setBookingsError(null);
            try {
              const response = await API.get<BookingTableBooking[]>(
                "/bookings/admin"
              );
              setBookings(response.data);
            } catch (error) {
              console.error("Error fetching bookings after edit:", error);
              setBookingsError("Failed to reload bookings after edit.");
              toast.error("Failed to reload bookings after edit.");
            } finally {
              setLoadingBookings(false);
            }
          };
          fetchBookings();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
