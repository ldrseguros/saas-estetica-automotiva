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
} from "lucide-react";
import { toast } from "sonner";
import ModernAdminLayout from "../../components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "../../components/Admin/ModernCard";
import ModernButton from "../../components/Admin/ModernButton";
import Pagination from "../../components/Pagination";
import ClientModal from "../../components/Admin/ClientModal";
import ConfirmDeleteModal from "../../components/Admin/ConfirmDeleteModal";
import API from "../../lib/api";

interface Cliente {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  createdAt: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [email, setEmail] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Estado para edição de cliente
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchClientes = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await API.get("/admin/users", {
          params: {
            email,
            role: "CLIENT",
            page,
          },
        });

        setClientes(response.data.users || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalUsers: 0,
          }
        );
      } catch (error) {
        toast.error("Erro ao buscar clientes");
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClientes();
  };

  const handlePageChange = (page: number) => {
    fetchClientes(page);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditCliente(cliente);
    setOpenEditModal(true);
    setActionMenuOpen(null);
  };

  const handleDelete = async (cliente: Cliente) => {
    setEditCliente(cliente);
    setConfirmDelete(true);
    setActionMenuOpen(null);
  };

  const confirmDeleteCliente = async () => {
    if (!editCliente) return;

    try {
      setDeleteLoading(true);
      await API.delete(`/admin/users/${editCliente.id}`);
      toast.success("Cliente excluído com sucesso");
      fetchClientes(pagination.currentPage);
      setConfirmDelete(false);
      setEditCliente(null);
    } catch (error) {
      toast.error("Erro ao excluir cliente");
      console.error("Erro ao excluir cliente:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveEdit = async (data: Partial<Cliente>) => {
    if (!editCliente) return;

    await API.put(`/admin/users/${editCliente.id}`, {
      ...data,
      role: "CLIENT",
    });

    fetchClientes(pagination.currentPage);
    setOpenEditModal(false);
    setEditCliente(null);
  };

  const handleCreateClient = async (data: Partial<Cliente>) => {
    await API.post("/admin/users", {
      ...data,
      role: "CLIENT",
    });

    fetchClientes(pagination.currentPage);
    setOpenCreateModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "-";
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie sua base de clientes</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <ModernButton icon={Plus} onClick={() => setOpenCreateModal(true)}>
              Novo Cliente
            </ModernButton>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Clientes"
            value={pagination.totalUsers}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Ativos"
            value={clientes.length}
            icon={Users}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Com WhatsApp"
            value={clientes.filter((c) => c.whatsapp).length}
            icon={Phone}
            gradient="from-red-500 to-red-600"
          />
        </div>

        {/* Search and Filters */}
        <ModernCard title="Buscar Clientes" hoverable={false}>
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

        {/* Clients Table */}
        <ModernCard title="Lista de Clientes" hoverable={false}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Carregando clientes...</span>
            </div>
          ) : clientes.length > 0 ? (
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
                      WhatsApp
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
                    {clientes.map((cliente, index) => (
                      <motion.tr
                        key={cliente.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
                              {cliente.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">
                                {cliente.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {cliente.email}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {formatPhone(cliente.whatsapp)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(cliente.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActionMenuOpen(
                                  actionMenuOpen === cliente.id
                                    ? null
                                    : cliente.id
                                )
                              }
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            <AnimatePresence>
                              {actionMenuOpen === cliente.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                                >
                                  <button
                                    onClick={() => handleEdit(cliente)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDelete(cliente)}
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
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum cliente encontrado</p>
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
      <ClientModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={handleCreateClient}
        isEditing={false}
      />

      <ClientModal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setEditCliente(null);
        }}
        onSave={handleSaveEdit}
        client={editCliente}
        isEditing={true}
      />

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setEditCliente(null);
        }}
        onConfirm={confirmDeleteCliente}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${editCliente?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteLoading}
      />
    </ModernAdminLayout>
  );
};

export default Clientes;
