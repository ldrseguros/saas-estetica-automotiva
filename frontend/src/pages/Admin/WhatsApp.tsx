import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Image, Users, Settings } from "lucide-react";
import TemplatesTab from "@/components/Admin/WhatsApp/TemplatesTab";
import SendMessageTab from "@/components/Admin/WhatsApp/SendMessageTab";
import ReportsTab from "@/components/Admin/WhatsApp/ReportsTab";
import { toast } from "sonner";
import API from "@/utils/apiService";
import AdminLayout from "@/components/Admin/AdminLayout";

interface Template {
  id: string;
  name: string;
  message: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
}

// Interface para substituição de variáveis no template
interface TemplateData {
  client_name: string;
  service_name?: string;
  date?: string;
  time?: string;
  [key: string]: string | undefined;
}

const WhatsAppPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar templates e clientes quando o componente montar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Buscar templates
        const templatesResponse = await API.get("/admin/whatsapp/templates");
        setTemplates(templatesResponse.data);

        // Buscar clientes
        const clientsResponse = await API.get("/admin/users?role=CLIENT");
        setClients(clientsResponse.data.users || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Falha ao carregar dados. Por favor, tente novamente.");
        toast.error("Erro ao carregar dados de WhatsApp");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funções de manipulação de templates
  const handleCreateTemplate = async (
    newTemplate: Omit<Template, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await API.post("/admin/whatsapp/templates", newTemplate);

      setTemplates([response.data, ...templates]);
      toast.success("Template criado com sucesso");
      return true;
    } catch (err) {
      console.error("Erro ao criar template:", err);
      toast.error("Erro ao criar template");
      return false;
    }
  };

  const handleUpdateTemplate = async (
    id: string,
    updatedTemplate: Partial<Template>
  ) => {
    try {
      const response = await API.put(
        `/admin/whatsapp/templates/${id}`,
        updatedTemplate
      );

      setTemplates(templates.map((t) => (t.id === id ? response.data : t)));
      toast.success("Template atualizado com sucesso");
      return true;
    } catch (err) {
      console.error("Erro ao atualizar template:", err);
      toast.error("Erro ao atualizar template");
      return false;
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await API.delete(`/admin/whatsapp/templates/${id}`);

      setTemplates(templates.filter((t) => t.id !== id));
      toast.success("Template excluído com sucesso");
      return true;
    } catch (err) {
      console.error("Erro ao excluir template:", err);
      toast.error("Erro ao excluir template");
      return false;
    }
  };

  // Função para enviar mensagem WhatsApp
  const handleSendMessage = async (
    clientId: string,
    message: string,
    mediaUrls?: string[],
    templateData?: TemplateData
  ) => {
    try {
      await API.post("/admin/whatsapp/send", {
        clientId,
        message,
        mediaUrls,
        templateData,
      });

      toast.success("Mensagem enviada com sucesso");
      return true;
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      toast.error("Erro ao enviar mensagem WhatsApp");
      return false;
    }
  };

  // Função para criar relatório de serviço
  const handleCreateReport = async (
    bookingId: string,
    beforePhotos: string[],
    afterPhotos: string[],
    comments: string
  ) => {
    try {
      await API.post("/admin/whatsapp/reports", {
        bookingId,
        beforePhotos,
        afterPhotos,
        comments,
      });

      toast.success("Relatório criado com sucesso");
      return true;
    } catch (err) {
      console.error("Erro ao criar relatório:", err);
      toast.error("Erro ao criar relatório de serviço");
      return false;
    }
  };

  // Função para fazer upload de foto
  const handleUploadPhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await API.post("/admin/whatsapp/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.imageUrl;
    } catch (err) {
      console.error("Erro ao fazer upload de foto:", err);
      toast.error("Erro ao fazer upload de foto");
      throw err;
    }
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">WhatsApp Business</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Settings size={18} /> Templates
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <MessageSquare size={18} /> Enviar Mensagem
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Image size={18} /> Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <TemplatesTab
              templates={templates}
              onCreateTemplate={handleCreateTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="send">
            <SendMessageTab
              clients={clients}
              templates={templates}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab
              onCreateReport={handleCreateReport}
              onUploadPhoto={handleUploadPhoto}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default WhatsAppPage;
