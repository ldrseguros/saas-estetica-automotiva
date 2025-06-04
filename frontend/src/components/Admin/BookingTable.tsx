import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Interface for Client Data, similar to UserData but specific for client context
interface ClientAccountData {
  id: string;
  email: string;
  name?: string; // Name might be directly on account or within client profile
}
interface ClientProfileData {
  // Representing the ClientProfile model if details are there
  id: string;
  name?: string; // Name could be here
  whatsapp?: string;
  // other client profile specific fields
}

interface ClientData {
  // This will be the structure for 'client' in Booking
  id: string; // This would be ClientProfile id
  name?: string; // Fallback name if not in account
  account: ClientAccountData; // Embedded account information
  // You can also include fields from ClientProfileData directly if your API flattens it
}

interface VehicleData {
  id: string;
  brand: string;
  model: string;
  plate: string; // Adicione outros campos do veículo conforme necessário
}

interface ServiceData {
  id: string;
  title: string; // Adicione outros campos do serviço conforme necessário
}

interface BookingServiceLink {
  id: string;
  service: ServiceData; // Detalhes do serviço
}

export interface BookingTableBooking {
  id: string;
  date: string;
  time: string;
  status: string;
  specialInstructions?: string;
  location?: string;
  client: ClientData; // Changed from 'user' to 'client'
  vehicle: VehicleData;
  services: BookingServiceLink[];
  createdAt: string;
  updatedAt: string;
}

interface BookingTableProps {
  bookings: BookingTableBooking[];
  onEditBooking: (booking: BookingTableBooking) => void;
  onDeleteBooking: (bookingId: string) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onEditBooking,
  onDeleteBooking,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviços</TableHead>
            <TableHead>Data / Hora</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                {booking.id.substring(0, 6)}...
              </TableCell>{" "}
              {/* Exibe ID curto */}
              <TableCell>
                {/* Display client's name or email */}
                {booking.client.account.name ||
                  booking.client.name ||
                  booking.client.account.email}
              </TableCell>{" "}
              {/* Exibe nome ou email do cliente */}
              <TableCell>
                {booking.services.map((bs) => bs.service.title).join(", ")}
              </TableCell>
              <TableCell>
                {/* Criar objeto Date a partir da string (pode ser interpretado como UTC), depois formatar usando componentes UTC para garantir o dia correto */}
                {(() => {
                  const dateObj = new Date(booking.date);
                  const day = dateObj.getUTCDate().toString().padStart(2, "0");
                  const month = (dateObj.getUTCMonth() + 1)
                    .toString()
                    .padStart(2, "0"); // Mês é 0-indexado
                  const year = dateObj.getUTCFullYear();
                  return `${day}/${month}/${year}`;
                })()}
                às {booking.time}
              </TableCell>
              <TableCell>
                {booking.vehicle.brand} {booking.vehicle.model} (
                {booking.vehicle.plate})
              </TableCell>
              <TableCell>
                {/* Exemplo de badge de status - Adapte os estilos */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800" // Status padrão ou outros
                  }`}
                >
                  {booking.status}
                </span>
              </TableCell>
              <TableCell>
                {/* Botões de ação */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => onEditBooking(booking)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteBooking(booking.id)}
                >
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;
