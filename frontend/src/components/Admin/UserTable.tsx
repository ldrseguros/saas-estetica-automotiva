import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Importe componentes de UI para tabela do Shadcn UI
import { Button } from "@/components/ui/button"; // Importe o componente Button

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN"; // Use as roles definidas no backend
  createdAt: string;
  updatedAt: string;
}

interface UserTableProps {
  users: User[];
  onDeleteUser: (userId: string) => void; // Adicione prop para deletar usuário
  onEditUser: (user: User) => void; // Adicione prop para editar usuário
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onDeleteUser,
  onEditUser,
}) => {
  // Ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Criado Em</TableHead>
            <TableHead>Atualizado Em</TableHead>
            <TableHead>Ações</TableHead>{" "}
            {/* Coluna para botões de editar/deletar */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(user.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {/* Botões de ação */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => onEditUser(user)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Tem certeza que deseja deletar o usuário ${user.name}?`
                      )
                    ) {
                      onDeleteUser(user.id);
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

export default UserTable;
