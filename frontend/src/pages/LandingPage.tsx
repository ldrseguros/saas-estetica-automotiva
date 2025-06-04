import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
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
          // Usar planos de exemplo caso a API não esteja disponível
          setPlans(examplePlans);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
        // Usar planos de exemplo caso a API não esteja disponível
        setPlans(examplePlans);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transforme sua Estética Automotiva com nossa Plataforma
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Sistema completo para gestão de agendamentos, clientes e serviços.
            Aumente sua eficiência e proporcione uma experiência excepcional aos
            seus clientes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Link to="/cadastro">Comece Agora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-blue-700"
            >
              <a href="#planos">Ver Planos</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funcionalidades Principais
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              <h3 className="text-xl font-semibold mb-2">
                Agendamentos Online
              </h3>
              <p className="text-gray-600">
                Permita que seus clientes agendem serviços diretamente pelo
                sistema, 24 horas por dia, 7 dias por semana.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              <h3 className="text-xl font-semibold mb-2">
                Comunicação via WhatsApp
              </h3>
              <p className="text-gray-600">
                Envie lembretes automáticos de agendamentos e mantenha seus
                clientes informados sobre os serviços.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              <h3 className="text-xl font-semibold mb-2">
                Relatórios e Análises
              </h3>
              <p className="text-gray-600">
                Acompanhe o desempenho do seu negócio com relatórios detalhados
                e métricas importantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Planos e Preços
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho do seu negócio. Todos os planos
            incluem suporte e atualizações gratuitas.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando planos...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`flex flex-col ${
                    plan.name === "Profissional"
                      ? "border-blue-500 border-2 relative"
                      : ""
                  }`}
                >
                  {plan.name === "Profissional" && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500">
                        /{plan.billingCycle === "monthly" ? "mês" : "ano"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Até {plan.maxEmployees} funcionários</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>
                          {plan.maxClients === null
                            ? "Clientes ilimitados"
                            : `Até ${plan.maxClients} clientes`}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link to={`/cadastro?plano=${plan.id}`}>
                        Assinar Agora
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que Nossos Clientes Dizem
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-bold">JC</span>
                </div>
                <div>
                  <h4 className="font-semibold">João Carlos</h4>
                  <p className="text-gray-500 text-sm">Estética Premium</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Desde que começamos a usar este sistema, nosso número de
                agendamentos aumentou em 30%. Os clientes adoram a facilidade de
                marcar pelo WhatsApp!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-bold">AR</span>
                </div>
                <div>
                  <h4 className="font-semibold">Ana Ribeiro</h4>
                  <p className="text-gray-500 text-sm">Estética VIP</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "O painel administrativo é muito intuitivo e nos ajudou a
                organizar melhor nossos serviços. O suporte ao cliente é
                excelente!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-bold">MP</span>
                </div>
                <div>
                  <h4 className="font-semibold">Marcos Pereira</h4>
                  <p className="text-gray-500 text-sm">
                    Estética Automotiva Elite
                  </p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Conseguimos reduzir nossa taxa de no-shows em quase 40% com os
                lembretes automáticos por WhatsApp. Excelente ferramenta!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de estéticas automotivas que já estão usando
            nossa plataforma para crescer e melhorar a experiência de seus
            clientes.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50"
          >
            <Link to="/cadastro">Comece seu Período de Teste Grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                Estética Automotiva SaaS
              </h3>
              <p className="text-gray-400">
                A melhor plataforma para gerenciamento de estéticas automotivas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Início
                  </Link>
                </li>
                <li>
                  <a href="#planos" className="text-gray-400 hover:text-white">
                    Planos
                  </a>
                </li>
                <li>
                  <Link
                    to="/cadastro"
                    className="text-gray-400 hover:text-white"
                  >
                    Cadastro
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Suporte
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Documentação
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">
                  contato@esteticaautomotiva.com.br
                </li>
                <li className="text-gray-400">(11) 99999-9999</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
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
    price: 99.9,
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
    price: 199.9,
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
    price: 299.9,
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
