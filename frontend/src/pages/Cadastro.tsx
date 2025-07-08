import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Interface para os planos de assinatura
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
}

// Schema de validação para o cadastro
const cadastroSchema = z
  .object({
    // Informações da Empresa
    name: z.string().min(3, { message: "Nome da empresa é obrigatório" }),
    subdomain: z
      .string()
      .min(3, { message: "Subdomínio precisa ter pelo menos 3 caracteres" })
      .max(63, { message: "Subdomínio pode ter no máximo 63 caracteres" })
      .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, {
        message:
          "Subdomínio deve conter apenas letras minúsculas, números e hífens",
      }),
    contactEmail: z.string().email({ message: "Email inválido" }),
    contactPhone: z.string().min(10, { message: "Telefone inválido" }),

    // Informações do Administrador
    adminName: z
      .string()
      .min(3, { message: "Nome do administrador é obrigatório" }),
    adminEmail: z.string().email({ message: "Email inválido" }),
    adminPassword: z
      .string()
      .min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
      .regex(/[A-Z]/, {
        message: "Senha deve conter pelo menos uma letra maiúscula",
      })
      .regex(/[a-z]/, {
        message: "Senha deve conter pelo menos uma letra minúscula",
      })
      .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" }),
    confirmPassword: z.string(),

    // Endereço
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),

    // Plano escolhido
    planId: z.string().min(1, { message: "Escolha um plano" }),

    // Termos e condições
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Você precisa aceitar os termos de uso",
    }),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type CadastroFormValues = z.infer<typeof cadastroSchema>;

const Cadastro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"empresa" | "admin" | "plano">(
    "empresa"
  );
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null
  );
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  // Inicializar o formulário
  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      name: "",
      subdomain: "",
      contactEmail: "",
      contactPhone: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      confirmPassword: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      planId: searchParams.get("plano") || "",
      acceptTerms: false,
    },
  });

  // Observar o campo de subdomínio para verificar disponibilidade
  const watchSubdomain = form.watch("subdomain");

  // Função para verificar disponibilidade do subdomínio
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) return;

    setCheckingSubdomain(true);
    try {
      const response = await fetch(`/api/public/check-subdomain/${subdomain}`);
      const data = await response.json();
      setSubdomainAvailable(data.available);
    } catch (error) {
      console.error("Erro ao verificar subdomínio:", error);
      setSubdomainAvailable(false);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  // Verificar disponibilidade do subdomínio quando o usuário parar de digitar
  useEffect(() => {
    const handler = setTimeout(() => {
      if (watchSubdomain && watchSubdomain.length >= 3) {
        checkSubdomainAvailability(watchSubdomain);
      } else {
        setSubdomainAvailable(null);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [watchSubdomain]);

  // Carregar planos ao montar o componente
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/public/plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          console.error("Erro ao carregar planos");
          // Planos de exemplo para desenvolvimento
          setPlans([
            {
              id: "1",
              name: "Básico",
              description: "Ideal para estéticas pequenas",
              price: 36.99,
              billingCycle: "monthly",
            },
            {
              id: "2",
              name: "Profissional",
              description: "Para estéticas em crescimento",
              price: 46.99,
              billingCycle: "monthly",
            },
            {
              id: "3",
              name: "Premium",
              description: "Recursos avançados e suporte prioritário",
              price: 56.99,
              billingCycle: "monthly",
            },
          ]);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };

    fetchPlans();
  }, []);

  const onSubmit = async (data: CadastroFormValues) => {
    setIsLoading(true);

    try {
      // Enviar dados para API
      const response = await fetch("/api/public/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Dados da empresa
          name: data.name,
          subdomain: data.subdomain,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,

          // Dados do administrador
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          adminPassword: data.adminPassword,

          // Plano escolhido
          planId: data.planId,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        toast.success("Cadastro realizado com sucesso!");

        // Redirecionar para a página de pagamento ou dashboard
        if (result.requiresPayment) {
          navigate(`/checkout?session=${result.sessionId}`);
        } else {
          // Período de trial, redirecionar para o dashboard
          navigate(`/login?email=${data.adminEmail}&registered=true`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error(
        "Ocorreu um erro ao processar seu cadastro. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Cadastre sua Estética Automotiva
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Preencha o formulário abaixo para começar a usar nossa plataforma
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Nova Estética</CardTitle>
              <CardDescription>
                Complete todos os campos para criar sua conta e começar seu
                período de teste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <Tabs
                    value={currentStep}
                    onValueChange={(value) =>
                      setCurrentStep(value as "empresa" | "admin" | "plano")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="empresa">Empresa</TabsTrigger>
                      <TabsTrigger value="admin">Administrador</TabsTrigger>
                      <TabsTrigger value="plano">Plano</TabsTrigger>
                    </TabsList>

                    {/* Step 1: Informações da Empresa */}
                    <TabsContent value="empresa" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Estética</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome da sua estética automotiva"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subdomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subdomínio</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="seu-subdominio"
                                  {...field}
                                  className={`pr-28 ${
                                    subdomainAvailable === true
                                      ? "border-green-500"
                                      : subdomainAvailable === false
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-sm text-gray-500">
                                    .seudominio.com.br
                                  </span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {checkingSubdomain ? (
                                <span className="text-gray-500">
                                  Verificando disponibilidade...
                                </span>
                              ) : subdomainAvailable === true ? (
                                <span className="text-green-600">
                                  Subdomínio disponível ✓
                                </span>
                              ) : subdomainAvailable === false ? (
                                <span className="text-red-600">
                                  Subdomínio já está em uso
                                </span>
                              ) : (
                                "Escolha um subdomínio único para sua estética"
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email de Contato</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="contato@suaestetica.com.br"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone de Contato</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(00) 00000-0000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Rua, número, complemento"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Cidade" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input placeholder="Estado" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem className="md:col-span-1 col-span-2">
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input placeholder="00000-000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => setCurrentStep("admin")}
                      >
                        Próximo: Informações do Administrador
                      </Button>
                    </TabsContent>

                    {/* Step 2: Informações do Administrador */}
                    <TabsContent value="admin" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="adminName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Administrador</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email do Administrador</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="admin@suaestetica.com.br"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Este será o email usado para acessar o sistema
                              como administrador
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="adminPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Senha"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Mínimo 8 caracteres, com letra maiúscula e
                                número
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirme a senha"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep("empresa")}
                        >
                          Voltar
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() => setCurrentStep("plano")}
                        >
                          Próximo: Escolha do Plano
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Step 3: Escolha do Plano */}
                    <TabsContent value="plano" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="planId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selecione um Plano</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name} - R$ {plan.price.toFixed(2)}/
                                    {plan.billingCycle === "monthly"
                                      ? "mês"
                                      : "ano"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Todos os planos incluem um período de teste
                              gratuito de 15 dias
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2 text-black">
                          Detalhes do Plano Selecionado
                        </h3>
                        {form.watch("planId") ? (
                          <div>
                            {plans
                              .filter((p) => p.id === form.watch("planId"))
                              .map((plan) => (
                                <div key={plan.id}>
                                  <p className="font-semibold text-black/80">
                                    {plan.name}
                                  </p>
                                  <p className="text-gray-600">
                                    {plan.description}
                                  </p>
                                  <p className="text-lg font-bold mt-2 text-green-600/90">
                                    R$ {plan.price.toFixed(2)}/
                                    {plan.billingCycle === "monthly"
                                      ? "mês"
                                      : "ano"}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            Selecione um plano para ver os detalhes
                          </p>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Eu aceito os{" "}
                                <a
                                  href="/termos"
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                >
                                  termos de uso
                                </a>{" "}
                                e{" "}
                                <a
                                  href="/privacidade"
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                >
                                  política de privacidade
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col md:flex-row gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep("admin")}
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          {isLoading ? "Processando..." : "Concluir Cadastro"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-gray-500 text-center">
                Já possui uma conta?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Faça login
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
