import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Search,
  Filter,
  Wallet,
  Banknote,
  Smartphone,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import ModernButton from "@/components/Admin/ModernButton";
import { getTenantId } from "@/utils/tenantUtils";

interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

const fetchPaymentMethods = async () => {
  const tenantId = getTenantId();
  const { data } = await axios.get(`/api/finance/methods?tenantId=${tenantId}`);
  return data as PaymentMethod[];
};

const MetodosPagamento: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: fetchPaymentMethods,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    PaymentMethod | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data?.filter((method: PaymentMethod) =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("pix") || lowerName.includes("digital")) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (lowerName.includes("dinheiro") || lowerName.includes("cash")) {
      return <Banknote className="h-5 w-5" />;
    }
    if (lowerName.includes("cartão") || lowerName.includes("card")) {
      return <CreditCard className="h-5 w-5" />;
    }
    return <Wallet className="h-5 w-5" />;
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await axios.delete(`/api/finance/methods/${id}`);
      refetch();
      setDeleteId(null);
    } catch (error) {
      console.error("Erro ao excluir método de pagamento: ", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (method: Partial<PaymentMethod>) => {
    try {
      const tenantId = getTenantId();

      if (selectedMethod?.id) {
        // Editar
        await axios.put(`/api/finance/methods/${selectedMethod.id}`, {
          ...method,
          tenantId,
        });
      } else {
        // Criar
        await axios.post("/api/finance/methods", {
          ...method,
          tenantId,
        });
      }

      refetch();
      setOpenModal(false);
      setSelectedMethod(undefined);
    } catch (error) {
      console.error("Erro ao salvar método de pagamento: ", error);
    }
  };

  return (
    <ModernAdminLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Métodos de Pagamento
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie as formas de pagamento aceitas
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <ModernButton
                onClick={() => {
                  setSelectedMethod(undefined);
                  setOpenModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Método
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
              placeholder="Buscar métodos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            {filteredData?.length || 0} método(s) encontrado(s)
          </div>
        </div>

        {/* Methods Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium">
              Erro ao carregar métodos de pagamento
            </div>
            <p className="text-red-500 mt-2">
              Tente novamente em alguns instantes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((method: PaymentMethod, index: number) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                        {getMethodIcon(method.name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {method.name}
                        </h3>
                        {method.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {method.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedMethod(method);
                          setOpenModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(method.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum método encontrado
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Tente ajustar o termo de busca"
                      : "Comece criando seu primeiro método de pagamento"}
                  </p>
                  {!searchTerm && (
                    <ModernButton
                      className="mt-4"
                      onClick={() => {
                        setSelectedMethod(undefined);
                        setOpenModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Método
                    </ModernButton>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Method Modal */}
        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedMethod ? "Editar Método" : "Novo Método"}
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSave({
                    name: formData.get("name") as string,
                    description: formData.get("description") as string,
                  });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedMethod?.name}
                      required
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedMethod?.description}
                      rows={3}
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <ModernButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenModal(false);
                      setSelectedMethod(undefined);
                    }}
                  >
                    Cancelar
                  </ModernButton>
                  <ModernButton type="submit">
                    {selectedMethod ? "Salvar" : "Criar"}
                  </ModernButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}

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
                Tem certeza que deseja excluir este método de pagamento?
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

export default MetodosPagamento;
