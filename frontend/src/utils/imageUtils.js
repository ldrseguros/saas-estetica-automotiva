import { ENV_CONFIG } from "../config/environment.ts";

/**
 * Constrói URL completa para imagens baseado no ambiente
 * @param {string|null} imagePath - Caminho relativo da imagem (ex: "/uploads/services/image.jpg")
 * @returns {string|null} - URL completa da imagem ou null se não houver imagem
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Se já for uma URL completa, retorna como está
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Constrói URL baseado no ambiente
  const baseUrl = ENV_CONFIG.IS_DEVELOPMENT
    ? "http://localhost:3000"
    : "https://saas-estetica-automotiva.onrender.com";

  return `${baseUrl}${imagePath}`;
};

/**
 * Constrói URL para upload de imagem
 * @returns {string} - URL do endpoint de upload
 */
export const getImageUploadUrl = () => {
  const baseUrl = ENV_CONFIG.IS_DEVELOPMENT
    ? "http://localhost:3000/api"
    : "https://saas-estetica-automotiva.onrender.com/api";

  return `${baseUrl}/services/admin/upload`;
};

/**
 * Verifica se uma URL de imagem é válida
 * @param {string} url - URL da imagem
 * @returns {Promise<boolean>} - true se a imagem for válida
 */
export const validateImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return (
      response.ok && response.headers.get("content-type")?.startsWith("image/")
    );
  } catch {
    return false;
  }
};

export default {
  buildImageUrl,
  getImageUploadUrl,
  validateImageUrl,
};
