import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { serviceAPI, bookingAPI } from "@/lib/api";
import { toast } from "sonner";

// Interface para os serviços
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

// Horários disponíveis para agendamento
const AVAILABLE_TIMES = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// Schema de validação para o formulário
const bookingSchema = z.object({
  serviceId: z.string({ required_error: "Selecione um serviço" }),
  date: z.date({ required_error: "Selecione uma data" }),
  time: z.string({ required_error: "Selecione um horário" }),
  name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  notes: z.string().optional(),
  carInfo: z.object({
    model: z.string().min(2, { message: "Modelo do veículo é obrigatório" }),
    plate: z.string().optional(),
    color: z.string().optional(),
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const PublicBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<Record<string, string[]>>({});
  const [step, setStep] = useState<
    "service" | "datetime" | "info" | "confirmation"
  >("service");
  const [success, setSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  // Inicializar o formulário
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: searchParams.get("service") || "",
      date: undefined,
      time: "",
      name: "",
      email: "",
      phone: "",
      notes: "",
      carInfo: {
        model: "",
        plate: "",
        color: "",
      },
    },
  });

  // Observar mudanças na data selecionada
  const selectedDate = form.watch("date");
  const selectedService = form.watch("serviceId");

  // Carregar serviços disponíveis
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await serviceAPI.getAll();
        // Filtrar serviços ativos
        setServices(
          servicesData.filter(
            (service: Service & { active: boolean }) => service.active
          )
        );
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Não foi possível carregar os serviços disponíveis");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Carregar horários já agendados para a data selecionada
  useEffect(() => {
    if (!selectedDate) return;

    const fetchBookedTimes = async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        // Verificar se já temos os horários para esta data
        if (bookedTimes[dateStr]) return;

        // Em produção, buscar os horários ocupados da API
        /*
        const response = await bookingAPI.getBookedTimes(dateStr);
        setBookedTimes(prev => ({
          ...prev,
          [dateStr]: response.bookedTimes
        }));
        */

        // Para desenvolvimento, simular alguns horários ocupados
        const mockBookedTimes = ["09:00", "11:30", "14:00"];
        setBookedTimes((prev) => ({
          ...prev,
          [dateStr]: mockBookedTimes,
        }));
      } catch (error) {
        console.error("Erro ao carregar horários ocupados:", error);
      }
    };

    fetchBookedTimes();
  }, [selectedDate, bookedTimes]);

  // Enviar formulário
  const onSubmit = async (data: BookingFormValues) => {
    setSubmitting(true);

    try {
      // Formatar dados para envio
      const bookingData = {
        serviceId: data.serviceId,
        date: format(data.date, "yyyy-MM-dd"),
        time: data.time,
        clientName: data.name,
        clientEmail: data.email,
        clientPhone: data.phone,
        notes:
          data.notes ||
          `Veículo: ${data.carInfo.model}${
            data.carInfo.color ? `, ${data.carInfo.color}` : ""
          }${data.carInfo.plate ? `, Placa: ${data.carInfo.plate}` : ""}`,
      };

      // Em produção, enviar para a API
      /*
      const response = await bookingAPI.create(bookingData);
      setBookingReference(response.reference);
      */

      // Para desenvolvimento, simular sucesso
      setBookingReference(`AGD-${Math.floor(100000 + Math.random() * 900000)}`);

      // Mostrar confirmação
      setSuccess(true);
      setStep("confirmation");

      // Limpar formulário
      form.reset();
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Não foi possível realizar o agendamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar se um horário está disponível
  const isTimeAvailable = (time: string) => {
    if (!selectedDate) return false;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const bookedTimesForDate = bookedTimes[dateStr] || [];

    return !bookedTimesForDate.includes(time);
  };

  // Avançar para o próximo passo
  const goToNextStep = () => {
    if (step === "service") {
      if (!selectedService) {
        form.setError("serviceId", {
          message: "Selecione um serviço para continuar",
        });
        return;
      }
      setStep("datetime");
    } else if (step === "datetime") {
      if (!selectedDate) {
        form.setError("date", { message: "Selecione uma data para continuar" });
        return;
      }
      if (!form.getValues("time")) {
        form.setError("time", {
          message: "Selecione um horário para continuar",
        });
        return;
      }
      setStep("info");
    }
  };

  // Voltar para o passo anterior
  const goToPreviousStep = () => {
    if (step === "datetime") setStep("service");
    if (step === "info") setStep("datetime");
  };

  // Reiniciar o processo de agendamento
  const handleNewBooking = () => {
    setSuccess(false);
    setStep("service");
    form.reset();
  };

  // Encontrar o serviço selecionado
  const selectedServiceDetails = services.find((s) => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Agendar Serviço
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Preencha o formulário abaixo para agendar seu serviço de estética
            automotiva
          </p>

          {loading ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
                <p className="text-center text-gray-500">
                  Carregando serviços disponíveis...
                </p>
              </CardContent>
            </Card>
          ) : success ? (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-center">
                  Agendamento Confirmado!
                </CardTitle>
                <CardDescription className="text-center">
                  Seu agendamento foi realizado com sucesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-center font-semibold text-lg mb-2">
                    Número de Referência
                  </p>
                  <p className="text-center text-2xl font-bold text-blue-600">
                    {bookingReference}
                  </p>
                  <p className="text-center text-sm text-gray-500 mt-1">
                    Guarde este número para consultas futuras
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Detalhes do Agendamento:</h3>
                  <p>
                    <span className="font-medium">Serviço:</span>{" "}
                    {selectedServiceDetails?.name}
                  </p>
                  <p>
                    <span className="font-medium">Data:</span>{" "}
                    {selectedDate
                      ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })
                      : ""}
                  </p>
                  <p>
                    <span className="font-medium">Horário:</span>{" "}
                    {form.getValues("time")}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Próximos Passos:
                  </h3>
                  <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
                    <li>
                      Você receberá um email de confirmação com os detalhes do
                      agendamento
                    </li>
                    <li>
                      Um lembrete será enviado no dia anterior ao seu
                      agendamento
                    </li>
                    <li>Por favor, chegue com 10 minutos de antecedência</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNewBooking} className="w-full">
                  Fazer Novo Agendamento
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Agendar Serviço</CardTitle>
                <CardDescription>
                  {step === "service" && "Selecione o serviço desejado"}
                  {step === "datetime" &&
                    "Escolha a data e horário para seu agendamento"}
                  {step === "info" && "Complete com suas informações pessoais"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Step 1: Seleção de Serviço */}
                    {step === "service" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="serviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Serviço</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um serviço" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {services.map((service) => (
                                    <SelectItem
                                      key={service.id}
                                      value={service.id}
                                    >
                                      {service.name} - R${" "}
                                      {service.price.toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {selectedServiceDetails && (
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 className="font-medium mb-2">
                              {selectedServiceDetails.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {selectedServiceDetails.description}
                            </p>
                            <div className="flex justify-between">
                              <p className="text-sm">
                                <span className="font-medium">Duração:</span>{" "}
                                {selectedServiceDetails.duration} minutos
                              </p>
                              <p className="text-sm font-medium">
                                R$ {selectedServiceDetails.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Seleção de Data e Hora */}
                    {step === "datetime" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Data</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(
                                          field.value,
                                          "dd 'de' MMMM 'de' yyyy",
                                          { locale: ptBR }
                                        )
                                      ) : (
                                        <span>Selecione uma data</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      isBefore(date, startOfDay(new Date())) ||
                                      isBefore(addDays(new Date(), 60), date)
                                    }
                                    initialFocus
                                    locale={ptBR}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Selecione uma data nos próximos 60 dias
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horário</FormLabel>
                              <div className="grid grid-cols-3 gap-2">
                                {AVAILABLE_TIMES.map((time) => {
                                  const available = isTimeAvailable(time);
                                  return (
                                    <Button
                                      key={time}
                                      type="button"
                                      variant={
                                        field.value === time
                                          ? "default"
                                          : "outline"
                                      }
                                      className={cn(
                                        "flex items-center justify-center py-2",
                                        !available &&
                                          "opacity-50 cursor-not-allowed"
                                      )}
                                      disabled={!available || !selectedDate}
                                      onClick={() => field.onChange(time)}
                                    >
                                      <Clock className="h-4 w-4 mr-1" />
                                      {time}
                                    </Button>
                                  );
                                })}
                              </div>
                              <FormDescription>
                                Os horários em cinza já estão ocupados
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 3: Informações Pessoais */}
                    {step === "info" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Seu nome completo"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Para enviar a confirmação do agendamento
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="(00) 00000-0000"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Para contato e confirmação via WhatsApp
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium text-sm">
                            Informações do Veículo
                          </h3>

                          <FormField
                            control={form.control}
                            name="carInfo.model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Modelo do Veículo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Honda Civic"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="carInfo.plate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Placa (opcional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ABC-1234" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="carInfo.color"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cor (opcional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: Prata" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações (opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Alguma informação adicional que devemos saber?"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Navegação entre passos */}
                    <div className="flex justify-between mt-6 pt-4 border-t">
                      {step !== "service" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPreviousStep}
                        >
                          Voltar
                        </Button>
                      ) : (
                        <div />
                      )}

                      {step !== "info" ? (
                        <Button type="button" onClick={goToNextStep}>
                          Continuar
                        </Button>
                      ) : (
                        <Button type="submit" disabled={submitting}>
                          {submitting
                            ? "Agendando..."
                            : "Confirmar Agendamento"}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Resumo do agendamento (visível nos passos 2 e 3) */}
          {!loading &&
            !success &&
            (step === "datetime" || step === "info") &&
            selectedServiceDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resumo do Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Serviço:</span>
                      <span>{selectedServiceDetails.name}</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Data:</span>
                        <span>{format(selectedDate, "dd/MM/yyyy")}</span>
                      </div>
                    )}
                    {form.getValues("time") && (
                      <div className="flex justify-between">
                        <span className="font-medium">Horário:</span>
                        <span>{form.getValues("time")}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Valor Total:</span>
                      <span className="font-bold">
                        R$ {selectedServiceDetails.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
