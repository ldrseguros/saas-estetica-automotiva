import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Phone,
  Mail,
  Search,
  MoreVertical,
  Calendar,
  Shield,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import ModernAdminLayout from "../../components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "../../components/Admin/ModernCard";
import ModernButton from "../../components/Admin/ModernButton";
import Pagination from "../../components/Pagination";
import UserModal from "../../components/Admin/UserModal";
import ConfirmDeleteModal from "../../components/Admin/ConfirmDeleteModal";
import API from "../../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "TENANT_ADMIN" | "EMPLOYEE";
  createdAt: string;
}

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Estado para edição de usuário
  const [editUser, setEditUser] = useState<User | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchUsersData = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await API.get("/admin/users", {
          params: {
            email,
            role: ["TENANT_ADMIN", "EMPLOYEE"],
            page,
          },
        });

        // Aplicar filtro adicional no frontend para garantir que apenas admin e funcionários apareçam
        const filteredUsers = (response.data.users || response.data).filter(
          (user: User) =>
            user.role === "TENANT_ADMIN" || user.role === "EMPLOYEE"
        );
        setUsers(filteredUsers);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalUsers: 0,
          }
        );
      } catch (error) {
        toast.error("Erro ao buscar usuários");
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsersData();
  };

  const handlePageChange = (page: number) => {
    fetchUsersData(page);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setOpenEditModal(true);
    setActionMenuOpen(null);
  };

  const handleDelete = async (user: User) => {
    setEditUser(user);
    setConfirmDelete(true);
    setActionMenuOpen(null);
  };

  const confirmDeleteUser = async () => {
    if (!editUser) return;

    try {
      setDeleteLoading(true);
      await API.delete(`/admin/users/${editUser.id}`);
      toast.success("Usuário excluído com sucesso");
      fetchUsersData(pagination.currentPage);
      setConfirmDelete(false);
      setEditUser(null);
    } catch (error) {
      toast.error("Erro ao excluir usuário");
      console.error("Erro ao excluir usuário:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveEdit = async (data: Partial<User>) => {
    if (!editUser) return;

    await API.put(`/admin/users/${editUser.id}`, data);
    fetchUsersData(pagination.currentPage);
    setOpenEditModal(false);
    setEditUser(null);
  };

  const handleCreateUser = async (data: Partial<User>) => {
    await API.post("/admin/users", data);
    fetchUsersData(pagination.currentPage);
    setOpenCreateModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "TENANT_ADMIN":
        return {
          label: "Administrador",
          color: "bg-red-100 text-red-800",
          icon: <Shield className="h-4 w-4" />,
        };
      case "EMPLOYEE":
        return {
          label: "Funcionário",
          color: "bg-blue-100 text-blue-800",
          icon: <User className="h-4 w-4" />,
        };
      default:
        return {
          label: role,
          color: "bg-gray-100 text-gray-800",
          icon: <User className="h-4 w-4" />,
        };
    }
  };

  const adminCount = users.filter((u) => u.role === "TENANT_ADMIN").length;
  const employeeCount = users.filter((u) => u.role === "EMPLOYEE").length;

  return (
    <ModernAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600 mt-1">
              Gerencie funcionários e administradores
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <ModernButton icon={Plus} onClick={() => setOpenCreateModal(true)}>
              Novo Usuário
            </ModernButton>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Usuários"
            value={pagination.totalUsers}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Administradores"
            value={adminCount}
            icon={Shield}
            gradient="from-red-500 to-red-600"
          />
          <StatCard
            title="Funcionários"
            value={employeeCount}
            icon={User}
            gradient="from-green-500 to-green-600"
          />
        </div>

        {/* Search and Filters */}
        <ModernCard title="Buscar Usuários" hoverable={false}>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <ModernButton type="submit">Buscar</ModernButton>
          </form>
        </ModernCard>

        {/* Users Table */}
        <ModernCard title="Lista de Usuários" hoverable={false}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Carregando usuários...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Função
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Data de Criação
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {users.map((user, index) => {
                      const roleInfo = getRoleInfo(user.role);
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                            >
                              {roleInfo.icon}
                              <span className="ml-1">{roleInfo.label}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setActionMenuOpen(
                                    actionMenuOpen === user.id ? null : user.id
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              <AnimatePresence>
                                {actionMenuOpen === user.id && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      scale: 0.95,
                                      y: -10,
                                    }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                                  >
                                    <button
                                      onClick={() => handleEdit(user)}
                                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDelete(user)}
                                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </ModernCard>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={handleCreateUser}
        isEditing={false}
      />

      <UserModal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setEditUser(null);
        }}
        onSave={handleSaveEdit}
        user={editUser}
        isEditing={true}
      />

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setEditUser(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${editUser?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteLoading}
      />
    </ModernAdminLayout>
  );
};

export default Usuarios;
