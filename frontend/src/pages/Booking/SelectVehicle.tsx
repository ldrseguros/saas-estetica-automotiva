import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import StepIndicator from "@/components/StepIndicator";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {fetchMyVehicles, addMyVehicle} from "@/utils/apiService.js";
import { Loader2 } from "lucide-react";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  color: string;
}

const SelectVehicle: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedServices, selectedDate, selectedTime } = location.state || {};

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    color: "",
  });

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchMyVehicles();

        if (response.data && Array.isArray(response.data)) {
          setVehicles(response.data);
          // Se tiver pelo menos um veículo, seleciona o primeiro por padrão
          if (response.data.length > 0) {
            setSelectedVehicle(response.data[0].id);
          }
        } else {
          console.warn("Unexpected response format for vehicles");
          setVehicles([]);
        }
      } catch (error: unknown) {
        console.error("Error fetching vehicles:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar seus veículos.";
        setError(errorMessage);
        toast({
          title: "Erro ao carregar veículos",
          description: errorMessage,
          variant: "destructive",
        });
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async () => {
    // Simple validation
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.plate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha os campos marca, modelo e placa.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await addMyVehicle(newVehicle);
      const addedVehicle = response.data;

      setVehicles((prev) => [...prev, addedVehicle]);
      setSelectedVehicle(addedVehicle.id);
      setIsAddingVehicle(false);

      toast({
        title: "Veículo adicionado",
        description: "Seu veículo foi adicionado com sucesso.",
      });
    } catch (error: unknown) {
      console.error("Error adding vehicle:", error);
      toast({
        title: "Erro ao adicionar veículo",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o veículo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate("/agendar/data-hora", {
      state: { selectedServices },
    });
  };

  const handleContinue = () => {
    if (!selectedVehicle && vehicles.length > 0) {
      toast({
        title: "Veículo não selecionado",
        description: "Por favor, selecione um veículo para continuar.",
        variant: "destructive",
      });
      return;
    }

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);

    navigate("/agendar/local", {
      state: {
        selectedServices,
        selectedDate,
        selectedTime,
        selectedVehicle: vehicle,
      },
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Carregando veículos...
        </h1>
        <StepIndicator
          steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]}
          currentStep={3}
        />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          <span className="ml-3 text-xl">Carregando seus veículos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Selecione um Veículo
      </h1>

      <StepIndicator
        steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]}
        currentStep={3}
      />

      <div className="bg-card p-8 rounded-lg mb-8">
        {error ? (
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => setIsAddingVehicle(true)}
              className="bg-brand-red hover:bg-brand-red/90"
            >
              Adicionar Veículo Manualmente
            </Button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">
              Nenhum Veículo Encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Você não tem nenhum veículo salvo. Por favor, adicione um veículo
              para continuar.
            </p>
            <Button
              onClick={() => setIsAddingVehicle(true)}
              className="bg-brand-red hover:bg-brand-red/90"
            >
              Adicionar Veículo
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Seus Veículos</h3>
              <Button
                onClick={() => setIsAddingVehicle(true)}
                variant="outline"
                className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
              >
                Adicionar Novo
              </Button>
            </div>

            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`
                    border rounded-lg p-4 transition-colors cursor-pointer
                    ${
                      selectedVehicle === vehicle.id
                        ? "border-brand-red bg-brand-red/5"
                        : "border-border hover:border-brand-red/50"
                    }
                  `}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Placa: {vehicle.plate} • Cor: {vehicle.color}
                      </p>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-brand-red flex items-center justify-center">
                      {selectedVehicle === vehicle.id && (
                        <div className="w-2 h-2 rounded-full bg-brand-red" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={handleBack} variant="outline">
          Voltar
        </Button>

        <Button
          onClick={handleContinue}
          className="bg-brand-red hover:bg-brand-red/90"
          disabled={vehicles.length === 0 && !error}
        >
          Próximo
        </Button>
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Veículo</DialogTitle>
            <DialogDescription>
              Preencha os dados do seu veículo abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                name="brand"
                value={newVehicle.brand}
                onChange={handleInputChange}
                placeholder="Ex: Toyota"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                name="model"
                value={newVehicle.model}
                onChange={handleInputChange}
                placeholder="Ex: Corolla"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  name="year"
                  value={newVehicle.year}
                  onChange={handleInputChange}
                  placeholder="Ex: 2020"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  name="color"
                  value={newVehicle.color}
                  onChange={handleInputChange}
                  placeholder="Ex: Branco"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                name="plate"
                value={newVehicle.plate}
                onChange={handleInputChange}
                placeholder="Ex: ABC1234"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingVehicle(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-brand-red hover:bg-brand-red/90"
              onClick={handleAddVehicle}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectVehicle;
