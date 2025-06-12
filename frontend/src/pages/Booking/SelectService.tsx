import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { formatCurrency, formatDuration } from "@/utils/formatters";
import { fetchPublicServices } from "@/utils/apiService";
import StepIndicator from "@/components/StepIndicator";

// Define interface for Service data
interface Service {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  imageSrc?: string | null;
}

const SelectService: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await fetchPublicServices();
        if (response.data) {
          setServices(response.data);
        } else {
          throw new Error("Formato de resposta inesperado");
        }
      } catch (error: unknown) {
        console.error("Failed to fetch services:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        toast({
          title: "Erro ao carregar serviços",
          description:
            "Não foi possível carregar a lista de serviços. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Nenhum serviço selecionado",
        description:
          "Por favor, selecione pelo menos um serviço para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Pass the selected service objects instead of just IDs
    const selectedServiceObjects = services.filter((service) =>
      selectedServices.includes(service.id)
    );

    navigate("/agendar/data-hora", {
      state: { selectedServices: selectedServiceObjects },
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Selecione um ou mais Serviços
        </h1>
        <StepIndicator
          steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]}
          currentStep={1}
        />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          <span className="ml-3 text-xl">Carregando serviços...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Selecione um ou mais Serviços
      </h1>

      <StepIndicator
        steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]}
        currentStep={1}
      />

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-slate-500">
            Nenhum serviço disponível no momento.
          </p>
          <p className="text-slate-400 mt-2">
            Por favor, tente novamente mais tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-card bg-slate-800/60 rounded-lg overflow-hidden border-2 cursor-pointer ${
                selectedServices.includes(service.id)
                  ? "border-brand-red"
                  : "border-slate-700"
              } hover:border-brand-red/60 transition-colors duration-200`}
              onClick={() => toggleService(service.id)}
            >
              <div className="service-image-container h-40 bg-slate-700 relative overflow-hidden">
                {service.imageSrc ? (
                  <img
                    src={`http://localhost:3000${service.imageSrc}`}
                    alt={`Imagem do serviço ${service.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/img/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-400">
                    <span className="text-sm">Imagem Indisponível</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col gap-3">
                <h3
                  className="text-lg font-semibold text-white truncate"
                  title={service.title}
                >
                  {service.title}
                </h3>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {service.description || ""}
                </p>

                <div className="flex items-center justify-between text-sm mt-2">
                  <p className="text-emerald-400 font-medium">
                    {formatCurrency(service.price)}
                  </p>
                  {service.duration && service.duration > 0 && (
                    <p className="text-slate-400 font-medium">
                      {formatDuration(service.duration)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-sm font-medium text-white">
            Serviços Selecionados
          </p>
          {selectedServices.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nenhum serviço selecionado.
            </p>
          ) : (
            <ul className="mt-2">
              {selectedServices.map((serviceId) => {
                const service = services.find((s) => s.id === serviceId);
                return (
                  <li
                    key={serviceId}
                    className="text-sm text-slate-300 flex justify-between"
                  >
                    <span>{service?.title}</span>
                    <span className="text-emerald-400 ml-4">
                      {service ? formatCurrency(service.price) : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Button
          onClick={handleContinue}
          className="bg-brand-red hover:bg-brand-red/90"
          disabled={selectedServices.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default SelectService;
