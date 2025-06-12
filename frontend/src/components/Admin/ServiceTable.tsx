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
import { Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";

interface Service {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  duration: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceTableProps {
  services: Service[];
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onEditService,
  onDeleteService,
}) => {
  // Função para formatar a duração em horas e minutos mais legível
  const formatDuration = (minutes: number | null | undefined): string => {
    // Verificar se o valor é nulo, indefinido ou NaN
    if (minutes === null || minutes === undefined || isNaN(Number(minutes))) {
      return "N/A";
    }

    // Converter para número para garantir (caso seja uma string)
    const mins = Number(minutes);

    if (mins < 60) {
      return `${mins} min`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMinutes = mins % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-lg">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow>
            <TableHead className="text-slate-300">Serviço</TableHead>
            <TableHead className="text-slate-300">Descrição</TableHead>
            <TableHead className="text-slate-300 text-right">Preço</TableHead>
            <TableHead className="text-slate-300 text-right">Duração</TableHead>
            <TableHead className="text-slate-300 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-slate-400"
              >
                Nenhum serviço encontrado.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow
                key={service.id}
                className="border-b border-slate-700 hover:bg-slate-800/40"
              >
                <TableCell className="font-medium text-white">
                  {service.title}
                </TableCell>
                <TableCell className="text-slate-300 max-w-[280px] truncate">
                  {service.description || "Sem descrição"}
                </TableCell>
                <TableCell className="text-right text-emerald-400 font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(service.price)}
                  </div>
                </TableCell>
                <TableCell className="text-right text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-4 w-4" />
                    <Badge
                      variant="outline"
                      className="bg-slate-900/20 border-slate-500/30 text-slate-400 font-medium px-2"
                    >
                      {formatDuration(service.duration)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditService(service)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteService(service.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceTable;
