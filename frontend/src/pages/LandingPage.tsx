import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Star, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  maxEmployees: number;
  maxClients: number | null;
}

const LandingPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/public/plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          console.error("Erro ao carregar planos");
          setPlans(examplePlans);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
        setPlans(examplePlans);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section - Mais suave e elegante */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 overflow-hidden">
        {/* Elemento decorativo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Plataforma #1 em Gestão Automotiva
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transforme sua{" "}
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Estética Automotiva
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Sistema completo para gestão de agendamentos, clientes e serviços.
              Aumente sua eficiência e proporcione uma experiência excepcional.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-red-600/25 transition-all duration-300"
              >
                <Link to="/cadastro">
                  Comece Gratuitamente
                  <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-gray-400 text-gray-300 hover:bg-white hover:text-slate-900 px-8 py-4 text-lg transition-all duration-300"
              >
                <a href="#planos">Ver Planos</a>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">500+ Estéticas</span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">4.9/5 Avaliação</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mais clean e espaçoso */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua estética automotiva de
              forma profissional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:from-red-50 group-hover:to-red-100 group-hover:text-red-600 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                Agendamentos Online
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Permita que seus clientes agendem serviços diretamente pelo
                sistema, 24 horas por dia, 7 dias por semana, com confirmação
                automática.
              </p>
            </div>

            <div className="group text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:from-red-50 group-hover:to-red-100 group-hover:text-red-600 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                WhatsApp Automático
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Envie lembretes automáticos de agendamentos e mantenha seus
                clientes sempre informados sobre os serviços de forma
                profissional.
              </p>
            </div>

            <div className="group text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:from-red-50 group-hover:to-red-100 group-hover:text-red-600 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                Relatórios Inteligentes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe o crescimento do seu negócio com relatórios
                detalhados, métricas de performance e insights valiosos para
                tomar decisões.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Mais elegante */}
      <section id="planos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos e Preços
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho do seu negócio. Todos incluem
              suporte e atualizações gratuitas.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando planos...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`flex flex-col relative transition-all duration-300 hover:shadow-xl ${
                    plan.name === "Profissional"
                      ? "border-red-500 border-2 shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {plan.name === "Profissional" && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                      ⭐ Mais Popular
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-white/80">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-white/80 text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-white/80">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-white/80 text-lg">
                        /{plan.billingCycle === "monthly" ? "mês" : "ano"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow px-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-white/60">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-white/60">
                          Até {plan.maxEmployees} funcionários
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-white/60">
                          {plan.maxClients === null
                            ? "Clientes ilimitados"
                            : `Até ${plan.maxClients} clientes`}
                        </span>
                      </li>
                    </ul>
                  </CardContent>

                  <CardFooter className="px-6 pb-6">
                    <Button
                      className={`w-full py-3 text-lg font-medium transition-all duration-300 ${
                        plan.name === "Profissional"
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                      asChild
                    >
                      <Link to={`/cadastro?plano=${plan.id}`}>
                        Começar Agora
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section - Mais suave */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de quem transformou seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="font-bold text-lg">JC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">João Carlos</h4>
                  <p className="text-gray-600 text-sm">Estética Premium</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic leading-relaxed">
                "Desde que começamos a usar este sistema, nosso número de
                agendamentos aumentou em 30%. Os clientes adoram a facilidade de
                marcar pelo WhatsApp!"
              </blockquote>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="font-bold text-lg">AR</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ana Ribeiro</h4>
                  <p className="text-gray-600 text-sm">Estética VIP</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic leading-relaxed">
                "O painel administrativo é muito intuitivo e nos ajudou a
                organizar melhor nossos serviços. O suporte ao cliente é
                excelente!"
              </blockquote>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="font-bold text-lg">MP</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Marcos Pereira
                  </h4>
                  <p className="text-gray-600 text-sm">Estética Elite</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic leading-relaxed">
                "Conseguimos reduzir nossa taxa de no-shows em quase 40% com os
                lembretes automáticos. Excelente ferramenta!"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mais sofisticado */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para{" "}
            <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              transformar
            </span>{" "}
            seu negócio?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de estéticas automotivas que já estão usando
            nossa plataforma para crescer e melhorar a experiência de seus
            clientes.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 text-xl font-medium shadow-2xl hover:shadow-red-600/25 transition-all duration-300"
          >
            <Link to="/cadastro">
              Comece seu Teste Grátis
              <Zap className="ml-2 h-6 w-6" />
            </Link>
          </Button>
          <p className="mt-4 text-gray-400 text-sm">
            ✨ Sem cartão de crédito • 30 dias grátis • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer - Mais clean */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                Estética Automotiva SaaS
              </h3>
              <p className="text-gray-400 leading-relaxed">
                A melhor plataforma para gerenciamento de estéticas automotivas.
                Simples, poderosa e eficiente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Início
                  </Link>
                </li>
                <li>
                  <a
                    href="#planos"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Planos
                  </a>
                </li>
                <li>
                  <Link
                    to="/cadastro"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cadastro
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Suporte
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentação
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="text-gray-400">
                  contato@esteticaautomotiva.com.br
                </li>
                <li className="text-gray-400">(11) 99999-9999</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Estética Automotiva SaaS. Todos
              os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Planos de exemplo para desenvolvimento
const examplePlans: Plan[] = [
  {
    id: "1",
    name: "Básico",
    description: "Ideal para estéticas pequenas que estão começando",
    price: 36.99,
    billingCycle: "monthly",
    features: [
      "Agendamentos online",
      "Gerenciamento de clientes",
      "Lembretes por WhatsApp",
      "Painel administrativo",
    ],
    maxEmployees: 2,
    maxClients: 100,
  },
  {
    id: "2",
    name: "Profissional",
    description: "Perfeito para estéticas em crescimento",
    price: 46.99,
    billingCycle: "monthly",
    features: [
      "Todas as funcionalidades do plano Básico",
      "Relatórios avançados",
      "Múltiplos serviços",
      "Personalização da página de agendamento",
    ],
    maxEmployees: 5,
    maxClients: 500,
  },
  {
    id: "3",
    name: "Premium",
    description: "Para estéticas de grande porte com alto volume",
    price: 56.99,
    billingCycle: "monthly",
    features: [
      "Todas as funcionalidades do plano Profissional",
      "API para integração com outros sistemas",
      "Suporte prioritário",
      "Recursos de marketing",
    ],
    maxEmployees: 10,
    maxClients: null,
  },
];

export default LandingPage;
