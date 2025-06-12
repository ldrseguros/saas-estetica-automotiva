import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Users,
  Shield,
  Star,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";
import API from "@/lib/api";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  maxEmployees: number;
  maxClients: number | null;
  isPopular?: boolean;
}

interface CurrentSubscription {
  planId: string;
  status: string;
  planName: string;
}

const PlanosPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await API.get("/admin/subscription-plans");
      setPlans(response.data);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      toast.error("Erro ao carregar planos de assinatura");
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await API.get("/payments/subscription-status");
      setCurrentSubscription(response.data);
    } catch (error) {
      console.error("Erro ao buscar assinatura atual:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const tenantId = "current"; // Will be determined by the backend
      const successUrl = `${window.location.origin}/admin/assinatura?success=true`;
      const cancelUrl = `${window.location.origin}/admin/planos?canceled=true`;

      const response = await API.post("/payments/create-checkout-session", {
        planId,
        tenantId,
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Erro ao iniciar upgrade:", error);
      toast.error("Erro ao processar upgrade. Tente novamente.");
      setUpgrading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "básico":
        return Users;
      case "profissional":
        return Zap;
      case "premium":
        return Star;
      default:
        return Shield;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Planos de Assinatura
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio. Upgrade ou downgrade a
            qualquer momento.
          </p>
          {currentSubscription && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              <Check className="h-4 w-4 mr-1" />
              Plano atual: {currentSubscription.planName}
            </div>
          )}
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(plan.name);
            const isCurrent = isCurrentPlan(plan.id);
            const isPopular =
              plan.isPopular || plan.name.toLowerCase() === "profissional";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`relative ${isPopular ? "transform scale-105" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}

                <ModernCard
                  title={plan.name}
                  className={`h-full ${
                    isPopular
                      ? "border-red-500 shadow-lg"
                      : isCurrent
                      ? "border-green-500"
                      : ""
                  }`}
                  hoverable={!isCurrent}
                >
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                          isPopular ? "bg-red-100" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            isPopular ? "text-red-600" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-gray-900">
                          R$ {plan.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-gray-600 ml-1">
                          /{plan.billingCycle === "monthly" ? "mês" : "ano"}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-900">
                        Inclui:
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {plan.maxEmployees}{" "}
                          {plan.maxEmployees === 1
                            ? "funcionário"
                            : "funcionários"}
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {plan.maxClients
                            ? `${plan.maxClients} clientes`
                            : "Clientes ilimitados"}
                        </li>
                        {plan.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      {isCurrent ? (
                        <ModernButton
                          variant="outline"
                          className="w-full"
                          disabled
                          icon={Check}
                        >
                          Plano Atual
                        </ModernButton>
                      ) : (
                        <ModernButton
                          className={`w-full ${
                            isPopular ? "bg-red-600 hover:bg-red-700" : ""
                          }`}
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgrading === plan.id}
                          icon={upgrading === plan.id ? undefined : ArrowRight}
                        >
                          {upgrading === plan.id
                            ? "Processando..."
                            : currentSubscription
                            ? "Fazer Upgrade"
                            : "Assinar Agora"}
                        </ModernButton>
                      )}
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="bg-blue-50 p-6 rounded-lg">
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">
              Gerenciamento Flexível
            </h3>
            <p className="text-blue-700 text-sm">
              Altere seu plano a qualquer momento. Cancele quando quiser, sem
              multas. Todos os pagamentos são processados de forma segura via
              Stripe.
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <ModernButton
            variant="outline"
            onClick={() => navigate("/admin/assinatura")}
          >
            Voltar para Assinatura
          </ModernButton>
        </motion.div>
      </div>
    </ModernAdminLayout>
  );
};

export default PlanosPage;
