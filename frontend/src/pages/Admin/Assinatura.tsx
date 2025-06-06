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
    name: string;
    price: number;
    billingCycle: "monthly" | "yearly";
  } | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

const SubscriptionStatusPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Simulating subscription data
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        // Buscar dados reais da API
        const response = await paymentAPI.getSubscriptionStatus();
        setSubscription(response);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar status da assinatura:", err);
        setError("Não foi possível carregar as informações da assinatura");
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleOpenCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const returnUrl = `${window.location.origin}/admin/assinatura`;
      const data = await paymentAPI.createCustomerPortal(returnUrl);
      window.location.href = data.url;
    } catch (err) {
      console.error("Erro ao abrir portal de gerenciamento:", err);
      toast.error(
        "Não foi possível acessar o portal de gerenciamento de assinatura"
      );
      setLoadingPortal(false);
    }
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
    if (!dateString) return "Não disponível";
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  const renderPlanFeatures = () => {
    const features = [
      "Agendamentos ilimitados",
      "WhatsApp Business integrado",
      "Relatórios avançados",
      "Múltiplos funcionários",
      "Backup automático",
      "Suporte prioritário",
    ];

    return (
      <div className="space-y-3">
        {features.map((feature, index) => (
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
            <p className="text-red-700">{error}</p>
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
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seu plano e pagamentos
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <ModernButton
              variant="outline"
              icon={ExternalLink}
              onClick={handleOpenCustomerPortal}
              loading={loadingPortal}
            >
              Portal de Pagamento
            </ModernButton>
            <ModernButton icon={Crown}>Fazer Upgrade</ModernButton>
          </div>
        </motion.div>

        {/* Status Alert */}
        {subscription?.status === "PAST_DUE" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Pagamento Pendente</h3>
                <p className="text-yellow-100 text-sm">
                  Sua assinatura está com pagamento pendente. Atualize os dados
                  de pagamento para continuar usando.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Status"
            value={statusInfo?.label || "Indefinido"}
            icon={statusInfo?.icon || Settings}
            gradient={statusInfo?.gradient || "from-gray-500 to-gray-600"}
          />
          <StatCard
            title="Plano Atual"
            value={subscription?.plan?.name || "Nenhum"}
            icon={Crown}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Valor Mensal"
            value={
              subscription?.plan
                ? `R$ ${subscription.plan.price.toFixed(2)}`
                : "R$ 0,00"
            }
            icon={DollarSign}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Renovação"
            value={
              subscription?.subscriptionEndsAt ? "31 Dez 2024" : "Indefinido"
            }
            icon={CalendarIcon}
            gradient="from-blue-500 to-blue-600"
          />
        </div>

        {/* Plan Details */}
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
                        R$ {subscription.plan.price.toFixed(2)}/
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
            </div>
          </ModernCard>

          {/* Billing History */}
          <ModernCard
            title="Histórico de Pagamentos"
            description="Últimas transações"
            icon={CreditCard}
            hoverable={false}
          >
            <div className="space-y-3">
              {[
                { date: "2024-06-01", amount: 199.9, status: "Pago" },
                { date: "2024-05-01", amount: 199.9, status: "Pago" },
                { date: "2024-04-01", amount: 199.9, status: "Pago" },
              ].map((payment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(parseISO(payment.date), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{payment.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      R$ {payment.amount.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}

              <ModernButton variant="ghost" className="w-full mt-4">
                Ver Todos os Pagamentos
              </ModernButton>
            </div>
          </ModernCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModernCard
            title="Alterar Plano"
            description="Faça upgrade ou downgrade"
            icon={Zap}
            onClick={() => navigate("/upgrade")}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ver opções</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>

          <ModernCard
            title="Atualizar Pagamento"
            description="Alterar cartão de crédito"
            icon={CreditCard}
            onClick={handleOpenCustomerPortal}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Portal de pagamento</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>

          <ModernCard
            title="Suporte"
            description="Precisa de ajuda?"
            icon={Shield}
            onClick={() => window.open("mailto:suporte@exemplo.com")}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Entrar em contato</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
          </ModernCard>
        </div>
      </div>
    </ModernAdminLayout>
  );
};

export default SubscriptionStatusPage;
