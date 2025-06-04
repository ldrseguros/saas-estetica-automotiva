import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findAllServices = async () => {
  return await prisma.service.findMany();
};

export const addNewService = async (serviceData) => {
  const { title, description, price, duration, imageSrc } = serviceData;
  return await prisma.service.create({
    data: {
      title,
      description,
      price: parseFloat(price), // Ensure price is stored as a number
      duration: duration ? parseInt(duration, 10) : 60, // Ensure duration is stored as a number, default 60 minutes
      imageSrc,
    },
  });
};

export const findServiceById = async (id) => {
  return await prisma.service.findUnique({
    where: { id },
  });
};

export const modifyService = async (id, serviceData) => {
  const { title, description, price, duration, imageSrc } = serviceData;
  return await prisma.service.update({
    where: { id },
    data: {
      title,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      duration: duration !== undefined ? parseInt(duration, 10) : undefined,
      imageSrc,
    },
  });
};

export const removeService = async (id) => {
  // In a real app, consider if there are related entities (e.g., bookings)
  // that might prevent deletion or require cascading deletes or archiving.
  // For now, direct delete as per original controller.
  return await prisma.service.delete({
    where: { id },
  });
};
