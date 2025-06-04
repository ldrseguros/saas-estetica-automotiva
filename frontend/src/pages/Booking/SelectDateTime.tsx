import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useLocation, useNavigate } from "react-router-dom";
import StepIndicator from "@/components/StepIndicator";
import { toast } from "@/components/ui/use-toast";
import { fetchAvailableTimeSlots } from "@/utils/apiService";
import { Loader2 } from "lucide-react";

// Sample service data to display selected services
const services = [
  { id: "higienizacao-limpeza", title: "Higienização + Limpeza de Assoalho" },
  { id: "higienizacao-interna", title: "Higienização Interna Completa" },
  { id: "higienizacao-ar", title: "Higienização de Ar-Condicionado" },
  { id: "impermeabilizacao", title: "Impermeabilização de Bancos de Tecido" },
  { id: "lavagem-motos", title: "Lavagem de Motos Detalhada" },
  { id: "limpeza-cera", title: "Limpeza + Cera Cleaner Wax" },
  { id: "limpeza-convencional", title: "Limpeza Convencional" },
  { id: "limpeza-motor", title: "Limpeza Detalhada de Motor" },
  { id: "limpeza-premium", title: "Limpeza Premium" },
  { id: "polimento-comercial", title: "Polimento Comercial 60%" },
  {
    id: "polimento-tecnico",
    title: "Polimento Técnico & Proteção Cerâmica 100%",
  },
  { id: "tratamento-vidros", title: "Tratamento de Vidros" },
  { id: "tratamento-couro", title: "Tratamento em Couro" },
  { id: "vitrificacao-farois", title: "Vitrificação de Faróis" },
  { id: "vitrificacao-plasticos", title: "Vitrificação de Plásticos" },
];

const SelectDateTime: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedServices = location.state?.selectedServices || [];

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState<boolean>(false);

  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!date) return;

      setIsLoadingTimes(true);
      try {
        // Formatar a data para YYYY-MM-DD para enviar ao backend
        const formattedDate = date.toISOString().split("T")[0];
        const response = await fetchAvailableTimeSlots(formattedDate);

        if (response.data && Array.isArray(response.data)) {
          setAvailableTimes(response.data);
        } else {
          // Fallback para horários padrão se a API falhar
          setAvailableTimes([
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
          ]);
          console.warn(
            "Invalid response format for available times, using default times"
          );
        }
      } catch (error) {
        console.error("Error fetching available times:", error);
        toast({
          title: "Erro ao carregar horários",
          description:
            "Não foi possível carregar os horários disponíveis. Tente novamente mais tarde.",
          variant: "destructive",
        });

        // Fallback para horários padrão se a API falhar
        setAvailableTimes([
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
        ]);
      } finally {
        setIsLoadingTimes(false);
      }
    };

    if (date) {
      loadAvailableTimes();
    }
  }, [date]);

  const handleBack = () => {
    navigate("/agendar");
  };

  const handleContinue = () => {
    if (!date) {
      toast({
        title: "Data não selecionada",
        description: "Por favor, selecione uma data para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Horário não selecionado",
        description: "Por favor, selecione um horário para continuar.",
        variant: "destructive",
      });
      return;
    }

    navigate("/agendar/veiculo", {
      state: {
        selectedServices,
        selectedDate: date,
        selectedTime: time,
      },
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Selecione Data e Hora
      </h1>

      <StepIndicator
        steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]}
        currentStep={2}
      />

      <div className="bg-card p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Serviços Selecionados:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedServices.map((serviceId: string) => {
            const service = services.find((s) => s.id === serviceId);
            return (
              <span
                key={serviceId}
                className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {service?.title}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Selecione uma Data</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(date) => {
              // Disable past dates and Sundays
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              return date < now || date.getDay() === 0;
            }}
          />
          {date && (
            <div className="mt-4 p-3 border border-border rounded-md">
              <p className="text-sm">Data selecionada:</p>
              <p className="font-medium">
                {date.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Horários Disponíveis</h3>

          {!date ? (
            <p className="text-sm text-muted-foreground mb-4">
              Selecione uma data para ver os horários disponíveis.
            </p>
          ) : isLoadingTimes ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
              <span className="ml-3">Carregando horários...</span>
            </div>
          ) : availableTimes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Não há horários disponíveis para esta data.
              <br />
              Por favor, selecione outra data.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione um horário:
                <br />
                Escolha entre os {availableTimes.length} horários disponíveis
              </p>

              <div className="grid grid-cols-3 gap-3">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    className={`
                      py-2 px-3 rounded-md text-sm font-medium transition-colors
                      ${
                        t === time
                          ? "bg-brand-red text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }
                    `}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={handleBack} variant="outline">
          Voltar
        </Button>

        <Button
          onClick={handleContinue}
          className="bg-brand-red hover:bg-brand-red/90"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default SelectDateTime;
