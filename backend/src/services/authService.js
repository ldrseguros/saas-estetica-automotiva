import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const registerNewClient = async (clientData) => {
  const { email, password, name, whatsapp } = clientData;

  const existingAccount = await prisma.authAccount.findUnique({
    where: { email },
  });
  if (existingAccount) {
    const error = new Error("Conta já existe.");
    error.statusCode = 409; // Conflict
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const account = await prisma.authAccount.create({
    data: {
      email,
      password: hashedPassword,
      role: "CLIENT",
      client: {
        create: {
          name,
          whatsapp: whatsapp || null,
        },
      },
    },
    include: { client: true }, // Include client profile in the return
  });

  // Return only the client profile part, or whatever the controller needs
  return account.client;
};

export const authenticateUser = async (credentials) => {
  const { email, password } = credentials;

  const account = await prisma.authAccount.findUnique({
    where: { email },
    include: { employee: true, client: true },
  });

  if (!account) {
    const error = new Error("Email ou senha inválidos.");
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, account.password);
  if (!isPasswordValid) {
    const error = new Error("Email ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: account.id,
      email: account.email,
      role: account.role,
      tenantId: account.tenantId,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  let userName = "";
  if (account.role === "CLIENT" && account.client) {
    userName = account.client.name;
  } else if (account.employee) {
    userName = account.employee.name;
  }

  return {
    token,
    user: {
      id: account.id,
      email: account.email,
      name: userName,
      role: account.role,
      tenantId: account.tenantId,
    },
  };
};

export const registerNewEmployee = async (employeeData) => {
  const { email, password, name, role } = employeeData;

  if (!["TENANT_ADMIN", "EMPLOYEE"].includes(role)) {
    const error = new Error("Role inválido.");
    error.statusCode = 400; // Bad Request
    throw error;
  }

  const existingAccount = await prisma.authAccount.findUnique({
    where: { email },
  });
  if (existingAccount) {
    const error = new Error("Conta já existe.");
    error.statusCode = 409; // Conflict
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const account = await prisma.authAccount.create({
    data: {
      email,
      password: hashedPassword,
      role,
      employee: { create: { name } },
    },
    include: { employee: true },
  });

  return account.employee;
};
