import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { fetchClients } from "@/utils/apiService";
import API from "@/utils/apiService";
import { Checkbox } from "@/components/ui/checkbox";

// Assuming these interfaces are defined elsewhere or we define them here
interface UserData {
  id: string;
  name: string;
  email: string;
}
interface VehicleData {
  id: string;
  brand: string;
  model: string;
  plate: string;
}
interface ServiceData {
  id: string;
  title: string;
}

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newBookingData: {
    clientId: string;
    vehicleId: string;
    serviceIds: string[];
    date: string;
    time: string;
    status: string;
    specialInstructions?: string;
    location?: string;
  }) => void;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    clientId: "",
    vehicleId: "",
    serviceIds: [] as string[],
    date: "",
    time: "",
    status: "pending",
    specialInstructions: "",
    location: "",
  });

  const [clients, setClients] = useState<UserData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [clientVehicles, setClientVehicles] = useState<VehicleData[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errorLoadingVehicles, setErrorLoadingVehicles] = useState<
    string | null
  >(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setErrorLoadingData(null);
      try {
        const clientsResponse = await fetchClients({ role: "CLIENT" });
        if (Array.isArray(clientsResponse.data)) {
          setClients(clientsResponse.data);
        } else if (
          clientsResponse.data &&
          Array.isArray(clientsResponse.data.clients)
        ) {
          setClients(clientsResponse.data.clients);
        } else if (
          clientsResponse.data &&
          Array.isArray(clientsResponse.data.users)
        ) {
          setClients(
            clientsResponse.data.users.map((u) => ({
              id: u.id,
              name: u.name || u.email,
              email: u.email,
            }))
          );
        } else {
          console.error(
            "Unexpected clients response format:",
            clientsResponse.data
          );
          setErrorLoadingData("Formato de resposta inesperado para clientes.");
        }

        const servicesResponse = await API.get<ServiceData[]>("/services");
        setServices(servicesResponse.data);
      } catch (error) {
        console.error("Error loading data for create booking modal:", error);
        const err = error as Error & {
          response?: { data?: { message?: string } };
        };
        setErrorLoadingData(
          err.response?.data?.message ||
            err.message ||
            "Erro ao carregar dados."
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Selecionando ${name}:`, value);
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      // Apenas limpe o veículo quando mudar de cliente
      if (name === "clientId") {
        newData.vehicleId = "";
      }
      console.log("Novo formData:", newData);
      return newData;
    });
    if (name === "clientId" && value) {
      loadClientVehicles(value);
    } else if (name === "clientId" && !value) {
      setClientVehicles([]);
    }
  };

  const loadClientVehicles = async (clientId: string) => {
    setLoadingVehicles(true);
    setErrorLoadingVehicles(null);
    try {
      const response = await API.get<VehicleData[]>(
        `/vehicles/admin/clients/${clientId}/vehicles`
      );
      setClientVehicles(response.data);
    } catch (error) {
      console.error(`Error fetching vehicles for client ${clientId}:`, error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      setErrorLoadingVehicles(
        err.response?.data?.message ||
          err.message ||
          "Erro ao carregar veículos."
      );
      setClientVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleServiceCheckboxChange = (
    serviceId: string,
    isChecked: boolean
  ) => {
    setFormData((prev) => {
      const currentServiceIds = prev.serviceIds || [];
      if (isChecked) {
        if (!currentServiceIds.includes(serviceId)) {
          return { ...prev, serviceIds: [...currentServiceIds, serviceId] };
        }
      } else {
        return {
          ...prev,
          serviceIds: currentServiceIds.filter((id) => id !== serviceId),
        };
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formulário:", formData);

    // Verificações de campos obrigatórios
    if (!formData.clientId || formData.clientId === "") {
      toast.error("Por favor, selecione um cliente.");
      return;
    }

    if (!formData.vehicleId || formData.vehicleId === "") {
      toast.error("Por favor, selecione um veículo.");
      return;
    }

    if (
      formData.serviceIds.length === 0 ||
      formData.serviceIds.some((id) => id === "")
    ) {
      toast.error("Por favor, selecione pelo menos um serviço.");
      return;
    }

    if (!formData.date || formData.date === "") {
      toast.error("Por favor, selecione uma data.");
      return;
    }

    if (!formData.time || formData.time === "") {
      toast.error("Por favor, selecione um horário.");
      return;
    }

    // Se todas as verificações passarem, envia o formulário
    onSave(formData);
    setFormData({
      clientId: "",
      vehicleId: "",
      serviceIds: [],
      date: "",
      time: "",
      status: "pending",
      specialInstructions: "",
      location: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-300">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientId" className="text-right text-slate-300">
              Cliente
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleSelectChange("clientId", value)}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-brand-red focus:border-brand-red">
                  <SelectValue
                    placeholder={
                      loadingData
                        ? "Carregando clientes..."
                        : "Selecione o Cliente"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {loadingData ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : errorLoadingData ? (
                    <SelectItem value="error" disabled>
                      Erro ao carregar clientes
                    </SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum cliente encontrado
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name || client.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicleId" className="text-right text-slate-300">
              Veículo
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.vehicleId}
                onValueChange={(value) =>
                  handleSelectChange("vehicleId", value)
                }
                disabled={!formData.clientId}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-brand-red focus:border-brand-red">
                  <SelectValue
                    placeholder={
                      loadingVehicles
                        ? "Carregando veículos..."
                        : formData.clientId
                        ? "Selecione o Veículo"
                        : "Selecione um cliente primeiro"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {loadingVehicles ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : errorLoadingVehicles ? (
                    <SelectItem value="error" disabled>
                      Erro ao carregar veículos
                    </SelectItem>
                  ) : clientVehicles.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum veículo encontrado para este cliente
                    </SelectItem>
                  ) : (
                    clientVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {`${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serviceIds" className="text-right text-slate-300">
              Serviços
            </Label>
            <div className="col-span-3 space-y-2">
              {loadingData ? (
                <div className="text-slate-400">Carregando serviços...</div>
              ) : errorLoadingData ? (
                <div className="text-red-400">Erro ao carregar serviços</div>
              ) : services.length === 0 ? (
                <div className="text-slate-400">Nenhum serviço disponível</div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onCheckedChange={(isChecked: boolean) =>
                        handleServiceCheckboxChange(service.id, isChecked)
                      }
                      className="border-slate-700 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
                    />
                    <Label
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                    >
                      {service.title}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Hora
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-brand-red focus:border-brand-red">
                  <SelectValue placeholder="Selecione o Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Completo</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="rescheduled">Reagendado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Localização (Opcional)
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialInstructions" className="text-right">
              Instruções Especiais (Opcional)
            </Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-brand-red hover:bg-brand-red/90"
          >
            Criar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingModal;
