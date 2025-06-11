import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Palette,
  Search,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import ModernButton from "@/components/Admin/ModernButton";
import CategoriaModal from "./CategoriaModal";
import { getTenantId } from "@/utils/tenantUtils";

interface Categoria {
  id: string;
  name: string;
  color?: string;
}

const fetchCategorias = async () => {
  const tenantId = getTenantId();
  const { data } = await axios.get(
    `/api/finance/categories?tenantId=${tenantId}`
  );
  return data as Categoria[];
};

const CategoriasFinanceiras: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categoriasFinanceiras"],
    queryFn: fetchCategorias,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<
    Categoria | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data?.filter((categoria: Categoria) =>
    categoria.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await axios.delete(`/api/finance/categories/${id}`);
      refetch();
      setDeleteId(null);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModernAdminLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
              <p className="mt-2 text-gray-600">
                Organize suas transações por categorias
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <ModernButton
                onClick={() => {
                  setSelectedCategoria(undefined);
                  setOpenModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </ModernButton>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            {filteredData?.length || 0} categoria(s) encontrada(s)
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium">
              Erro ao carregar categorias
            </div>
            <p className="text-red-500 mt-2">
              Tente novamente em alguns instantes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((categoria: Categoria, index: number) => (
                <motion.div
                  key={categoria.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: categoria.color || "#6b7280",
                          color: "#ffffff",
                        }}
                      >
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {categoria.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <Palette className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {categoria.color || "#6b7280"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedCategoria(categoria);
                          setOpenModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(categoria.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: categoria.color || "#6b7280" }}
                    >
                      {categoria.color || "Sem cor"}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma categoria encontrada
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Tente ajustar o termo de busca"
                      : "Comece criando sua primeira categoria"}
                  </p>
                  {!searchTerm && (
                    <ModernButton
                      className="mt-4"
                      onClick={() => {
                        setSelectedCategoria(undefined);
                        setOpenModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Categoria
                    </ModernButton>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Modal */}
        <CategoriaModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedCategoria(undefined);
          }}
          categoria={selectedCategoria}
          onSaved={() => refetch()}
        />

        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirmar exclusão
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja excluir esta categoria?
              </p>
              <div className="flex justify-end space-x-3">
                <ModernButton
                  variant="outline"
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                >
                  Cancelar
                </ModernButton>
                <ModernButton
                  variant="danger"
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo..." : "Excluir"}
                </ModernButton>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default CategoriasFinanceiras;
