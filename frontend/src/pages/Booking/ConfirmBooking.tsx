import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import StepIndicator from "@/components/StepIndicator";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/utils/apiService";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

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

const ConfirmBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedServices = [],
    selectedDate,
    selectedTime,
    selectedVehicle,
    selectedLocation,
    address,
  } = location.state || {};

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");

  const handleBack = () => {
    navigate("/agendar/local", {
      state: {
        selectedServices,
        selectedDate,
        selectedTime,
        selectedVehicle,
      },
    });
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Preparar os dados do agendamento no formato esperado pelo backend
      const bookingData = {
        serviceIds: selectedServices.map((service: { id: string } | string) =>
          typeof service === "string" ? service : service.id
        ),
        date:
          selectedDate instanceof Date
            ? selectedDate.toISOString().split("T")[0]
            : selectedDate,
        time: selectedTime,
        vehicleId: selectedVehicle.id,
        location: selectedLocation.id,
        address: selectedLocation.id === "domicilio" ? address : null,
        specialInstructions: specialInstructions || null,
        phone: phone || null,
      };

      // Enviar para o backend
      await createBooking(bookingData);

      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi realizado com sucesso.",
      });

      navigate("/painel");
    } catch (error: unknown) {
      console.error("Erro ao confirmar agendamento:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar seu agendamento.";

      toast({
        title: "Erro ao confirmar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedDate || !selectedTime || !selectedVehicle || !selectedLocation) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-6">
          Informações de agendamento incompletas
        </h1>
        <p className="text-muted-foreground mb-6">
          Parece que algumas informações do seu agendamento estão faltando. Por
          favor, volte e preencha todas as etapas.
        </p>
        <Button
          onClick={() => navigate("/agendar")}
          className="bg-brand-red hover:bg-brand-red/90"
        >
          Voltar para o início
        </Button>
      </div>
    );
  }

  const formattedDate =
    selectedDate instanceof Date
      ? selectedDate.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Data inválida";

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Confirme seu Agendamento
      </h1>

      <StepIndicator
        steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]}
        currentStep={5}
      />

      <div className="bg-card p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Resumo do Agendamento</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Serviços Selecionados
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((serviceId: string) => {
                const service = services.find((s) => s.id === serviceId);
                return (
                  <div
                    key={serviceId}
                    className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {service?.title}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Data e Hora
              </h3>
              <p>{formattedDate}</p>
              <p>{selectedTime}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Veículo
              </h3>
              <p>
                {selectedVehicle.brand} {selectedVehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedVehicle.plate} • {selectedVehicle.color}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tipo de Atendimento
            </h3>
            <p>{selectedLocation.title}</p>
          </div>

          {selectedLocation.id === "domicilio" && address && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Endereço para Atendimento
              </h3>
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state}
              </p>
              <p>{address.zipCode}</p>
              {address.instructions && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">
                    Instruções adicionais:
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {address.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Telefone para Contato (Obrigatório)
            </h3>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="mb-4"
              required
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Instruções Especiais (Opcional)
            </h3>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Qualquer solicitação ou instrução especial para seu agendamento"
              className="resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={handleBack} variant="outline" disabled={isSubmitting}>
          Voltar
        </Button>

        <Button
          onClick={handleConfirm}
          className="bg-brand-red hover:bg-brand-red/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar Agendamento"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmBooking;
