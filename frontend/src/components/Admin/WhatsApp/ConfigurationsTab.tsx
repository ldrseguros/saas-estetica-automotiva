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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Settings,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Save,
} from "lucide-react";
import API from "@/lib/api";

interface ApiError {
  response?: {
    data: Record<string, unknown>;
  };
  message?: string;
}

interface WhatsAppConfig {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
  autoRespond: boolean;
  businessHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const ConfigurationsTab: React.FC = () => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    enabled: false,
    accountSid: "",
    authToken: "",
    whatsappNumber: "",
    autoRespond: true,
    businessHours: {
      enabled: true,
      start: "08:00",
      end: "18:00",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details: Record<string, unknown>;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Simular dados por enquanto - você pode implementar uma API para buscar configurações reais
      const mockConfig = {
        enabled: true,
        accountSid: "",
        authToken: "••••••••••••••••",
        whatsappNumber: "+14155238886",
        autoRespond: true,
        businessHours: {
          enabled: true,
          start: "08:00",
          end: "18:00",
        },
      };
      setConfig(mockConfig);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações do WhatsApp");
    }
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleBusinessHoursChange = (key: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Aqui você implementaria a API para salvar as configurações
      console.log("Salvando configurações:", config);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Configurações salvas com sucesso!");
      setHasChanges(false);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await API.get("/admin/whatsapp/test");
      setTestResult({
        success: true,
        message: "Conexão estabelecida com sucesso!",
        details: response.data,
      });
      toast.success("Conexão com WhatsApp funcionando!");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setTestResult({
        success: false,
        message: "Falha na conexão",
        details: apiError.response?.data || { message: "Erro desconhecido" },
      });
      toast.error("Erro ao testar conexão com WhatsApp");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure as opções básicas do WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Habilitar WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Ativar ou desativar a integração com WhatsApp
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) =>
                handleConfigChange("enabled", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Resposta Automática</Label>
              <p className="text-sm text-muted-foreground">
                Enviar respostas automáticas para mensagens recebidas
              </p>
            </div>
            <Switch
              checked={config.autoRespond}
              onCheckedChange={(checked) =>
                handleConfigChange("autoRespond", checked)
              }
              disabled={!config.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Twilio */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Twilio</CardTitle>
          <CardDescription>
            Credenciais para integração com o Twilio WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountSid">Account SID</Label>
              <Input
                id="accountSid"
                placeholder="AC..."
                value={config.accountSid}
                onChange={(e) =>
                  handleConfigChange("accountSid", e.target.value)
                }
                disabled={!config.enabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authToken">Auth Token</Label>
              <Input
                id="authToken"
                type="password"
                placeholder="••••••••••••••••"
                value={config.authToken}
                onChange={(e) =>
                  handleConfigChange("authToken", e.target.value)
                }
                disabled={!config.enabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
            <Input
              id="whatsappNumber"
              placeholder="whatsapp:+14155238886"
              value={config.whatsappNumber}
              onChange={(e) =>
                handleConfigChange("whatsappNumber", e.target.value)
              }
              disabled={!config.enabled}
            />
            <p className="text-sm text-muted-foreground">
              Número fornecido pelo Twilio no formato whatsapp:+número
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={!config.enabled || isTesting}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTesting ? "Testando..." : "Testar Conexão"}
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg border ${
                testResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`font-medium ${
                    testResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {testResult.message}
                </span>
              </div>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto text-green-800">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Configure o horário de atendimento para respostas automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">
                Respeitar Horário de Funcionamento
              </Label>
              <p className="text-sm text-muted-foreground">
                Enviar respostas automáticas apenas durante o horário de
                funcionamento
              </p>
            </div>
            <Switch
              checked={config.businessHours.enabled}
              onCheckedChange={(checked) =>
                handleBusinessHoursChange("enabled", checked)
              }
              disabled={!config.enabled || !config.autoRespond}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Abertura</Label>
              <Input
                id="startTime"
                type="time"
                value={config.businessHours.start}
                onChange={(e) =>
                  handleBusinessHoursChange("start", e.target.value)
                }
                disabled={
                  !config.enabled ||
                  !config.autoRespond ||
                  !config.businessHours.enabled
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fechamento</Label>
              <Input
                id="endTime"
                type="time"
                value={config.businessHours.end}
                onChange={(e) =>
                  handleBusinessHoursChange("end", e.target.value)
                }
                disabled={
                  !config.enabled ||
                  !config.autoRespond ||
                  !config.businessHours.enabled
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-800">
                  Alterações não salvas
                </p>
                <p className="text-sm text-amber-700">
                  Você tem alterações pendentes que precisam ser salvas.
                </p>
              </div>
              <Button
                onClick={saveConfiguration}
                disabled={isSaving}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConfigurationsTab;
