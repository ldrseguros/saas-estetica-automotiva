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
import ConfigurationsTab from "@/components/Admin/WhatsApp/ConfigurationsTab";
import API from '../../utils/apiService';

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

      const response = await API.get("/admin/whatsapp/templates", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao buscar templates");
      }

      const templatesData = await response.data;
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

      const response = await API.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao buscar clientes");
      }

      const allUsersResponse = await response.data;
      const clientsWithWhatsApp = (allUsersResponse.users || [])
        .filter(
          (user: { role: string; whatsapp?: string }) =>
            user.role === "CLIENT" && user.whatsapp
        )
        .map(
          (user: {
            id: string;
            name: string;
            email: string;
            whatsapp: string;
          }) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            whatsapp: user.whatsapp,
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

      const response = await API.post("/api/admin/whatsapp/templates", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao criar template");
      }

      const newTemplate = await response.data;
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

      const response = await API.put(
        `/api/admin/whatsapp/templates/${editingTemplate.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao atualizar template");
      }

      const updatedTemplate = response.data;
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t))
      );
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

      const response = await API.get(`/api/admin/whatsapp/templates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
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

      const response = await API.post(
        "/api/admin/whatsapp/send",
        sendMessageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao enviar mensagem");
      }

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
              <div className="space-y-6">
                <ModernCard
                  title="Enviar Mensagens"
                  description="Envie mensagens individuais ou em massa para seus clientes"
                >
                  <div className="space-y-6">
                    {/* Tipo de Envio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de Envio
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          className={`p-4 border-2 rounded-lg text-left transition-colors ${
                            sendMessageData.clientId === "individual"
                              ? "border-red-500 bg-red-50 text-red-900"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setSendMessageData((prev) => ({
                              ...prev,
                              clientId: "individual",
                            }))
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-red-600" />
                            <div>
                              <div className="font-medium">Individual</div>
                              <div className="text-sm text-gray-500">
                                Enviar para um cliente específico
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`p-4 border-2 rounded-lg text-left transition-colors ${
                            sendMessageData.clientId === "mass"
                              ? "border-red-500 bg-red-50 text-red-900"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setSendMessageData((prev) => ({
                              ...prev,
                              clientId: "mass",
                            }))
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <Zap className="h-5 w-5 text-red-600" />
                            <div>
                              <div className="font-medium">Em Massa</div>
                              <div className="text-sm text-gray-500">
                                Enviar para todos os clientes
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Seleção de Cliente (Individual) */}
                    {sendMessageData.clientId === "individual" && (
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
                          <option value="individual">
                            Selecione um cliente...
                          </option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} - {client.whatsapp}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Template ou Mensagem Personalizada */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usar Template
                      </label>
                      <select
                        onChange={(e) => {
                          const selectedTemplate = templates.find(
                            (t) => t.id === e.target.value
                          );
                          if (selectedTemplate) {
                            setSendMessageData((prev) => ({
                              ...prev,
                              message: selectedTemplate.message,
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Ou escolha um template...</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mensagem */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        rows={6}
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
                      <p className="text-xs text-gray-500 mt-1">
                        Use {"{client_name}"}, {"{service_name}"}, {"{date}"},{" "}
                        {"{time}"} para personalizar
                      </p>
                    </div>

                    {/* Preview */}
                    {sendMessageData.message && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Preview da Mensagem
                        </h4>
                        <div className="bg-white p-3 rounded-lg border max-w-xs">
                          <p className="text-sm whitespace-pre-wrap">
                            {sendMessageData.message.replace(
                              /\{(\w+)\}/g,
                              (match, key) => {
                                const replacements: Record<string, string> = {
                                  client_name: "João Silva",
                                  service_name: "Enceramento",
                                  date: "15/01/2024",
                                  time: "14:00",
                                };
                                return replacements[key] || match;
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex space-x-3">
                      <ModernButton
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSendMessageData({
                            clientId: "",
                            message: "",
                          });
                        }}
                      >
                        Limpar
                      </ModernButton>
                      <ModernButton
                        className="flex-1"
                        onClick={sendMessage}
                        disabled={
                          !sendMessageData.message.trim() ||
                          (sendMessageData.clientId !== "mass" &&
                            sendMessageData.clientId !== "individual" &&
                            !sendMessageData.clientId)
                        }
                        icon={Send}
                      >
                        Enviar Mensagem
                      </ModernButton>
                    </div>

                    {/* Estatísticas */}
                    {sendMessageData.clientId === "mass" && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Será enviado para {clients.length} clientes com
                            WhatsApp
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </ModernCard>
              </div>
            )}
            {activeTab === "settings" && <ConfigurationsTab />}
          </motion.div>
        </AnimatePresence>

        {/* Template Form Modal */}
        {showTemplateForm && renderTemplateForm()}
      </div>
    </ModernAdminLayout>
  );
};

export default WhatsAppPage;
