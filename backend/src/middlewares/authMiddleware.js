import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers (commonly in the Authorization header as 'Bearer TOKEN')
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token is found
  if (!token) {
    return res
      .status(401)
      .json({ message: "Não autorizado, token não encontrado" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the account in the database using the decoded token payload
    const account = await prisma.authAccount.findUnique({
      where: {
        id: decoded.id, // Use the account ID from the JWT payload
      },
      include: {
        employee: true, // Include employee profile if exists
        client: true, // Include client profile if exists
      },
    });

    if (!account) {
      return res
        .status(401)
        .json({ message: "Não autorizado, conta não encontrada" });
    }

    // Prepare user object with profile details
    let name = "";
    if (account.role === "CLIENT" && account.client) {
      name = account.client.name;
    } else if (account.employee) {
      name = account.employee.name;
    }

    // Attach user to the request object
    req.user = {
      id: account.id,
      email: account.email,
      name,
      role: account.role,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Erro ao verificar token ou buscar usuário:", error);

    // Diferentes tratamentos de erro para diferentes tipos de falha de JWT
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expirado. Faça login novamente." });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Token inválido. Faça login novamente." });
    }

    res.status(401).json({ message: "Não autorizado, falha no token" });
  }
};

// Middleware para verificar se o usuário é um administrador
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({
      message:
        "Acesso negado. Apenas administradores podem acessar este recurso.",
    });
  }
};

export default protect;
