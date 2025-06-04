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

interface Client {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientTableProps {
  clients: Client[];
  onDeleteClient: (clientId: string) => void;
  onEditClient: (client: Client) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onDeleteClient,
  onEditClient,
}) => {
  // Ensure clients is an array
  const safeClients = Array.isArray(clients) ? clients : [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Criado Em</TableHead>
            <TableHead>Atualizado Em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.id}</TableCell>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.whatsapp || "Não informado"}</TableCell>
              <TableCell>
                {new Date(client.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(client.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => onEditClient(client)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Tem certeza que deseja deletar o cliente ${client.name}?`
                      )
                    ) {
                      onDeleteClient(client.id);
                    }
                  }}
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

export default ClientTable;
