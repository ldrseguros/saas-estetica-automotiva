import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to get clientProfileId from authAccountId (can be centralized if used in many services)
const getClientProfileIdFromAuthId = async (authAccountId) => {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { accountId: authAccountId },
    select: { id: true },
  });
  if (!clientProfile) {
    const error = new Error("Client profile not found for this user.");
    error.statusCode = 403;
    throw error;
  }
  return clientProfile.id;
};

// --- ADMIN BOOKING SERVICES ---

export const fetchAllBookingsAdmin = async () => {
  return await prisma.booking.findMany({
    include: {
      client: { include: { account: { select: { email: true, id: true } } } },
      vehicle: true,
      services: { include: { service: true } },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
};

export const addNewBookingAdmin = async (bookingData) => {
  const {
    clientId,
    vehicleId,
    serviceIds,
    date,
    time,
    status = "pending",
    specialInstructions,
    location,
  } = bookingData;

  // Verificar se o ID fornecido é um authAccountId ou um clientProfileId
  let clientProfileId = clientId;

  // Primeiro, verificamos se o clientId corresponde a um ClientProfile existente
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { id: clientId },
  });

  // Se não encontrarmos um ClientProfile diretamente, vamos verificar se é um authAccountId
  if (!clientProfile) {
    console.log(
      `ClientProfile não encontrado diretamente com ID ${clientId}, verificando se é um authAccountId...`
    );
    // Tentamos encontrar o ClientProfile pelo authAccountId
    const clientProfileByAuth = await prisma.clientProfile.findUnique({
      where: { accountId: clientId },
      select: { id: true },
    });

    if (!clientProfileByAuth) {
      const error = new Error(
        `Cliente não encontrado para o ID fornecido: ${clientId}`
      );
      error.statusCode = 404;
      throw error;
    }

    clientProfileId = clientProfileByAuth.id;
    console.log(
      `ClientProfile encontrado pelo authAccountId: ${clientProfileId}`
    );
  }

  // Verifica se o veículo pertence ao cliente
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    const error = new Error(`Veículo não encontrado: ${vehicleId}`);
    error.statusCode = 404;
    throw error;
  }

  if (vehicle.clientId !== clientProfileId) {
    const error = new Error(`O veículo não pertence ao cliente especificado`);
    error.statusCode = 403;
    throw error;
  }

  // Corrigindo o problema de fuso horário: mantendo a data original
  // Formato esperado: YYYY-MM-DD
  const [year, month, day] = date.split("-").map((num) => parseInt(num, 10));
  const bookingDate = new Date(year, month - 1, day, 12, 0, 0);

  console.log(`Data original: ${date}`);
  console.log(`Data convertida para objeto Date: ${bookingDate.toISOString()}`);

  return await prisma.booking.create({
    data: {
      clientId: clientProfileId, // Usa o clientProfileId correto
      vehicleId,
      date: bookingDate,
      time,
      status,
      specialInstructions,
      location,
      services: {
        create: serviceIds.map((serviceId) => ({
          service: { connect: { id: serviceId } },
        })),
      },
    },
    include: {
      client: { include: { account: true } },
      vehicle: true,
      services: { include: { service: true } },
    },
  });
};

export const fetchBookingByIdAdmin = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: { include: { account: true } },
      vehicle: true,
      services: { include: { service: true } },
    },
  });
  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

export const modifyBookingAdmin = async (id, updates) => {
  try {
    // Extract only the allowed fields for update
    const allowedUpdates = {
      date: updates.date ? new Date(updates.date) : undefined,
      time: updates.time,
      status: updates.status,
      specialInstructions: updates.specialInstructions,
      location: updates.location,
    };

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: allowedUpdates, // Pass only allowed updates
      include: {
        client: { include: { account: true } },
        vehicle: true,
        services: { include: { service: true } },
      },
    });

    return updatedBooking;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    const errorCode = error instanceof Error ? error.statusCode : 500;
    const errorObj = new Error(errorMessage);
    errorObj.statusCode = errorCode;
    throw errorObj;
  }
};

export const removeBookingAdmin = async (id) => {
  const existingBooking = await prisma.booking.findUnique({ where: { id } });
  if (!existingBooking) {
    const error = new Error("Booking not found to delete.");
    error.statusCode = 404;
    throw error;
  }
  // Transaction to ensure atomicity if deleting related BookingService entries
  return await prisma.$transaction(async (tx) => {
    await tx.bookingService.deleteMany({ where: { bookingId: id } });
    await tx.booking.delete({ where: { id } });
    return { message: `Booking with ID ${id} deleted successfully by admin.` };
  });
};

// --- CLIENT BOOKING SERVICES ---

export const fetchMyBookingsClient = async (authAccountId) => {
  const clientProfileId = await getClientProfileIdFromAuthId(authAccountId);
  return await prisma.booking.findMany({
    where: { clientId: clientProfileId },
    include: { vehicle: true, services: { include: { service: true } } },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });
};

export const addNewBookingClient = async (authAccountId, bookingData) => {
  const {
    vehicleId,
    serviceIds,
    date,
    time,
    status = "pending",
    specialInstructions,
    location,
    phone,
  } = bookingData;
  const clientProfileId = await getClientProfileIdFromAuthId(authAccountId);

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.clientId !== clientProfileId) {
    const error = new Error(
      "Invalid vehicle or vehicle does not belong to you."
    );
    error.statusCode = 403;
    throw error;
  }

  // Corrigindo o problema de fuso horário: mantendo a data original
  // Formato esperado: YYYY-MM-DD
  const [year, month, day] = date.split("-").map((num) => parseInt(num, 10));
  const bookingDate = new Date(year, month - 1, day, 12, 0, 0);

  console.log(`Data original do cliente: ${date}`);
  console.log(`Data convertida para objeto Date: ${bookingDate.toISOString()}`);

  return await prisma.booking.create({
    data: {
      clientId: clientProfileId,
      vehicleId,
      date: bookingDate,
      time,
      status,
      specialInstructions,
      location,
      clientPhone: phone,
      services: {
        create: serviceIds.map((serviceId) => ({
          service: { connect: { id: serviceId } },
        })),
      },
    },
    include: { vehicle: true, services: { include: { service: true } } },
  });
};

export const fetchMyBookingByIdClient = async (authAccountId, bookingId) => {
  const clientProfileId = await getClientProfileIdFromAuthId(authAccountId);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { vehicle: true, services: { include: { service: true } } },
  });

  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }
  if (booking.clientId !== clientProfileId) {
    const error = new Error("You are not authorized to view this booking.");
    error.statusCode = 403;
    throw error;
  }
  return booking;
};

export const cancelMyBookingClient = async (authAccountId, bookingId) => {
  const clientProfileId = await getClientProfileIdFromAuthId(authAccountId);
  const bookingToCancel = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!bookingToCancel) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }
  if (bookingToCancel.clientId !== clientProfileId) {
    const error = new Error("You are not authorized to cancel this booking.");
    error.statusCode = 403;
    throw error;
  }
  if (
    bookingToCancel.status === "completed" ||
    bookingToCancel.status === "cancelled"
  ) {
    const error = new Error(
      `Booking is already ${bookingToCancel.status} and cannot be cancelled.`
    );
    error.statusCode = 400;
    throw error;
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
    include: { vehicle: true, services: { include: { service: true } } },
  });
};
