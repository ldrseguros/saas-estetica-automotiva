import React from "react";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import EmailTestCard from "@/components/Admin/EmailTestCard";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const EmailPage: React.FC = () => {
  return (
    <ModernAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3"
        >
          <Mail className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teste de Email</h1>
            <p className="text-gray-600 mt-1">
              Configure e teste o sistema de emails
            </p>
          </div>
        </motion.div>

        {/* Email Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EmailTestCard />
        </motion.div>

        {/* Instruções */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-900 mb-3">
            📧 Como configurar o email:
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>
              <strong>1. Gmail:</strong> Configure EMAIL_HOST="smtp.gmail.com",
              EMAIL_PORT=587, e use uma senha de app
            </p>
            <p>
              <strong>2. Outlook:</strong> Configure
              EMAIL_HOST="smtp-mail.outlook.com", EMAIL_PORT=587
            </p>
            <p>
              <strong>3. Mailtrap (teste):</strong> Configure
              EMAIL_HOST="live.smtp.mailtrap.io", EMAIL_PORT=587
            </p>
            <p className="mt-3 text-sm">
              💡 <strong>Dica:</strong> Se não configurar as variáveis de email,
              o sistema usará modo simulação (emails aparecerão no console do
              backend)
            </p>
          </div>
        </motion.div>
      </div>
    </ModernAdminLayout>
  );
};

export default EmailPage;
