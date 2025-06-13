import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findAllServices = async (tenantId) => {
  // Validar se tenantId foi fornecido
  if (!tenantId) {
    const error = new Error("TenantId é obrigatório para buscar serviços");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.service.findMany({
    where: {
      tenantId: tenantId, // FILTRO POR TENANT
    },
  });
};

export const addNewService = async (serviceData) => {
  const { title, description, price, duration, imageSrc, tenantId } =
    serviceData;

  // Validar se tenantId foi fornecido
  if (!tenantId) {
    const error = new Error("TenantId é obrigatório para criar serviço");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.service.create({
    data: {
      title,
      description,
      price: parseFloat(price), // Ensure price is stored as a number
      duration: duration ? parseInt(duration, 10) : 60, // Ensure duration is stored as a number, default 60 minutes
      imageSrc,
      tenantId, // ADICIONAR TENANT ID
    },
  });
};

export const findServiceById = async (id, tenantId) => {
  // Validar se tenantId foi fornecido
  if (!tenantId) {
    const error = new Error("TenantId é obrigatório para buscar serviço");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.service.findUnique({
    where: {
      id,
      tenantId, // FILTRO POR TENANT
    },
  });
};

export const modifyService = async (id, serviceData, tenantId) => {
  const { title, description, price, duration, imageSrc } = serviceData;

  // Validar se tenantId foi fornecido
  if (!tenantId) {
    const error = new Error("TenantId é obrigatório para modificar serviço");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.service.update({
    where: {
      id,
      tenantId, // FILTRO POR TENANT
    },
    data: {
      title,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      duration: duration !== undefined ? parseInt(duration, 10) : undefined,
      imageSrc,
    },
  });
};

export const removeService = async (id, tenantId) => {
  // Validar se tenantId foi fornecido
  if (!tenantId) {
    const error = new Error("TenantId é obrigatório para deletar serviço");
    error.statusCode = 400;
    throw error;
  }

  // In a real app, consider if there are related entities (e.g., bookings)
  // that might prevent deletion or require cascading deletes or archiving.
  // For now, direct delete as per original controller.
  return await prisma.service.delete({
    where: {
      id,
      tenantId, // FILTRO POR TENANT
    },
  });
};
