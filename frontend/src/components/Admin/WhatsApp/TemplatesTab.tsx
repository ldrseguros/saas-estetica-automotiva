import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API from "@/utils/apiService";
import { Checkbox } from "@/components/ui/checkbox";

interface Template {
  id: string;
  name: string;
  message: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesTabProps {
  templates: Template[];
  onCreateTemplate: (
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ) => Promise<boolean>;
  onUpdateTemplate: (
    id: string,
    template: Partial<Template>
  ) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

const TemplatesTab: React.FC<TemplatesTabProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  isLoading,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateMessage, setNewTemplateMessage] = useState("");
  const [newTemplateType, setNewTemplateType] = useState(
    "booking_confirmation"
  );

  const [editTemplateName, setEditTemplateName] = useState("");
  const [editTemplateMessage, setEditTemplateMessage] = useState("");
  const [editTemplateType, setEditTemplateType] = useState("");

  // Estado para teste direto de mensagens WhatsApp
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>("");
  const [testMessage, setTestMessage] = useState<string>("");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [useTemplateVars, setUseTemplateVars] = useState<boolean>(false);

  // Resetar formulário de criação
  const resetCreateForm = () => {
    setNewTemplateName("");
    setNewTemplateMessage("");
    setNewTemplateType("booking_confirmation");
  };

  // Inicializar formulário de edição
  const initEditForm = (template: Template) => {
    setSelectedTemplate(template);
    setEditTemplateName(template.name);
    setEditTemplateMessage(template.message);
    setEditTemplateType(template.type);
    setIsEditDialogOpen(true);
  };

  // Lidar com criação de template
  const handleCreate = async () => {
    if (!newTemplateName || !newTemplateMessage) return;

    setFormSubmitting(true);
    const success = await onCreateTemplate({
      name: newTemplateName,
      message: newTemplateMessage,
      type: newTemplateType,
    });

    setFormSubmitting(false);
    if (success) {
      resetCreateForm();
      setIsCreateDialogOpen(false);
    }
  };

  // Lidar com atualização de template
  const handleUpdate = async () => {
    if (!selectedTemplate || !editTemplateName || !editTemplateMessage) return;

    setFormSubmitting(true);
    const success = await onUpdateTemplate(selectedTemplate.id, {
      name: editTemplateName,
      message: editTemplateMessage,
      type: editTemplateType,
    });

    setFormSubmitting(false);
    if (success) {
      setIsEditDialogOpen(false);
    }
  };

  // Lidar com exclusão de template
  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setFormSubmitting(true);
    const success = await onDeleteTemplate(selectedTemplate.id);

    setFormSubmitting(false);
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };

  // Copiar conteúdo do template para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const templateTypeOptions = [
    { value: "booking_confirmation", label: "Confirmação de Agendamento" },
    { value: "booking_reminder", label: "Lembrete de Agendamento" },
    { value: "service_completed", label: "Serviço Concluído" },
    { value: "promotion", label: "Promoção" },
    { value: "custom", label: "Personalizado" },
  ];

  // Função para testar conexão com WhatsApp
  const handleTestConnection = async () => {
    try {
      const response = await API.get("/admin/whatsapp/test");
      toast.success("Conexão com WhatsApp configurada!");
      setTestResult(response.data);
    } catch (err) {
      console.error("Erro ao testar conexão WhatsApp:", err);
      toast.error("Erro ao testar conexão WhatsApp");
      setTestResult(err.response?.data || { message: "Erro desconhecido" });
    }
  };

  // Função para enviar mensagem de teste
  const handleSendTestMessage = async () => {
    if (!testPhoneNumber || !testMessage) {
      toast.error("Número de telefone e mensagem são obrigatórios");
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const response = await API.post("/admin/whatsapp/test-send", {
        phoneNumber: testPhoneNumber,
        message: testMessage,
        useTemplateVars: useTemplateVars,
      });
      toast.success("Mensagem de teste enviada com sucesso!");
      setTestResult(response.data);
    } catch (err) {
      console.error("Erro ao enviar mensagem de teste:", err);
      toast.error("Erro ao enviar mensagem de teste");
      setTestResult(err.response?.data || { message: "Erro desconhecido" });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Templates de Mensagens</CardTitle>
              <CardDescription>
                Gerencie templates para mensagens automáticas via WhatsApp
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-brand-red hover:bg-brand-red/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="spinner"></div>
              <p className="mt-2 text-muted-foreground">
                Carregando templates...
              </p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">
                Nenhum template encontrado
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Criar Primeiro Template
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      {templateTypeOptions.find(
                        (t) => t.value === template.type
                      )?.label || template.type}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {template.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(template.message)}
                          title="Copiar mensagem"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => initEditForm(template)}
                          title="Editar template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Excluir template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Template</DialogTitle>
            <DialogDescription>
              Crie um novo template para mensagens automáticas via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                placeholder="Ex: Confirmação de Agendamento"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Mensagem</Label>
              <Select
                value={newTemplateType}
                onValueChange={setNewTemplateType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <div className="text-xs text-muted-foreground mb-2">
                Use "{"{"}
                {"{"}client_name{"}"}
                {"}"}", "{"{"}
                {"{"}service_name{"}"}
                {"}"}", "{"{"}
                {"{"}date{"}"}
                {"}"}", "{"{"}
                {"{"}time{"}"}
                {"}"}" como variáveis substituíveis.
              </div>
              <Textarea
                id="message"
                placeholder="Olá {{client_name}}, seu agendamento para {{service_name}} foi confirmado para {{date}} às {{time}}."
                rows={5}
                value={newTemplateMessage}
                onChange={(e) => setNewTemplateMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-brand-red hover:bg-brand-red/90"
              disabled={
                !newTemplateName || !newTemplateMessage || formSubmitting
              }
            >
              {formSubmitting ? "Criando..." : "Criar Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Atualize as informações deste template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Template</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Confirmação de Agendamento"
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo de Mensagem</Label>
              <Select
                value={editTemplateType}
                onValueChange={setEditTemplateType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-message">Mensagem</Label>
              <div className="text-xs text-muted-foreground mb-2">
                Use "{"{"}
                {"{"}client_name{"}"}
                {"}"}", "{"{"}
                {"{"}service_name{"}"}
                {"}"}", "{"{"}
                {"{"}date{"}"}
                {"}"}", "{"{"}
                {"{"}time{"}"}
                {"}"}" como variáveis substituíveis.
              </div>
              <Textarea
                id="edit-message"
                placeholder="Olá {{client_name}}, seu agendamento para {{service_name}} foi confirmado para {{date}} às {{time}}."
                rows={5}
                value={editTemplateMessage}
                onChange={(e) => setEditTemplateMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-brand-red hover:bg-brand-red/90"
              disabled={
                !editTemplateName || !editTemplateMessage || formSubmitting
              }
            >
              {formSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "
              {selectedTemplate?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={formSubmitting}
            >
              {formSubmitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Testar WhatsApp</CardTitle>
          <CardDescription>
            Teste a conexão com WhatsApp e envie mensagens de teste diretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mb-4"
              onClick={handleTestConnection}
            >
              Testar Conexão
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Número de WhatsApp para Teste</Label>
              <Input
                id="test-phone"
                placeholder="Ex: 62996479723"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite o número sem o +55 (DDD + número)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-message">Mensagem de Teste</Label>
              <Textarea
                id="test-message"
                placeholder="Digite a mensagem de teste"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-template-vars"
                checked={useTemplateVars}
                onCheckedChange={(checked) =>
                  setUseTemplateVars(checked as boolean)
                }
              />
              <Label htmlFor="use-template-vars">
                Substituir variáveis de template ("{"{{client_name}}"}", "
                {"{{service_name}}"}", etc.)
              </Label>
            </div>

            <Button
              className="w-full"
              onClick={handleSendTestMessage}
              disabled={isSendingTest || !testPhoneNumber || !testMessage}
            >
              {isSendingTest ? "Enviando..." : "Enviar Mensagem de Teste"}
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 border rounded-md bg-slate-50">
              <h4 className="font-medium mb-2">Resultado do Teste:</h4>
              <pre className="text-xs overflow-auto p-2 bg-slate-100 rounded">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatesTab;
