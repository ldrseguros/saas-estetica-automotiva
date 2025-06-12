import React, { useState } from "react";
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
import { toast } from "sonner";
import { Mail, TestTube, CheckCircle, AlertTriangle } from "lucide-react";
import API from "@/lib/api";

interface EmailTestResult {
  success: boolean;
  message: string;
  config?: Record<string, string>;
  result?: unknown;
}

const EmailTestCard: React.FC = () => {
  const [testEmail, setTestEmail] = useState("");
  const [businessName, setBusinessName] = useState("Minha Estética");
  const [isTesting, setIsTesting] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);
  const [configResult, setConfigResult] = useState<EmailTestResult | null>(
    null
  );

  const testEmailConfig = async () => {
    setIsCheckingConfig(true);
    setConfigResult(null);

    try {
      const response = await API.get("/admin/email/test-config");
      setConfigResult(response.data);

      if (response.data.success) {
        toast.success("Configuração de email válida!");
      } else {
        toast.warning("Configuração de email incompleta");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setConfigResult({
        success: false,
        message: errorMessage,
      });
      toast.error("Erro ao verificar configuração de email");
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Digite um email para teste");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await API.post("/admin/email/test-send", {
        to: testEmail,
        businessName,
      });

      setTestResult(response.data);
      toast.success("Email de teste enviado com sucesso!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setTestResult({
        success: false,
        message: errorMessage,
      });
      toast.error("Erro ao enviar email de teste");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Teste de Email
        </CardTitle>
        <CardDescription>
          Verifique a configuração e teste o envio de emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verificar Configuração */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Verificar Configuração</h4>
              <p className="text-sm text-muted-foreground">
                Teste se as credenciais SMTP estão configuradas corretamente
              </p>
            </div>
            <Button
              variant="outline"
              onClick={testEmailConfig}
              disabled={isCheckingConfig}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isCheckingConfig ? "Verificando..." : "Verificar"}
            </Button>
          </div>

          {configResult && (
            <div
              className={`p-4 rounded-lg border ${
                configResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {configResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`font-medium ${
                    configResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {configResult.message}
                </span>
              </div>
              {configResult.config && (
                <div className="text-xs">
                  <strong>Configuração:</strong>
                  <ul className="mt-1 space-y-1">
                    {Object.entries(configResult.config).map(([key, value]) => (
                      <li key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span
                          className={
                            value === "Configurado"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enviar Email de Teste */}
        <div className="space-y-4">
          <h4 className="font-medium">Enviar Email de Teste</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email de Destino</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu-email@gmail.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-name">Nome da Estética</Label>
              <Input
                id="business-name"
                placeholder="Minha Estética"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={sendTestEmail}
            disabled={isTesting || !testEmail}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isTesting ? "Enviando..." : "Enviar Email de Teste"}
          </Button>

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
              {testResult.result && (
                <pre className="text-xs bg-white text-green-800 p-2 rounded border overflow-auto">
                  {JSON.stringify(testResult.result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Configuração Necessária
          </h4>
          <p className="text-sm text-blue-700 mb-2">
            Para enviar emails, configure as seguintes variáveis no arquivo
            .env:
          </p>
          <code className="text-xs bg-blue-100 text-black p-2 rounded block">
            EMAIL_HOST="smtp.gmail.com"
            <br />
            EMAIL_PORT=587
            <br />
            EMAIL_USER="seu-email@gmail.com"
            <br />
            EMAIL_PASS="sua-senha-app"
          </code>
          <p className="text-xs text-blue-600 mt-2">
            Para Gmail, use uma senha de aplicativo em vez da senha normal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestCard;
