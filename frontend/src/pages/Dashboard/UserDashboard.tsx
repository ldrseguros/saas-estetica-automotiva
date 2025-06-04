import React, { useEffect, useState, useCallback } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner"; // For notifications
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Car, Pencil, Trash2 } from "lucide-react";

// Import API service functions
import {
  fetchMyBookings,
  cancelMyBooking,
  fetchMyVehicles,
  addMyVehicle,
  updateMyVehicle,
  deleteMyVehicle,
  rescheduleMyBooking,
} from "@/utils/apiService.js";

// Import a suitable Booking type. Assuming BookingTableBooking from Admin area is compatible or adaptable.
// If its structure (especially client vs user) is different from what /api/bookings/client returns,
// a new specific interface for ClientBooking might be needed.
import { BookingTableBooking as ClientBooking } from "@/components/Admin/BookingTable";

// Vehicle interface (ensure fields match prisma schema / vehicleService response for client vehicles)
interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  plate: string;
  color?: string | null;
  // clientId is not usually sent to the client again if they are fetching their own vehicles
  createdAt?: string;
  updatedAt?: string;
}

// Interface para os dados do formulário de veículo
interface VehicleFormData {
  brand: string;
  model: string;
  year: string; // string para facilitar o uso com input
  plate: string;
  color: string;
}

const UserDashboard = () => {
  const [user, setUser] = useState<{
    id: string; // This is AuthAccount ID from JWT
    email: string;
    name?: string;
    role: string;
  } | null>(null);

  const [appointments, setAppointments] = useState<ClientBooking[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  // Estado para gerenciamento de modais de veículos
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [isDeleteVehicleDialogOpen, setIsDeleteVehicleDialogOpen] =
    useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>({
    brand: "",
    model: "",
    year: "",
    plate: "",
    color: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para reagendamento
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] =
    useState<ClientBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
        setUser(null); // Fallback: consider redirecting to login if parsing fails
        toast.error("Sessão inválida. Por favor, faça login novamente.");
        // navigate("/login"); // If using useNavigate
      }
    } else {
      // No user in session, stop loading and potentially redirect to login
      setLoadingAppointments(false);
      setLoadingVehicles(false);
      // navigate("/login"); // If using useNavigate
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    if (!user) return;
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const response = await fetchMyBookings(); // Fetches for the logged-in user (token carries user ID)
      // Ensure the response.data structure matches ClientBooking interface
      // The ClientBooking type from AdminTable might have a 'client.account.name' structure
      // whereas /api/bookings/client might return a flatter structure or omit client details
      // For now, we assume it's compatible or ClientBooking is general enough.
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao carregar seus agendamentos.";
      setAppointmentsError(msg);
      toast.error(msg);
    } finally {
      setLoadingAppointments(false);
    }
  }, [user]);

  const loadVehicles = useCallback(async () => {
    if (!user) return;
    setLoadingVehicles(true);
    setVehiclesError(null);
    try {
      const response = await fetchMyVehicles(); // Fetches for the logged-in user
      setVehicles(response.data || []);
    } catch (error) {
      console.error("Error fetching user vehicles:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao carregar seus veículos.";
      setVehiclesError(msg);
      toast.error(msg);
    } finally {
      setLoadingVehicles(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Only load data if user is successfully set
      loadAppointments();
      loadVehicles();
    }
  }, [user, loadAppointments, loadVehicles]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    try {
      await cancelMyBooking(bookingId);
      toast.success("Agendamento cancelado com sucesso!");
      loadAppointments(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao cancelar o agendamento.";
      toast.error(msg);
    }
  };

  // Resetar formulário
  const resetVehicleForm = () => {
    setVehicleForm({
      brand: "",
      model: "",
      year: "",
      plate: "",
      color: "",
    });
  };

  // Lidar com mudanças no formulário
  const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Abrir modal de adição de veículo
  const handleAddVehicleClick = () => {
    resetVehicleForm();
    setIsAddVehicleModalOpen(true);
  };

  // Abrir modal de edição de veículo
  const handleEditVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year?.toString() || "",
      plate: vehicle.plate,
      color: vehicle.color || "",
    });
    setIsEditVehicleModalOpen(true);
  };

  // Abrir diálogo de confirmação de exclusão
  const handleDeleteVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteVehicleDialogOpen(true);
  };

  // Adicionar novo veículo
  const handleAddVehicleSubmit = async () => {
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.plate) {
      toast.error("Marca, modelo e placa são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await addMyVehicle({
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year ? parseInt(vehicleForm.year) : null,
        plate: vehicleForm.plate.toUpperCase(),
        color: vehicleForm.color || null,
      });

      toast.success("Veículo adicionado com sucesso!");
      setIsAddVehicleModalOpen(false);
      resetVehicleForm();
      loadVehicles(); // Recarregar a lista
    } catch (error) {
      console.error("Error adding vehicle:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao adicionar veículo.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualizar veículo existente
  const handleEditVehicleSubmit = async () => {
    if (!selectedVehicle) return;
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.plate) {
      toast.error("Marca, modelo e placa são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMyVehicle(selectedVehicle.id, {
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year ? parseInt(vehicleForm.year) : null,
        plate: vehicleForm.plate.toUpperCase(),
        color: vehicleForm.color || null,
      });

      toast.success("Veículo atualizado com sucesso!");
      setIsEditVehicleModalOpen(false);
      loadVehicles(); // Recarregar a lista
    } catch (error) {
      console.error("Error updating vehicle:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao atualizar veículo.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir veículo
  const handleDeleteVehicleConfirm = async () => {
    if (!selectedVehicle) return;

    setIsSubmitting(true);
    try {
      await deleteMyVehicle(selectedVehicle.id);

      toast.success("Veículo removido com sucesso!");
      setIsDeleteVehicleDialogOpen(false);
      loadVehicles(); // Recarregar a lista
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao remover veículo.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de reagendamento
  const handleRescheduleClick = (booking: ClientBooking) => {
    setBookingToReschedule(booking);

    // Inicializar com a data atual do agendamento
    const currentDate = new Date(booking.date);
    const formattedDate = currentDate.toISOString().split("T")[0];
    setRescheduleDate(formattedDate);

    // Definir o horário atual
    setRescheduleTime(booking.time);

    // Carregar horários disponíveis para a data selecionada
    loadAvailableTimes(formattedDate);

    setIsRescheduleModalOpen(true);
  };

  // Carregar horários disponíveis para uma data
  const loadAvailableTimes = async (date: string) => {
    setLoadingTimes(true);
    try {
      const response = await fetch(
        `/api/bookings/available-slots?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao carregar horários disponíveis");
      }

      const data = await response.json();
      setAvailableTimes(data.availableSlots || []);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      toast.error("Não foi possível carregar os horários disponíveis");
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  // Lidar com a mudança de data no reagendamento
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setRescheduleDate(newDate);
    setRescheduleTime(""); // Resetar o horário quando a data muda
    loadAvailableTimes(newDate);
  };

  // Submeter o reagendamento
  const handleRescheduleSubmit = async () => {
    if (!bookingToReschedule || !rescheduleDate || !rescheduleTime) {
      toast.error("Selecione uma nova data e horário");
      return;
    }

    setIsSubmitting(true);
    try {
      await rescheduleMyBooking(
        bookingToReschedule.id,
        rescheduleDate,
        rescheduleTime
      );

      toast.success("Agendamento reagendado com sucesso!");
      setIsRescheduleModalOpen(false);
      loadAppointments(); // Recarregar a lista de agendamentos
    } catch (error) {
      console.error("Erro ao reagendar:", error);
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao reagendar o agendamento.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user && (loadingAppointments || loadingVehicles)) {
    // Show loading if user is not yet set but we expect to load
    return (
      <div className="container py-10 text-center">Carregando dados...</div>
    );
  }
  if (!user) {
    // If still no user after attempting to load (e.g. not logged in, session error)
    return (
      <div className="container py-10 text-center">
        <p>Você precisa estar logado para ver esta página.</p>
        <Button asChild className="mt-4 bg-brand-red hover:bg-brand-red/90">
          <Link to="/login">Ir para Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">
        Painel {user?.name ? `- ${user.name}` : "do Usuário"}
      </h1>{" "}
      {/* Mostrar nome do usuário */}
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="appointments">Meus Agendamentos</TabsTrigger>
          <TabsTrigger value="vehicles">Meus Veículos</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Meus Agendamentos</h2>
            <Button asChild className="bg-brand-red hover:bg-brand-red/90">
              <Link to="/agendar">Novo Agendamento</Link>
            </Button>
          </div>

          <div className="grid gap-6">
            <h3 className="text-lg font-semibold">Agendamentos Passados</h3>

            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-card mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {appointment.services
                            ?.map((s) => s.service.title)
                            .join(", ") || "Serviço não especificado"}
                        </CardTitle>
                        <CardDescription>
                          {new Date(appointment.date).toLocaleDateString(
                            "pt-BR",
                            {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}{" "}
                          at {appointment.time}
                        </CardDescription>
                      </div>
                      <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {appointment.status === "scheduled"
                          ? "scheduled"
                          : "completed"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-muted-foreground">
                          🚗
                        </span>
                        <span>
                          {appointment.vehicle.brand}{" "}
                          {appointment.vehicle.model} (
                          {appointment.vehicle.plate})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-muted-foreground">
                          📍
                        </span>
                        <span>{appointment.location}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4 w-full border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
                      onClick={() => handleRescheduleClick(appointment)}
                      disabled={
                        appointment.status === "cancelled" ||
                        appointment.status === "completed"
                      }
                    >
                      Reagendar Agendamento
                    </Button>
                    <Button
                      variant="destructive"
                      className="mt-4 w-full"
                      onClick={() => handleCancelBooking(appointment.id)}
                      disabled={
                        appointment.status === "cancelled" ||
                        appointment.status === "completed"
                      }
                    >
                      Cancelar Agendamento
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-10 bg-card rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Você não possui agendamentos passados.
                </p>
                <Button asChild className="bg-brand-red hover:bg-brand-red/90">
                  <Link to="/agendar">Agendar Serviço</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Meus Veículos</h2>
            <Button
              className="bg-brand-red hover:bg-brand-red/90"
              onClick={handleAddVehicleClick}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
            </Button>
          </div>

          {loadingVehicles ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-brand-red border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">
                Carregando veículos...
              </p>
            </div>
          ) : vehiclesError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {vehiclesError}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center p-10 bg-card rounded-lg">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Você ainda não possui veículos cadastrados.
              </p>
              <Button
                className="bg-brand-red hover:bg-brand-red/90"
                onClick={handleAddVehicleClick}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="bg-card">
                  <CardHeader>
                    <CardTitle>
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year ? `${vehicle.year} • ` : ""}
                      {vehicle.plate}
                      {vehicle.color ? ` • ${vehicle.color}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVehicleClick(vehicle)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteVehicleClick(vehicle)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remover
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Modal de Adição de Veículo */}
          <Dialog
            open={isAddVehicleModalOpen}
            onOpenChange={setIsAddVehicleModalOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Veículo</DialogTitle>
                <DialogDescription>
                  Preencha os dados do seu veículo abaixo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca*</Label>
                    <Input
                      id="brand"
                      name="brand"
                      placeholder="Ex: Toyota"
                      value={vehicleForm.brand}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo*</Label>
                    <Input
                      id="model"
                      name="model"
                      placeholder="Ex: Corolla"
                      value={vehicleForm.model}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="Ex: 2020"
                      value={vehicleForm.year}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="Ex: Prata"
                      value={vehicleForm.color}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa*</Label>
                  <Input
                    id="plate"
                    name="plate"
                    placeholder="Ex: ABC1234"
                    value={vehicleForm.plate}
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddVehicleSubmit}
                  className="bg-brand-red hover:bg-brand-red/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Veículo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Edição de Veículo */}
          <Dialog
            open={isEditVehicleModalOpen}
            onOpenChange={setIsEditVehicleModalOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Veículo</DialogTitle>
                <DialogDescription>
                  Atualize os dados do seu veículo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-brand">Marca*</Label>
                    <Input
                      id="edit-brand"
                      name="brand"
                      placeholder="Ex: Toyota"
                      value={vehicleForm.brand}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">Modelo*</Label>
                    <Input
                      id="edit-model"
                      name="model"
                      placeholder="Ex: Corolla"
                      value={vehicleForm.model}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-year">Ano</Label>
                    <Input
                      id="edit-year"
                      name="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="Ex: 2020"
                      value={vehicleForm.year}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-color">Cor</Label>
                    <Input
                      id="edit-color"
                      name="color"
                      placeholder="Ex: Prata"
                      value={vehicleForm.color}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plate">Placa*</Label>
                  <Input
                    id="edit-plate"
                    name="plate"
                    placeholder="Ex: ABC1234"
                    value={vehicleForm.plate}
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditVehicleModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditVehicleSubmit}
                  className="bg-brand-red hover:bg-brand-red/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo de Confirmação de Exclusão */}
          <AlertDialog
            open={isDeleteVehicleDialogOpen}
            onOpenChange={setIsDeleteVehicleDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o veículo{" "}
                  {selectedVehicle?.brand} {selectedVehicle?.model} (
                  {selectedVehicle?.plate})? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteVehicleConfirm}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
      {/* Modal de Reagendamento */}
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Agendamento</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para seu agendamento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {bookingToReschedule && (
              <div className="bg-slate-100 text-stone-950 p-3 rounded-md mb-4">
                <p className="font-medium">Agendamento atual:</p>
                <p>
                  {bookingToReschedule.services
                    ?.map((s) => s.service.title)
                    .join(", ")}
                </p>
                <p>
                  {new Date(bookingToReschedule.date).toLocaleDateString(
                    "pt-BR"
                  )}{" "}
                  às {bookingToReschedule.time}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Nova Data</Label>
              <Input
                id="reschedule-date"
                type="date"
                min={new Date().toISOString().split("T")[0]} // Data mínima é hoje
                value={rescheduleDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reschedule-time">Novo Horário</Label>
              <div>
                {loadingTimes ? (
                  <div className="text-center py-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-solid border-brand-red border-r-transparent"></div>
                    <span className="ml-2">Carregando horários...</span>
                  </div>
                ) : availableTimes.length === 0 ? (
                  <p className="text-red-500 text-sm">
                    Não há horários disponíveis para esta data.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={
                          rescheduleTime === time ? "default" : "outline"
                        }
                        className={
                          rescheduleTime === time
                            ? "bg-brand-red hover:bg-brand-red/90"
                            : ""
                        }
                        onClick={() => setRescheduleTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              className="bg-brand-red hover:bg-brand-red/90"
              disabled={isSubmitting || !rescheduleDate || !rescheduleTime}
            >
              {isSubmitting ? "Processando..." : "Confirmar Reagendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
