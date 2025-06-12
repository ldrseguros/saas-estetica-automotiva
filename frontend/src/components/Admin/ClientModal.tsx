import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import ModernButton from "./ModernButton";

interface Cliente {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Cliente>) => Promise<void>;
  client?: Cliente | null;
  isEditing?: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        whatsapp: client.whatsapp || "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        password: "",
      });
    }
  }, [isEditing, client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData: {
        name: string;
        email: string;
        role: string;
        whatsapp?: string;
        password?: string;
      } = {
        name: formData.name,
        email: formData.email,
        role: "CLIENT",
        whatsapp: formData.whatsapp || undefined,
      };

      if (!isEditing && formData.password) {
        clientData.password = formData.password;
      }

      await onSave(clientData);
      onClose();
      toast.success(
        isEditing
          ? "Cliente atualizado com sucesso!"
          : "Cliente criado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(
        isEditing ? "Erro ao atualizar cliente" : "Erro ao criar cliente"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="email@exemplo.com"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Digite uma senha"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <ModernButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </ModernButton>
            <ModernButton
              type="submit"
              disabled={loading}
              icon={Save}
              className="flex-1"
            >
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </ModernButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ClientModal;
