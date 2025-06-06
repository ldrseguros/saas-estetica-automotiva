import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Car,
  AlertTriangle,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";

interface DashboardStats {
  bookingsToday: number;
  totalBookings: number;
  newClientsPerMonth: Array<{
    month: string;
    count: number;
  }>;
}

interface UpcomingBooking {
  id: string;
  date: string;
  startTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  client: {
    name: string;
    email: string;
  };
  services: Array<{
    name: string;
    price: number;
  }>;
}

interface DashboardData {
  stats: DashboardStats;
  upcomingBookings: UpcomingBooking[];
  totalClients: number;
  totalServices: number;
}

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        // Buscar estatísticas do dashboard
        const statsResponse = await fetch("/api/admin/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!statsResponse.ok) {
          throw new Error("Erro ao buscar estatísticas do dashboard");
        }

        const stats = await statsResponse.json();

        // Buscar agendamentos recentes (próximos)
        const bookingsResponse = await fetch("/api/bookings/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!bookingsResponse.ok) {
          throw new Error("Erro ao buscar agendamentos");
        }

        const allBookings = await bookingsResponse.json();

        // Filtrar próximos agendamentos (próximos 7 dias)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcomingBookings = allBookings
          .filter((booking: UpcomingBooking) => {
            const bookingDate = new Date(booking.date);
            return (
              bookingDate >= now &&
              bookingDate <= nextWeek &&
              booking.status !== "CANCELLED"
            );
          })
          .sort(
            (a: UpcomingBooking, b: UpcomingBooking) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 5); // Mostrar apenas os próximos 5

        // Buscar total de clientes
        const clientsResponse = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!clientsResponse.ok) {
          throw new Error("Erro ao buscar clientes");
        }

        const allUsers = await clientsResponse.json();
        const totalClients = allUsers.filter(
          (user: { role: string }) => user.role === "CLIENT"
        ).length;

        // Buscar total de serviços
        const servicesResponse = await fetch("/api/services/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!servicesResponse.ok) {
          throw new Error("Erro ao buscar serviços");
        }

        const allServices = await servicesResponse.json();
        const totalServices = allServices.length;

        setDashboardData({
          stats,
          upcomingBookings,
          totalClients,
          totalServices,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error(`Erro ao carregar dashboard: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // "HH:MM" format
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmado";
      case "PENDING":
        return "Pendente";
      case "CANCELLED":
        return "Cancelado";
      case "COMPLETED":
        return "Concluído";
      default:
        return status;
    }
  };

  const calculateTotalRevenue = () => {
    if (!dashboardData?.upcomingBookings) return 0;

    return dashboardData.upcomingBookings.reduce((total, booking) => {
      const bookingTotal = booking.services.reduce(
        (sum, service) => sum + service.price,
        0
      );
      return total + bookingTotal;
    }, 0);
  };

  const getRecentClientsGrowth = () => {
    if (
      !dashboardData?.stats.newClientsPerMonth ||
      dashboardData.stats.newClientsPerMonth.length < 2
    ) {
      return { value: 0, isPositive: true };
    }

    const currentMonth =
      dashboardData.stats.newClientsPerMonth[
        dashboardData.stats.newClientsPerMonth.length - 1
      ];
    const previousMonth =
      dashboardData.stats.newClientsPerMonth[
        dashboardData.stats.newClientsPerMonth.length - 2
      ];

    if (previousMonth.count === 0) {
      return { value: currentMonth.count > 0 ? 100 : 0, isPositive: true };
    }

    const growth =
      ((currentMonth.count - previousMonth.count) / previousMonth.count) * 100;
    return { value: Math.abs(growth), isPositive: growth >= 0 };
  };

  const renderSubscriptionAlert = () => {
    // Subscription info would come from a separate API call
    // For now, we'll skip this section since it's not connected to the dashboard API
    return null;

    if (status === "TRIAL") {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Período de Teste Ativo</h3>
                <p className="text-blue-100 text-sm">
                  Você está usando o período de teste gratuito. Aproveite todas
                  as funcionalidades!
                </p>
              </div>
            </div>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/admin/assinatura")}
            >
              Ver Detalhes
            </ModernButton>
          </div>
        </motion.div>
      );
    }

    if (status === "PAST_DUE") {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Pagamento Pendente</h3>
                <p className="text-yellow-100 text-sm">
                  Sua assinatura está com pagamento pendente. Atualize os dados
                  de pagamento.
                </p>
              </div>
            </div>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/admin/assinatura")}
            >
              Regularizar Agora
            </ModernButton>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao Carregar Dashboard
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <ModernButton onClick={() => window.location.reload()}>
              Tentar Novamente
            </ModernButton>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <ModernAdminLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  const clientsGrowth = getRecentClientsGrowth();

  return (
    <ModernAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <ModernButton
              variant="outline"
              icon={Eye}
              onClick={() => navigate("/admin/relatorios")}
            >
              Ver Relatórios
            </ModernButton>
            <ModernButton icon={Plus} onClick={() => navigate("/agendar")}>
              Novo Agendamento
            </ModernButton>
          </div>
        </motion.div>

        {/* Subscription Alert */}
        {renderSubscriptionAlert()}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Agendamentos Hoje"
            value={dashboardData?.stats.bookingsToday || 0}
            change="+2 desde ontem"
            changeType="positive"
            icon={Calendar}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total de Clientes"
            value={dashboardData?.totalClients || 0}
            change="+5 este mês"
            changeType="positive"
            icon={Users}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Receita Hoje"
            value={formatCurrency(calculateTotalRevenue())}
            change="+15%"
            changeType="positive"
            icon={DollarSign}
            gradient="from-red-500 to-red-600"
          />
          <StatCard
            title="Total Agendamentos"
            value={dashboardData?.stats.totalBookings || 0}
            change="+12 esta semana"
            changeType="positive"
            icon={Activity}
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <ModernCard
            title="Receita do Mês"
            description="Comparativo mensal"
            icon={BarChart3}
            hoverable={false}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Este mês</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateTotalRevenue())}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Esta semana</span>
                <span className="text-lg font-semibold text-gray-700">
                  {formatCurrency(calculateTotalRevenue() * 0.7)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hoje</span>
                <span className="text-lg font-semibold text-gray-700">
                  {formatCurrency(calculateTotalRevenue() * 0.1)}
                </span>
              </div>

              {/* Simple Progress Bars */}
              <div className="space-y-3 pt-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Meta Mensal</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Upcoming Appointments */}
          <ModernCard
            title="Próximos Agendamentos"
            description="Agendamentos para hoje e amanhã"
            icon={Clock}
            hoverable={false}
          >
            <div className="space-y-3">
              <AnimatePresence>
                {dashboardData?.upcomingBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {booking.client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.client.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.services
                            .map((service) => service.name)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(booking.date)} às{" "}
                        {formatTime(booking.startTime)}
                      </p>
                      <div
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(!dashboardData?.upcomingBookings ||
                dashboardData.upcomingBookings.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum agendamento próximo</p>
                </div>
              )}
            </div>
          </ModernCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernCard
            title="Clientes"
            description={`${dashboardData?.totalClients || 0} cadastrados`}
            icon={Users}
            onClick={() => navigate("/admin/clientes")}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ver todos</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>

          <ModernCard
            title="Agendamentos"
            description={`${dashboardData?.stats.totalBookings || 0} total`}
            icon={Calendar}
            onClick={() => navigate("/admin/agendamentos")}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gerenciar</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>

          <ModernCard
            title="Serviços"
            description={`${dashboardData?.totalServices || 0} ativos`}
            icon={Car}
            onClick={() => navigate("/admin/servicos")}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Configurar</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>

          <ModernCard
            title="WhatsApp"
            description="Automação ativa"
            icon={Activity}
            onClick={() => navigate("/admin/whatsapp")}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Configurar</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>
        </div>
      </div>
    </ModernAdminLayout>
  );
};

export default TenantDashboard;
