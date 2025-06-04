import {
  fetchAllUsers,
  fetchUserById,
  modifyUser,
  removeUser,
} from "../services/userService.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; // Importar bcrypt para hash de senha, se necessário para criar/atualizar users

const prisma = new PrismaClient();

// @desc    Get all users (employees and clients)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  const { email, role, page = 1, limit = 10 } = req.query;
  try {
    const result = await fetchAllUsers({ email, role }, { page, limit });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Erro ao buscar usuários",
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await fetchUserById(id);
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error in getUserById controller (ID: ${id}):`, error);
    res.status(error.statusCode || 500).json({
      message: error.message || `Erro ao buscar usuário com ID ${id}`,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, role, password, whatsapp } = req.body;

  // Basic input validation (can be expanded or moved to middleware)
  if (!email || !name || !role) {
    return res.status(400).json({
      message: "Email, nome e role são obrigatórios para atualização.",
    });
  }

  try {
    const updatedUser = await modifyUser(id, {
      email,
      name,
      role,
      password,
      whatsapp,
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Error in updateUser controller (ID: ${id}):`, error);
    // Handle specific errors from service if needed, e.g., unique constraint violation
    // For now, relying on the generic status code from the service error
    res.status(error.statusCode || 500).json({
      message: error.message || `Erro ao atualizar usuário com ID ${id}`,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await removeUser(id);
    res.status(200).json(result); // Service returns { message: "..." }
  } catch (error) {
    console.error(`Error in deleteUser controller (ID: ${id}):`, error);
    res.status(error.statusCode || 500).json({
      message: error.message || `Erro ao deletar usuário com ID ${id}`,
    });
  }
};
