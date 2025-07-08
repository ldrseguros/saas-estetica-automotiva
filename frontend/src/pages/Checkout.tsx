import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";

// Inicializar Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "dummy_key"
);

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    plan: string;
    price: number;
    billingCycle: string;
  } | null>(null);

  const sessionId = searchParams.get("session");

  // Carrega a sessão de checkout
  useEffect(() => {
    const loadCheckoutSession = async () => {
      if (!sessionId) {
        setError("Sessão de checkout não encontrada");
        setLoading(false);
        return;
      }

      try {
        // Recuperar informações da sessão (simulado para desenvolvimento)
        // Em produção, isso viria da API

        // Versão simulada para desenvolvimento:
        setTimeout(() => {
          setSessionInfo({
            plan: "Profissional",
            price: 46.99,
            billingCycle: "monthly",
          });
          setLoading(false);
        }, 1000);

        // Versão de produção:
        /*
        const response = await fetch(`/api/payments/checkout-session/${sessionId}`);
        if (!response.ok) {
          throw new Error("Erro ao carregar sessão de checkout");
        }
        const data = await response.json();
        setSessionInfo({
          plan: data.plan.name,
          price: data.amount,
          billingCycle: data.billingCycle,
        });
        */
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
        setError(
          "Não foi possível carregar os detalhes do pagamento. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutSession();
  }, [sessionId]);

  // Inicia o checkout Stripe
  const handleCheckout = async () => {
    if (!sessionId) return;

    setLoading(true);

    try {
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Não foi possível carregar o Stripe");
      }

      // Redirecionar para o Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      console.error("Erro ao iniciar checkout:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar pagamento";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Redireciona para o login (pular pagamento em desenvolvimento)
  const handleSkipPayment = () => {
    navigate("/login?registered=true");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Finalizar Assinatura
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Resumo da Assinatura</CardTitle>
              <CardDescription>
                Revise os detalhes antes de confirmar o pagamento
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/cadastro")}
                  >
                    Voltar para o Cadastro
                  </Button>
                </div>
              ) : sessionInfo ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">
                      Plano Selecionado
                    </h3>
                    <p className="text-xl font-bold mt-1">{sessionInfo.plan}</p>

                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900">Valor</h3>
                      <p className="text-xl font-bold mt-1">
                        R$ {sessionInfo.price.toFixed(2)}/
                        {sessionInfo.billingCycle === "monthly" ? "mês" : "ano"}
                      </p>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      <p>
                        Primeira cobrança após o período de trial de 15 dias
                      </p>
                      <p className="mt-1">
                        Cancele a qualquer momento sem taxas adicionais
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Método de Pagamento</h3>
                    <p className="text-sm text-gray-600">
                      Você será redirecionado para uma página segura para
                      concluir o pagamento.
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <img
                        src="https://placehold.co/40x25/ffffff/000000?text=VISA"
                        alt="Visa"
                        className="h-6"
                      />
                      <img
                        src="https://placehold.co/40x25/ffffff/000000?text=MC"
                        alt="Mastercard"
                        className="h-6"
                      />
                      <img
                        src="https://placehold.co/40x25/ffffff/000000?text=AMEX"
                        alt="American Express"
                        className="h-6"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              {!loading && !error && sessionInfo && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? "Processando..." : "Continuar para Pagamento"}
                  </Button>

                  {/* Botão apenas para ambiente de desenvolvimento */}
                  {import.meta.env.DEV && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleSkipPayment}
                    >
                      Pular Pagamento (Apenas DEV)
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Dúvidas? Entre em contato com{" "}
              <a
                href="mailto:suporte@esteticaautomotiva.com.br"
                className="text-blue-600 hover:underline"
              >
                suporte@esteticaautomotiva.com.br
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
