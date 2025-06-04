import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Search, Image, FileUp, Send } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  message: string;
  type: string;
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

interface SendMessageTabProps {
  clients: Client[];
  templates: Template[];
  onSendMessage: (
    clientId: string,
    message: string,
    mediaUrls?: string[],
    templateData?: TemplateData
  ) => Promise<boolean>;
  isLoading: boolean;
}

const SendMessageTab: React.FC<SendMessageTabProps> = ({
  clients,
  templates,
  onSendMessage,
  isLoading,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [useCustomMessage, setUseCustomMessage] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string }[]
  >([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Filtrar clientes com base no termo de busca
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.whatsapp && client.whatsapp.includes(searchTerm))
  );

  // Quando um template é selecionado, preencher a mensagem
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setMessage(template.message);
      }
    }
  }, [selectedTemplateId, templates]);

  // Limpar formulário
  const resetForm = () => {
    setSelectedClientId("");
    setSelectedTemplateId("");
    setMessage("");
    setCustomMessage("");
    setUseCustomMessage(false);
    setUploadedFiles([]);
  };

  // Simular upload de arquivo (em uma implementação real, isso faria upload para um servidor)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));

      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast.success(`${e.target.files.length} arquivo(s) adicionado(s)`);

      // Limpar input
      e.target.value = "";
    }
  };

  // Remover arquivo
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    URL.revokeObjectURL(newFiles[index].url); // Liberar URL
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    const clientId = selectedClientId;
    const selectedClient = clients.find((c) => c.id === clientId);

    if (!clientId) {
      toast.error("Selecione um cliente");
      return;
    }

    if (!selectedClient?.whatsapp) {
      toast.error("O cliente selecionado não possui número de WhatsApp");
      return;
    }

    if (
      (!useCustomMessage && !message) ||
      (useCustomMessage && !customMessage)
    ) {
      toast.error("Digite uma mensagem");
      return;
    }

    setIsSending(true);

    try {
      const messageToSend = useCustomMessage ? customMessage : message;
      const mediaUrls = uploadedFiles.map((file) => file.url);

      // Preparar dados para substituição de variáveis no template
      const templateData: TemplateData = {
        client_name: selectedClient.name || "Cliente",
        // Aqui você pode adicionar mais variáveis no futuro
        service_name: "Serviço", // Valor padrão
        date: new Date().toLocaleDateString("pt-BR"), // Data atual como padrão
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }), // Hora atual como padrão
      };

      // Nota: O código que fazia referência a selectedBooking foi removido pois
      // essa variável não existe. Se você precisar usar dados de agendamento,
      // você precisará passar essa informação como prop ou buscar de uma API.

      const success = await onSendMessage(
        clientId,
        messageToSend,
        mediaUrls.length > 0 ? mediaUrls : undefined,
        templateData
      );

      if (success) {
        toast.success(
          `Mensagem enviada com sucesso para ${selectedClient.name}`
        );
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Mensagem via WhatsApp</CardTitle>
        <CardDescription>
          Selecione um cliente e envie uma mensagem via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Seleção de cliente */}
          <div className="space-y-2">
            <Label htmlFor="client-search">Buscar Cliente</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="client-search"
                placeholder="Nome, email ou telefone"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="client-select">Selecionar Cliente</Label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}{" "}
                      {client.whatsapp
                        ? `(${client.whatsapp})`
                        : "(Sem WhatsApp)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClientId && (
                <div className="mt-2 text-sm">
                  {(() => {
                    const client = clients.find(
                      (c) => c.id === selectedClientId
                    );
                    if (!client?.whatsapp) {
                      return (
                        <span className="text-red-500">
                          Este cliente não possui número de WhatsApp registrado.
                        </span>
                      );
                    }
                    return (
                      <span className="text-green-500">
                        Enviar para {client.name} ({client.whatsapp})
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Mensagem */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-custom"
                checked={useCustomMessage}
                onChange={() => setUseCustomMessage(!useCustomMessage)}
                className="rounded"
              />
              <Label htmlFor="use-custom">Usar mensagem personalizada</Label>
            </div>

            {!useCustomMessage ? (
              <div className="space-y-2">
                <Label htmlFor="template-select">Selecionar Template</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplateId && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="preview">Preview da Mensagem</Label>
                    <Textarea
                      id="preview"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Você pode editar o texto acima para personalizar o
                      template.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="custom-message">Mensagem Personalizada</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Digite sua mensagem personalizada..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={5}
                />
              </div>
            )}
          </div>

          {/* Upload de arquivos */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Anexar Arquivos (Opcional)</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                type="button"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Selecionar Arquivos
              </Button>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
              />
              <span className="text-sm text-muted-foreground">
                {uploadedFiles.length} arquivo(s) selecionado(s)
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group border rounded-md overflow-hidden"
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remover
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-white text-xs truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão Enviar */}
          <Button
            className="w-full bg-brand-red hover:bg-brand-red/90"
            disabled={
              isSending ||
              isLoading ||
              !selectedClientId ||
              (useCustomMessage ? !customMessage : !message)
            }
            onClick={handleSendMessage}
          >
            {isSending ? (
              "Enviando..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendMessageTab;
