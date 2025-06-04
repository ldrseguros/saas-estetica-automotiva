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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface EditUserModalProps {
  user: User | null; // O usuário a ser editado (ou null se nenhum)
  isOpen: boolean; // Controla a visibilidade do modal
  onClose: () => void; // Função para fechar o modal
  onSave: (
    userId: string,
    updates: Partial<User & { password?: string }>
  ) => void; // Função para salvar as mudanças
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<
    Partial<User & { password?: string }>
  >({});
  const [password, setPassword] = useState<string>(""); // Estado separado para a senha

  useEffect(() => {
    if (user) {
      // Preenche o formulário com os dados do usuário ao abrir o modal
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role,
      });
      setPassword(""); // Limpa o campo de senha ao abrir
    } else {
      setFormData({}); // Limpa o formulário se nenhum usuário estiver selecionado
      setPassword("");
    }
  }, [user]); // Roda quando o usuário selecionado muda

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (value: "USER" | "ADMIN") => {
    setFormData({ ...formData, role: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSave = () => {
    if (user) {
      const updates: Partial<User & { password?: string }> = { ...formData };
      // Adiciona a senha ao objeto de updates APENAS se ela foi modificada
      if (password) {
        updates.password = password; // Inclui a nova senha (texto plano)
      }
      onSave(user.id, updates);
      onClose(); // Fecha o modal após salvar
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Faça as mudanças no perfil do usuário aqui. Clique em salvar quando
            terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <div className="col-span-3">
              <Select value={formData.role} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Campo opcional para nova senha */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Nova Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="col-span-3"
              placeholder="Deixe em branco para não mudar"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSave}>
            Salvar mudanças
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
