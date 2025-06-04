import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import axios from "axios";

// Importe a interface BookingTableBooking
import { BookingTableBooking } from "@/components/Admin/BookingTable";

interface EditBookingModalProps {
  open: boolean;
  onClose: () => void;
  booking: BookingTableBooking | null;
  onSaveSuccess: () => void; // Callback para quando a edição for bem sucedida
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  open,
  onClose,
  booking,
  onSaveSuccess,
}) => {
  const [editedBooking, setEditedBooking] =
    useState<BookingTableBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEditedBooking(booking);
  }, [booking, open]);

  const handleSaveEdit = async () => {
    if (!editedBooking) return;

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem("token");
      // Formatar a data para YYYY-MM-DD antes de enviar
      const formattedDate = editedBooking.date
        ? new Date(editedBooking.date).toISOString().split("T")[0]
        : "";

      await axios.put(
        `/api/bookings/admin/${editedBooking.id}`,
        {
          ...editedBooking,
          date: formattedDate, // Enviar data formatada
          status: editedBooking.status,
          time: editedBooking.time,
          specialInstructions: editedBooking.specialInstructions || null,
          location: editedBooking.location || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Agendamento atualizado com sucesso");
      onSaveSuccess(); // Chamar o callback de sucesso para atualizar a lista
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      const errorMessage =
        error.response?.data?.message || "Erro ao atualizar agendamento";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedBooking((prev) => {
      if (!prev) return null;
      return { ...prev, [name as string]: value };
    });
  };

  const handleSelectChange = (value: string) => {
    setEditedBooking((prev) => {
      if (!prev) return null;
      return { ...prev, status: value };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {" "}
      {/* onOpenChange para fechar o dialog */}
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
        {" "}
        {/* Adicionar estilos de fundo e borda */}
        <DialogHeader>
          <DialogTitle className="text-white">Editar Agendamento</DialogTitle>
          {/* <DialogDescription>Faça alterações no agendamento.</DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Informações não editáveis */} {/* TODO: Estilizar melhor */}
          {editedBooking && (
            <div className="mb-4 p-3 border border-slate-700 rounded-md text-slate-300 text-sm">
              <p>
                <strong className="text-white">Cliente:</strong>{" "}
                {editedBooking.client.account.name ||
                  editedBooking.client.account.email}
              </p>
              <p>
                <strong className="text-white">Veículo:</strong>{" "}
                {editedBooking.vehicle.brand} {editedBooking.vehicle.model} (
                {editedBooking.vehicle.plate})
              </p>
              <p>
                <strong className="text-white">Serviços:</strong>{" "}
                {editedBooking.services.map((s) => s.service.title).join(", ")}
              </p>
            </div>
          )}
          {/* Campos Editáveis */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right text-slate-300">
              Data
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={
                editedBooking?.date ? editedBooking.date.split("T")[0] : ""
              } // Formatar data para YYYY-MM-DD
              onChange={handleInputChange}
              className="col-span-3 bg-slate-800 border-slate-700 text-white focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:ring-offset-0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right text-slate-300">
              Hora
            </Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={editedBooking?.time || ""}
              onChange={handleInputChange}
              className="col-span-3 bg-slate-800 border-slate-700 text-white focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:ring-offset-0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right text-slate-300">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={editedBooking?.status || ""}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:ring-offset-0 data-[state=open]:ring-2 data-[state=open]:ring-brand-red data-[state=open]:border-brand-red data-[state=open]:ring-offset-0">
                  <SelectValue placeholder="Selecione o Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem
                    value="pending"
                    className="focus:bg-slate-700 hover:bg-slate-700"
                  >
                    Pendente
                  </SelectItem>
                  <SelectItem
                    value="confirmed"
                    className="focus:bg-slate-700 hover:bg-slate-700"
                  >
                    Confirmado
                  </SelectItem>
                  <SelectItem
                    value="completed"
                    className="focus:bg-slate-700 hover:bg-slate-700"
                  >
                    Completo
                  </SelectItem>
                  <SelectItem
                    value="cancelled"
                    className="focus:bg-slate-700 hover:bg-slate-700"
                  >
                    Cancelado
                  </SelectItem>
                  <SelectItem
                    value="rescheduled"
                    className="focus:bg-slate-700 hover:bg-slate-700"
                  >
                    Reagendado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right text-slate-300">
              Localização
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={editedBooking?.location || ""}
              onChange={handleInputChange}
              className="col-span-3 bg-slate-800 border-slate-700 text-white focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:ring-offset-0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="specialInstructions"
              className="text-right text-slate-300"
            >
              Obs. Especiais
            </Label>
            <Textarea
              id="specialInstructions"
              name="specialInstructions"
              value={editedBooking?.specialInstructions || ""}
              onChange={handleInputChange}
              className="col-span-3 bg-slate-800 border-slate-700 text-white focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:ring-offset-0"
            />
          </div>
          {/* Adicionar outros campos editáveis conforme necessário */}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={isSubmitting}
            className="bg-brand-red hover:bg-brand-red/90 text-white"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingModal;
