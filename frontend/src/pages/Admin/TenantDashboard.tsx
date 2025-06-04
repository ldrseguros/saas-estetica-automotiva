import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  CalendarIcon,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Car,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";
import { paymentAPI } from "@/lib/api";
import { toast } from "sonner";

interface DashboardData {
  stats: {
    totalAppointments: number;
    appointmentsToday: number;
    appointmentsWeek: number;
    totalClients: number;
    totalServices: number;
    revenue: {
      today: number;
      week: number;
      month: number;
      total: number;
    };
  };
  subscriptionStatus: {
    status: string;
    plan: {
      name: string;
      price: number;
    } | null;
    expiresAt: string | null;
  };
  upcomingAppointments: Array<{
    id: string;
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
    status: string;
  }>;
}

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Em produção, buscar dados reais da API
        /*
        const response = await api.get("/admin/dashboard");
        setDashboardData(response.data);
        */

        // Para desenvolvimento, usar dados simulados
        setTimeout(() => {
          setDashboardData({
            stats: {
              totalAppointments: 156,
              appointmentsToday: 8,
              appointmentsWeek: 42,
              totalClients: 87,
              totalServices: 12,
              revenue: {
                today: 950,
                week: 4850,
                month: 15200,
                total: 48700,
              },
            },
            subscriptionStatus: {
              status: "ACTIVE",
              plan: {
                name: "Profissional",
                price: 199.9,
              },
              expiresAt: "2023-12-31T23:59:59Z",
            },
            upcomingAppointments: [
              {
                id: "1",
                clientName: "João Silva",
                serviceName: "Lavagem Completa",
                date: "2023-06-04",
                time: "10:00",
                status: "confirmed",
              },
              {
                id: "2",
                clientName: "Maria Oliveira",
                serviceName: "Polimento",
                date: "2023-06-04",
                time: "14:30",
                status: "confirmed",
              },
              {
                id: "3",
                clientName: "Carlos Pereira",
                serviceName: "Higienização Interna",
                date: "2023-06-05",
                time: "09:00",
                status: "pending",
              },
              {
                id: "4",
                clientName: "Ana Souza",
                serviceName: "Cristalização",
                date: "2023-06-05",
                time: "15:00",
                status: "confirmed",
              },
            ],
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast.error("Não foi possível carregar os dados do dashboard");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Verificar status da assinatura
  const checkSubscriptionStatus = () => {
    if (!dashboardData?.subscriptionStatus) return null;

    const { status } = dashboardData.subscriptionStatus;

    if (status === "TRIAL") {
      return (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <CalendarIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle>Período de Teste Ativo</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>
              Você está usando o período de teste gratuito. Aproveite todas as
              funcionalidades!
            </span>
            <Button
              size="sm"
              variant="outline"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin/assinatura")}
            >
              Ver Detalhes
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (status === "PAST_DUE") {
      return (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Pagamento Pendente</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>
              Sua assinatura está com pagamento pendente. Atualize os dados de
              pagamento.
            </span>
            <Button size="sm" onClick={() => navigate("/admin/assinatura")}>
              Regularizar Agora
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  // Renderizar loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderizar erro se não há dados
  if (!dashboardData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados do dashboard. Tente novamente
            mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate("/agendar-servico")} className="gap-2">
          <Calendar className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Alerta de Status da Assinatura */}
      {checkSubscriptionStatus()}

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Agendamentos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {dashboardData.stats.appointmentsToday}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {dashboardData.stats.totalClients}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Faturamento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">
                    R${" "}
                    {dashboardData.stats.revenue.month.toLocaleString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {dashboardData.stats.totalServices}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos e Resumos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Resumo de Desempenho</CardTitle>
                <CardDescription>
                  Desempenho dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">
                          Agendamentos
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold mr-2">
                          {dashboardData.stats.appointmentsWeek}
                        </span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          12%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium">
                          Novos Clientes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold mr-2">24</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          8%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm font-medium">Faturamento</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold mr-2">
                          R${" "}
                          {dashboardData.stats.revenue.week.toLocaleString(
                            "pt-BR"
                          )}
                        </span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          15%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-amber-500 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/admin/relatorios")}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Ver Relatórios Completos
                </Button>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">
                    Próximos Agendamentos
                  </CardTitle>
                  <CardDescription>
                    Agendamentos para os próximos dias
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/agendamentos")}
                >
                  Ver Todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments
                    .slice(0, 4)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">
                            {appointment.clientName}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString(
                                "pt-BR"
                              )}{" "}
                              às {appointment.time}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.serviceName}
                          </p>
                        </div>
                        <Badge
                          className={`${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status === "confirmed"
                            ? "Confirmado"
                            : appointment.status === "pending"
                            ? "Pendente"
                            : "Cancelado"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => navigate("/agendar-servico")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Agendamentos */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Recentes</CardTitle>
              <CardDescription>
                Visualize e gerencie os agendamentos dos últimos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-start md:items-center flex-col md:flex-row md:gap-4">
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.serviceName}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          às {appointment.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Badge
                        className={`${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status === "confirmed"
                          ? "Confirmado"
                          : appointment.status === "pending"
                          ? "Pendente"
                          : "Cancelado"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Agendamentos Anteriores</Button>
              <Button onClick={() => navigate("/admin/agendamentos")}>
                Gerenciar Agendamentos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantDashboard;
