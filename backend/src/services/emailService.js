import nodemailer from "nodemailer";

// Configuração do transporter
const createTransporter = () => {
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailHost || !emailUser || !emailPass) {
    console.warn(
      "Configurações de email não encontradas. Usando modo de simulação."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort) || 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// Templates de email
const emailTemplates = {
  bookingConfirmation: {
    subject: "Confirmação de Agendamento - {businessName}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Agendamento Confirmado!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Olá, {clientName}!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Seu agendamento foi confirmado com sucesso. Confira os detalhes:
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #dc2626; margin-top: 0;">Detalhes do Agendamento</h3>
            <p><strong>Serviço:</strong> {serviceName}</p>
            <p><strong>Data:</strong> {date}</p>
            <p><strong>Horário:</strong> {time}</p>
            <p><strong>Veículo:</strong> {vehicleInfo}</p>
            <p><strong>Valor:</strong> R$ {price}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Em caso de dúvidas, entre em contato conosco.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px;">
              {businessName} - {businessPhone}
            </p>
          </div>
        </div>
      </div>
    `,
  },

  bookingReminder: {
    subject: "Lembrete: Seu agendamento é amanhã - {businessName}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Lembrete de Agendamento</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Olá, {clientName}!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Este é um lembrete de que você tem um agendamento marcado para amanhã:
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #059669; margin-top: 0;">Detalhes do Agendamento</h3>
            <p><strong>Serviço:</strong> {serviceName}</p>
            <p><strong>Data:</strong> {date}</p>
            <p><strong>Horário:</strong> {time}</p>
            <p><strong>Veículo:</strong> {vehicleInfo}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Aguardamos você! Em caso de cancelamento, entre em contato conosco com antecedência.
          </p>
        </div>
      </div>
    `,
  },

  serviceCompleted: {
    subject: "Serviço Concluído - {businessName}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Serviço Concluído!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Olá, {clientName}!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Seu serviço foi concluído com sucesso! Esperamos que tenha ficado satisfeito com o resultado.
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #7c3aed; margin-top: 0;">Detalhes do Serviço</h3>
            <p><strong>Serviço:</strong> {serviceName}</p>
            <p><strong>Data:</strong> {date}</p>
            <p><strong>Veículo:</strong> {vehicleInfo}</p>
            <p><strong>Valor:</strong> R$ {price}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Agradecemos pela confiança! Volte sempre.
          </p>
        </div>
      </div>
    `,
  },

  subscriptionConfirmation: {
    subject: "Bem-vindo ao {planName} - {businessName}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Assinatura Ativada!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Olá, {ownerName}!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Parabéns! Sua assinatura do plano <strong>{planName}</strong> foi ativada com sucesso. 
            Agora você tem acesso a todas as funcionalidades do nosso sistema de gestão para estética automotiva.
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #059669; margin-top: 0;">Detalhes da Assinatura</h3>
            <p><strong>Plano:</strong> {planName}</p>
            <p><strong>Valor:</strong> R$ {planPrice}/mês</p>
            <p><strong>Data de início:</strong> {startDate}</p>
            <p><strong>Próxima cobrança:</strong> {nextBilling}</p>
            <p><strong>Funcionários permitidos:</strong> {maxEmployees}</p>
            <p><strong>Clientes permitidos:</strong> {maxClients}</p>
          </div>

          <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="color: #047857; margin-top: 0;">🚀 Próximos passos:</h3>
            <ul style="color: #065f46; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Configure seus serviços e preços</li>
              <li style="margin-bottom: 8px;">Cadastre seus funcionários</li>
              <li style="margin-bottom: 8px;">Adicione seus primeiros clientes</li>
              <li style="margin-bottom: 8px;">Configure as integrações WhatsApp e Email</li>
              <li style="margin-bottom: 8px;">Personalize as cores da sua estética</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{dashboardUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Acessar Painel Administrativo
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Precisa de ajuda? Nossa equipe de suporte está disponível em <strong>suporte@saasestetica.com</strong>
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px;">
              SaaS Estética Automotiva - Sistema de Gestão Completo
            </p>
          </div>
        </div>
      </div>
    `,
  },
};

// Função para substituir variáveis no template
const replaceVariables = (template, variables) => {
  let subject = template.subject;
  let html = template.html;

  Object.keys(variables).forEach((key) => {
    const value = variables[key] || "";
    const regex = new RegExp(`{${key}}`, "g");
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
  });

  return { subject, html };
};

// Função principal para enviar email
export const sendEmail = async (to, templateType, variables) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      // Modo simulação
      console.log("📧 [EMAIL SIMULADO]");
      console.log(`Para: ${to}`);
      console.log(`Template: ${templateType}`);
      console.log(`Variáveis:`, variables);
      return { success: true, simulated: true };
    }

    const template = emailTemplates[templateType];
    if (!template) {
      throw new Error(`Template ${templateType} não encontrado`);
    }

    const { subject, html } = replaceVariables(template, variables);

    const mailOptions = {
      from: `"${variables.businessName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error(`Falha no envio de email: ${error.message}`);
  }
};

// Funções específicas para cada tipo de email
export const sendBookingConfirmation = async (clientEmail, bookingData) => {
  const variables = {
    clientName: bookingData.clientName,
    serviceName: bookingData.serviceName,
    date: bookingData.date,
    time: bookingData.time,
    vehicleInfo: bookingData.vehicleInfo,
    price: bookingData.price,
    businessName: bookingData.businessName,
    businessPhone: bookingData.businessPhone,
  };

  return await sendEmail(clientEmail, "bookingConfirmation", variables);
};

export const sendBookingReminder = async (clientEmail, bookingData) => {
  const variables = {
    clientName: bookingData.clientName,
    serviceName: bookingData.serviceName,
    date: bookingData.date,
    time: bookingData.time,
    vehicleInfo: bookingData.vehicleInfo,
    businessName: bookingData.businessName,
  };

  return await sendEmail(clientEmail, "bookingReminder", variables);
};

export const sendServiceCompleted = async (clientEmail, serviceData) => {
  const variables = {
    clientName: serviceData.clientName,
    serviceName: serviceData.serviceName,
    date: serviceData.date,
    vehicleInfo: serviceData.vehicleInfo,
    price: serviceData.price,
    businessName: serviceData.businessName,
  };

  return await sendEmail(clientEmail, "serviceCompleted", variables);
};

export const sendSubscriptionConfirmation = async (
  ownerEmail,
  subscriptionData
) => {
  const variables = {
    ownerName: subscriptionData.ownerName,
    planName: subscriptionData.planName,
    planPrice: subscriptionData.planPrice,
    startDate: subscriptionData.startDate,
    nextBilling: subscriptionData.nextBilling,
    maxEmployees: subscriptionData.maxEmployees,
    maxClients: subscriptionData.maxClients || "Ilimitados",
    businessName: "SaaS Estética Automotiva",
    dashboardUrl:
      subscriptionData.dashboardUrl || "http://localhost:8080/admin/dashboard",
  };

  return await sendEmail(ownerEmail, "subscriptionConfirmation", variables);
};

// Função para testar configuração de email
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return {
        success: false,
        message: "Configurações de email não encontradas",
        config: {
          EMAIL_HOST: process.env.EMAIL_HOST
            ? "Configurado"
            : "Não configurado",
          EMAIL_USER: process.env.EMAIL_USER
            ? "Configurado"
            : "Não configurado",
          EMAIL_PASS: process.env.EMAIL_PASS
            ? "Configurado"
            : "Não configurado",
        },
      };
    }

    await transporter.verify();
    return { success: true, message: "Configuração de email válida" };
  } catch (error) {
    return {
      success: false,
      message: `Erro na configuração: ${error.message}`,
    };
  }
};

// Função para enviar email de teste
export const sendTestEmail = async (to, businessName = "Estética Teste") => {
  const testData = {
    clientName: "Cliente Teste",
    serviceName: "Lavagem Completa",
    date: new Date().toLocaleDateString("pt-BR"),
    time: "14:00",
    vehicleInfo: "Honda Civic Branco - ABC1234",
    price: "50,00",
    businessName,
    businessPhone: "(11) 99999-9999",
  };

  return await sendBookingConfirmation(to, testData);
};
