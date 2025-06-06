import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Image,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  BarChart3,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";

interface Template {
  id: string;
  name: string;
  message: string;
  type: "confirmation" | "reminder" | "followup" | "custom";
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
}

interface TemplateFormData {
  name: string;
  message: string;
  type: "confirmation" | "reminder" | "followup" | "custom";
}

interface SendMessageData {
  clientId: string;
  message: string;
  mediaUrls?: string[];
  templateData?: Record<string, string>;
}

const WhatsAppPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    message: "",
    type: "custom",
  });
  const [sendMessageData, setSendMessageData] = useState<SendMessageData>({
    clientId: "",
    message: "",
  });

  const fetchTemplates = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch("/api/admin/whatsapp/templates", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar templates");
      }

      const templatesData = await response.json();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Erro ao buscar templates:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error(`Erro ao carregar templates: ${errorMessage}`);
    }
  };

  const fetchClients = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar clientes");
      }

      const allUsers = await response.json();
      const clientsWithWhatsApp = allUsers
        .filter(
          (user: { role: string; clientProfile?: { whatsapp?: string } }) =>
            user.role === "CLIENT" && user.clientProfile?.whatsapp
        )
        .map(
          (user: {
            id: string;
            name: string;
            email: string;
            clientProfile: { whatsapp: string };
          }) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            whatsapp: user.clientProfile.whatsapp,
          })
        );

      setClients(clientsWithWhatsApp);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar clientes: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([fetchTemplates(), fetchClients()]);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const createTemplate = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch("/api/admin/whatsapp/templates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar template");
      }

      const newTemplate = await response.json();
      setTemplates((prev) => [...prev, newTemplate]);
      setShowTemplateForm(false);
      setFormData({ name: "", message: "", type: "custom" });
      toast.success("Template criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar template:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao criar template: ${errorMessage}`);
    }
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `/api/admin/whatsapp/templates/${editingTemplate.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar template");
      }

      const updatedTemplate = await response.json();
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t))
      );
      setEditingTemplate(null);
      setShowTemplateForm(false);
      setFormData({ name: "", message: "", type: "custom" });
      toast.success("Template atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao atualizar template: ${errorMessage}`);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`/api/admin/whatsapp/templates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar template");
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar template:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao deletar template: ${errorMessage}`);
    }
  };

  const sendMessage = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendMessageData),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const result = await response.json();
      setSendMessageData({ clientId: "", message: "" });
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao enviar mensagem: ${errorMessage}`);
    }
  };

  const getTemplateTypeInfo = (type: string) => {
    switch (type) {
      case "confirmation":
        return {
          label: "Confirmação",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "reminder":
        return {
          label: "Lembrete",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-4 w-4" />,
        };
      case "followup":
        return {
          label: "Follow-up",
          color: "bg-blue-100 text-blue-800",
          icon: <MessageSquare className="h-4 w-4" />,
        };
      default:
        return {
          label: "Personalizado",
          color: "bg-gray-100 text-gray-800",
          icon: <FileText className="h-4 w-4" />,
        };
    }
  };

  const startEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      message: template.message,
      type: template.type,
    });
    setShowTemplateForm(true);
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setShowTemplateForm(false);
    setFormData({ name: "", message: "", type: "custom" });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mensagens Enviadas"
          value="--"
          change="Implementar relatórios"
          changeType="neutral"
          icon={Send}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Templates Ativos"
          value={templates.length}
          icon={FileText}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Clientes com WhatsApp"
          value={clients.length}
          icon={Users}
          gradient="from-red-500 to-red-600"
        />
        <StatCard
          title="Taxa de Entrega"
          value="--"
          change="Implementar relatórios"
          changeType="neutral"
          icon={BarChart3}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard
          title="Envio Rápido"
          description="Envie mensagens personalizadas"
          icon={Zap}
          hoverable={false}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Cliente
              </label>
              <select
                value={sendMessageData.clientId}
                onChange={(e) =>
                  setSendMessageData((prev) => ({
                    ...prev,
                    clientId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Escolha um cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.whatsapp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                rows={3}
                value={sendMessageData.message}
                onChange={(e) =>
                  setSendMessageData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder="Digite sua mensagem..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <ModernButton
              className="w-full"
              icon={Send}
              onClick={sendMessage}
              disabled={
                !sendMessageData.clientId || !sendMessageData.message.trim()
              }
            >
              Enviar Mensagem
            </ModernButton>
          </div>
        </ModernCard>

        <ModernCard
          title="Templates Recentes"
          description="Seus templates mais usados"
          icon={FileText}
          hoverable={false}
        >
          <div className="space-y-3">
            {templates.slice(0, 3).map((template) => {
              const typeInfo = getTemplateTypeInfo(template.type);
              return (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                      {typeInfo.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {template.name}
                      </p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </div>
                    </div>
                  </div>
                  <ModernButton variant="ghost" size="sm" icon={Edit}>
                    Usar
                  </ModernButton>
                </div>
              );
            })}
          </div>
        </ModernCard>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Templates de Mensagens
          </h2>
          <p className="text-gray-600">Gerencie seus templates automatizados</p>
        </div>
        <ModernButton icon={Plus} onClick={() => setShowTemplateForm(true)}>
          Novo Template
        </ModernButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => {
          const typeInfo = getTemplateTypeInfo(template.type);
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}
                >
                  {typeInfo.icon}
                  <span className="ml-1">{typeInfo.label}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600"
                    onClick={() => startEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-red-600"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.message}
              </p>

              <div className="flex space-x-2">
                <ModernButton variant="outline" size="sm" className="flex-1">
                  Visualizar
                </ModernButton>
                <ModernButton size="sm" className="flex-1">
                  Usar Template
                </ModernButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderTemplateForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingTemplate ? "Editar Template" : "Novo Template"}
          </h3>
          <button
            onClick={cancelEdit}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Template
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Confirmação de Agendamento"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as
                    | "confirmation"
                    | "reminder"
                    | "followup"
                    | "custom",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="custom">Personalizado</option>
              <option value="confirmation">Confirmação</option>
              <option value="reminder">Lembrete</option>
              <option value="followup">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Digite a mensagem do template..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {"{client_name}"}, {"{service_name}"}, {"{date}"}, {"{time}"}{" "}
              para personalizar
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <ModernButton
              variant="outline"
              className="flex-1"
              onClick={cancelEdit}
            >
              Cancelar
            </ModernButton>
            <ModernButton
              className="flex-1"
              onClick={editingTemplate ? updateTemplate : createTemplate}
              disabled={!formData.name.trim() || !formData.message.trim()}
            >
              {editingTemplate ? "Atualizar" : "Criar"}
            </ModernButton>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <ModernAdminLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              WhatsApp Business
            </h1>
            <p className="text-gray-600 mt-1">
              Automação e comunicação com clientes
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Conectado</span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "templates", label: "Templates", icon: FileText },
              { id: "send", label: "Enviar Mensagens", icon: Send },
              { id: "settings", label: "Configurações", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`mr-2 h-4 w-4 ${
                      activeTab === tab.id
                        ? "text-red-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "templates" && renderTemplates()}
            {activeTab === "send" && (
              <ModernCard
                title="Enviar Mensagens"
                description="Função em desenvolvimento"
              >
                <p className="text-gray-500">
                  Esta funcionalidade será implementada em breve.
                </p>
              </ModernCard>
            )}
            {activeTab === "settings" && (
              <ModernCard
                title="Configurações"
                description="Configurações do WhatsApp Business"
              >
                <p className="text-gray-500">
                  Esta funcionalidade será implementada em breve.
                </p>
              </ModernCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Template Form Modal */}
        {showTemplateForm && renderTemplateForm()}
      </div>
    </ModernAdminLayout>
  );
};

export default WhatsAppPage;
