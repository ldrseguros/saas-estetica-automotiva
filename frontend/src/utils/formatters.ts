/**
 * Utilitários para formatação de valores
 */

/**
 * Formata um valor numérico para moeda BRL (R$)
 * @param value Valor a ser formatado
 * @returns String formatada em BRL
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param dateString String de data ou objeto Date
 * @returns Data formatada
 */
export const formatDate = (dateString: string | Date): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

/**
 * Formata um horário para o formato brasileiro (HH:MM)
 * @param timeString String de horário no formato HH:MM ou HH:MM:SS
 * @returns Horário formatado
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  // Se for apenas HH:MM, retorna como está
  if (timeString.length === 5) return timeString;
  // Se for HH:MM:SS, remove os segundos
  return timeString.substring(0, 5);
};

/**
 * Formata um número de telefone/celular brasileiro
 * @param phone Número de telefone/celular (apenas dígitos)
 * @returns Telefone formatado
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return "";
  // Remove caracteres não numéricos
  const digitsOnly = phone.replace(/\D/g, "");

  // Formata de acordo com o tamanho
  if (digitsOnly.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    return digitsOnly.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2$3-$4");
  } else if (digitsOnly.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  // Se não for possível formatar, retorna como está
  return phone;
};

/**
 * Formata a duração em minutos para um formato legível (e.g., 1h 30min, 45min)
 * @param minutes Duração total em minutos
 * @returns String da duração formatada
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (
    minutes === null ||
    minutes === undefined ||
    isNaN(Number(minutes)) ||
    Number(minutes) <= 0
  ) {
    return "N/A"; // Ou talvez um valor padrão como "-" ou "Consulte"
  }

  const mins = Number(minutes);

  if (mins < 60) {
    return `${mins} min`;
  } else {
    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }
};
