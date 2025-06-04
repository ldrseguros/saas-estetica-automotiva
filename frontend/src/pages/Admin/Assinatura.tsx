import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarIcon,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Settings,
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { paymentAPI } from "@/lib/api";
import { toast } from "sonner";

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

  // Carregar status da assinatura
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const data = await paymentAPI.getSubscriptionStatus();
        setSubscription(data);
      } catch (err) {
        console.error("Erro ao carregar status da assinatura:", err);
        setError("Não foi possível carregar as informações da assinatura");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  // Abrir portal de gerenciamento de assinatura
  const handleOpenCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const returnUrl = `${window.location.origin}/admin/assinatura`;
      const data = await paymentAPI.createCustomerPortal(returnUrl);

      // Redirecionar para o portal do Stripe
      window.location.href = data.url;
    } catch (err) {
      console.error("Erro ao abrir portal de gerenciamento:", err);
      toast.error(
        "Não foi possível acessar o portal de gerenciamento de assinatura"
      );
      setLoadingPortal(false);
    }
  };

  // Formatação e exibição do status da assinatura
  const getStatusBadge = () => {
    if (!subscription) return null;

    const statusMap = {
      ACTIVE: { label: "Ativa", color: "bg-green-100 text-green-800" },
      TRIAL: { label: "Período de Teste", color: "bg-blue-100 text-blue-800" },
      PAST_DUE: {
        label: "Pagamento Pendente",
        color: "bg-yellow-100 text-yellow-800",
      },
      CANCELED: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    };

    const status = statusMap[subscription.status] || {
      label: subscription.status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={`${status.color} px-3 py-1 text-xs font-medium`}>
        {status.label}
      </Badge>
    );
  };

  // Formatar data para exibição
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

  // Renderizar conteúdo baseado no status de carregamento
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : subscription ? (
        <div className="space-y-6">
          {/* Status da Assinatura */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detalhes da Assinatura</CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>
                Informações sobre o seu plano atual e status da assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Plano */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Plano Atual
                  </h3>
                  {subscription.plan ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold">
                          {subscription.plan.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          R$ {subscription.plan.price.toFixed(2)}/
                          {subscription.plan.billingCycle === "monthly"
                            ? "mês"
                            : "ano"}
                        </p>
                      </div>
                      {subscription.status === "ACTIVE" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum plano ativo</p>
                  )}
                </div>

                {/* Datas Importantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Período de Teste */}
                  {subscription.status === "TRIAL" &&
                    subscription.trialEndsAt && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">
                              Período de Teste
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Termina em {formatDate(subscription.trialEndsAt)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {`Restam ${Math.max(
                                0,
                                Math.ceil(
                                  (parseISO(
                                    subscription.trialEndsAt
                                  ).getTime() -
                                    new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )} dias`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Próxima Cobrança */}
                  {subscription.status === "ACTIVE" &&
                    subscription.subscriptionEndsAt && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">
                              Próxima Cobrança
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {formatDate(subscription.subscriptionEndsAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Assinatura Cancelada */}
                  {subscription.status === "CANCELED" &&
                    subscription.subscriptionEndsAt && (
                      <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">
                              Assinatura Cancelada
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Acesso disponível até{" "}
                              {formatDate(subscription.subscriptionEndsAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Pagamento Pendente */}
                  {subscription.status === "PAST_DUE" && (
                    <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">
                            Pagamento Pendente
                          </h4>
                          <p className="text-gray-500 text-sm">
                            Atualize seus dados de pagamento para continuar
                            usando o sistema
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full"
                onClick={handleOpenCustomerPortal}
                disabled={loadingPortal || subscription.status === "TRIAL"}
              >
                {loadingPortal ? (
                  "Carregando..."
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </>
                )}
              </Button>

              {subscription.status === "TRIAL" && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Você poderá gerenciar sua assinatura após o período de teste
                </p>
              )}
            </CardFooter>
          </Card>

          {/* Alertas conforme o status */}
          {subscription.status === "TRIAL" && (
            <Alert className="bg-blue-50 border-blue-200">
              <CalendarIcon className="h-4 w-4 text-blue-500" />
              <AlertTitle>Período de Teste Ativo</AlertTitle>
              <AlertDescription>
                Você está no período de teste gratuito. Após o término, será
                necessário fornecer um método de pagamento para continuar usando
                o sistema.
              </AlertDescription>
            </Alert>
          )}

          {subscription.status === "PAST_DUE" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Pagamento Pendente</AlertTitle>
              <AlertDescription>
                Sua última cobrança não foi processada. Por favor, atualize seus
                dados de pagamento para evitar a suspensão do serviço.
              </AlertDescription>
            </Alert>
          )}

          {subscription.status === "CANCELED" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Assinatura Cancelada</AlertTitle>
              <AlertDescription>
                Sua assinatura foi cancelada e o acesso ao sistema estará
                disponível até {formatDate(subscription.subscriptionEndsAt)}.
                Para continuar usando o sistema após essa data, reative sua
                assinatura.
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sem Assinatura</CardTitle>
            <CardDescription>
              Não foi possível encontrar informações sobre sua assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Entre em contato com o suporte para mais informações
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionStatusPage;
