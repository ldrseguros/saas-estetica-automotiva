import { PrismaClient } from "@prisma/client";

// Create a singleton instance of the PrismaClient
const prisma = new PrismaClient();

export default prisma;
