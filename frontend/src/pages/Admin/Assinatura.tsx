import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Settings,
  Crown,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Star,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";
import { paymentAPI } from "@/lib/api";

interface SubscriptionStatus {
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIAL";
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: "monthly" | "yearly";
    features: string[];
    maxEmployees: number;
    maxClients: number | null;
  } | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: "PAID" | "PENDING" | "FAILED";
  description: string;
}

interface PaymentRecord {
  id: string;
  paymentDate: string;
  amount: number;
  status: "completed" | "failed" | "pending";
  paymentMethod: string;
  planName?: string;
  billingCycle?: string;
}

interface PlanLimits {
  employees: {
    current: number;
    limit: number;
    canAdd: boolean;
  };
  clients: {
    current: number;
    limit: number | null;
    canAdd: boolean;
  };
}

const SubscriptionStatusPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subscriptionResponse, limitsResponse, paymentHistoryResponse] =
        await Promise.all([
          paymentAPI.getSubscriptionStatus(),
          paymentAPI.getPlanLimits(),
          paymentAPI.getPaymentHistory({ limit: 10 }), // Buscar últimos 10 pagamentos
        ]);

      setSubscription(subscriptionResponse);
      setPlanLimits(limitsResponse);

      // Transformar dados do histórico de pagamentos para o formato esperado
      const payments = paymentHistoryResponse.payments.map(
        (payment: PaymentRecord) => ({
          id: payment.id,
          date: payment.paymentDate,
          amount: payment.amount,
          status:
            payment.status === "completed"
              ? "PAID"
              : payment.status === "failed"
              ? "FAILED"
              : "PENDING",
          description: `${payment.planName || "Assinatura"} ${
            payment.billingCycle === "monthly" ? "Mensal" : "Anual"
          } ${
            payment.paymentMethod === "credit_card" ? "- Cartão de Crédito" : ""
          }`,
        })
      );

      setPaymentHistory(payments);
    } catch (err: unknown) {
      console.error("Erro ao carregar dados da assinatura:", err);

      // Se for erro de histórico de pagamentos vazio, não é um erro fatal
      const error = err as { response?: { status?: number }; message?: string };
      if (
        error.response?.status === 404 ||
        error.message?.includes("histórico")
      ) {
        setPaymentHistory([]);
        // Ainda tentar carregar as outras informações
        try {
          const [subscriptionResponse, limitsResponse] = await Promise.all([
            paymentAPI.getSubscriptionStatus(),
            paymentAPI.getPlanLimits(),
          ]);

          setSubscription(subscriptionResponse);
          setPlanLimits(limitsResponse);
        } catch (innerErr) {
          setError("Não foi possível carregar as informações da assinatura");
        }
      } else {
        setError("Não foi possível carregar as informações da assinatura");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSubscriptionData();
    setRefreshing(false);
    toast.success("Dados atualizados com sucesso!");
  };

  const handleOpenCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const returnUrl = `${window.location.origin}/admin/assinatura`;
      const data = await paymentAPI.createCustomerPortal(returnUrl);

      if (data.error === "portal_not_configured") {
        toast.error("Portal de Gerenciamento Indisponível", {
          description:
            data.details ||
            "O sistema está sendo configurado. Tente novamente em alguns minutos.",
          duration: 8000,
        });
        setLoadingPortal(false);
        return;
      }

      // Se chegou aqui, o portal foi criado com sucesso
      window.location.href = data.url;
    } catch (err) {
      console.error("Erro ao abrir portal de gerenciamento:", err);

      // Tratamento mais específico de erros
      const errorMessage = err.response?.data?.message || err.message;

      if (
        errorMessage.includes("portal") ||
        errorMessage.includes("configuration")
      ) {
        toast.error("Portal Temporariamente Indisponível", {
          description:
            "O sistema de gerenciamento está sendo configurado. Tente novamente em alguns minutos.",
          duration: 8000,
        });
      } else {
        toast.error("Erro ao Acessar Portal", {
          description:
            "Não foi possível acessar o portal de gerenciamento. Tente novamente.",
          duration: 5000,
        });
      }

      setLoadingPortal(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/admin/planos");
  };

  const getStatusInfo = () => {
    if (!subscription) return null;

    const statusMap = {
      ACTIVE: {
        label: "Ativa",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        gradient: "from-green-500 to-green-600",
      },
      TRIAL: {
        label: "Período de Teste",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        gradient: "from-blue-500 to-blue-600",
      },
      PAST_DUE: {
        label: "Pagamento Pendente",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
        gradient: "from-yellow-500 to-orange-500",
      },
      CANCELED: {
        label: "Cancelada",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
        gradient: "from-red-500 to-red-600",
      },
    };

    return (
      statusMap[subscription.status] || {
        label: subscription.status,
        color: "bg-gray-100 text-gray-800",
        icon: Settings,
        gradient: "from-gray-500 to-gray-600",
      }
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Indefinido";
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const renderPlanFeatures = () => {
    if (!subscription?.plan?.features) return null;

    return (
      <div className="space-y-3">
        {subscription.plan.features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="h-5 w-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
            <span className="text-gray-700">{feature}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPaymentHistory = () => {
    return (
      <div className="space-y-3">
        {paymentHistory.slice(0, 5).map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  payment.status === "PAID"
                    ? "bg-green-500"
                    : payment.status === "PENDING"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {formatDate(payment.date)}
                </p>
                <p className="text-xs text-gray-500">{payment.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 text-sm">
                {formatCurrency(payment.amount)}
              </p>
              <p
                className={`text-xs ${
                  payment.status === "PAID"
                    ? "text-green-600"
                    : payment.status === "PENDING"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {payment.status === "PAID"
                  ? "Pago"
                  : payment.status === "PENDING"
                  ? "Pendente"
                  : "Falhou"}
              </p>
            </div>
          </div>
        ))}
        {paymentHistory.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Nenhum pagamento encontrado
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
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
              Erro ao Carregar Assinatura
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <ModernButton
              onClick={refreshData}
              icon={RefreshCw}
              variant="outline"
            >
              Tentar Novamente
            </ModernButton>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <ModernAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
            <p className="mt-2 text-gray-600">
              Gerencie seu plano e pagamentos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            <ModernButton
              variant="outline"
              onClick={refreshData}
              disabled={refreshing}
              icon={RefreshCw}
              className={refreshing ? "animate-spin" : ""}
            >
              {refreshing ? "Atualizando..." : "Atualizar"}
            </ModernButton>
            <ModernButton
              onClick={handleOpenCustomerPortal}
              disabled={loadingPortal}
              icon={ExternalLink}
            >
              {loadingPortal ? "Abrindo..." : "Portal de Pagamento"}
            </ModernButton>
            <ModernButton
              onClick={handleUpgrade}
              icon={Zap}
              className="bg-red-600 hover:bg-red-700"
            >
              Fazer Upgrade
            </ModernButton>
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Status"
            value={statusInfo?.label || "Carregando..."}
            icon={statusInfo?.icon || Settings}
            gradient={statusInfo?.gradient || "from-gray-500 to-gray-600"}
          />
          <StatCard
            title="Plano Atual"
            value={subscription?.plan?.name || "Não definido"}
            icon={Crown}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Valor Mensal"
            value={
              subscription?.plan
                ? formatCurrency(subscription.plan.price)
                : "R$ 0,00"
            }
            icon={DollarSign}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Renovação"
            value={
              subscription?.subscriptionEndsAt
                ? formatDate(subscription.subscriptionEndsAt)
                : "Indefinido"
            }
            icon={CalendarIcon}
            gradient="from-blue-500 to-blue-600"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan */}
          <ModernCard
            title="Detalhes do Plano"
            description="Seu plano atual e recursos inclusos"
            icon={Star}
            hoverable={false}
          >
            <div className="space-y-6">
              {subscription?.plan && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {subscription.plan.name}
                      </h3>
                      <p className="text-red-100">
                        {formatCurrency(subscription.plan.price)}/
                        {subscription.plan.billingCycle === "monthly"
                          ? "mês"
                          : "ano"}
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-red-200" />
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Recursos Inclusos
                </h4>
                {renderPlanFeatures()}
              </div>

              {/* Limites do Plano */}
              {planLimits && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Uso Atual
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Funcionários</span>
                      <span className="font-medium">
                        {planLimits.employees.current} /{" "}
                        {planLimits.employees.limit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Clientes</span>
                      <span className="font-medium">
                        {planLimits.clients.current} /{" "}
                        {planLimits.clients.limit || "∞"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModernCard>

          {/* Billing History */}
          <ModernCard
            title="Histórico de Pagamentos"
            description="Últimas transações"
            icon={CreditCard}
            hoverable={false}
          >
            {renderPaymentHistory()}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <ModernButton
                variant="outline"
                onClick={handleOpenCustomerPortal}
                disabled={loadingPortal}
                className="w-full"
                icon={ExternalLink}
              >
                Ver Todos os Pagamentos
              </ModernButton>
            </div>
          </ModernCard>
        </div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <ModernCard
            title="Alterar Plano"
            description="Faça upgrade ou downgrade"
            icon={Zap}
            hoverable
          >
            <ModernButton
              onClick={handleUpgrade}
              className="w-full"
              icon={ArrowUpRight}
            >
              Ver opções
            </ModernButton>
          </ModernCard>

          <ModernCard
            title="Atualizar Pagamento"
            description="Alterar cartão de crédito"
            icon={CreditCard}
            hoverable
          >
            <ModernButton
              onClick={handleOpenCustomerPortal}
              disabled={loadingPortal}
              variant="outline"
              className="w-full"
              icon={ExternalLink}
            >
              Portal de pagamento
            </ModernButton>
          </ModernCard>

          <ModernCard
            title="Suporte"
            description="Precisa de ajuda?"
            icon={Shield}
            hoverable
          >
            <ModernButton
              onClick={() =>
                window.open("mailto:suporte@saasestetica.com", "_blank")
              }
              variant="outline"
              className="w-full"
              icon={ExternalLink}
            >
              Entrar em contato
            </ModernButton>
          </ModernCard>
        </motion.div>
      </div>
    </ModernAdminLayout>
  );
};

export default SubscriptionStatusPage;
