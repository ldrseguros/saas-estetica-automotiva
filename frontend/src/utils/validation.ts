// Validações de formulário reutilizáveis

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email é obrigatório";
  if (!emailRegex.test(email)) return "Email inválido";
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return "Nome é obrigatório";
  if (name.trim().length < 2) return "Nome deve ter pelo menos 2 caracteres";
  return null;
};

export const validateWhatsApp = (whatsapp?: string): string | null => {
  if (whatsapp) {
    // Remove caracteres não numéricos
    const cleanedPhone = whatsapp.replace(/\D/g, "");

    // Verifica se tem entre 10 e 11 dígitos (DDD + número)
    if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
      return "WhatsApp inválido";
    }
  }
  return null;
};

export const validateUserForm = (data: {
  name: string;
  email: string;
  whatsapp?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (data.whatsapp) {
    const whatsappError = validateWhatsApp(data.whatsapp);
    if (whatsappError) errors.whatsapp = whatsappError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatWhatsApp = (whatsapp?: string): string | undefined => {
  if (!whatsapp) return undefined;

  // Remove caracteres não numéricos
  const cleaned = whatsapp.replace(/\D/g, "");

  // Formata para (DD) 9 XXXX-XXXX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
  }

  // Formata para (DD) XXXX-XXXX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return whatsapp;
};
