import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Tag,
  CreditCard,
  Filter,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";
import TransacaoModal from "./TransacaoModal";
import { getTenantId } from "@/utils/tenantUtils";

const fetchTransacoes = async () => {
  const tenantId = getTenantId();
  const { data } = await axios.get(
    `/api/finance/transactions?tenantId=${tenantId}`
  );
  return data;
};

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  value: number;
  category?: { id: string; name: string } | null;
  method?: { id: string; name: string } | null;
}

const TransacoesFinanceiras: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transacoesFinanceiras"],
    queryFn: fetchTransacoes,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState<
    Transaction | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL"
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTypeIcon = (type: string) => {
    return type === "INCOME" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTypeStyle = (type: string) => {
    return type === "INCOME"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredData = data?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await axios.delete(`/api/finance/transactions/${id}`);
      refetch();
      setDeleteId(null);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
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
              <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
              <p className="mt-2 text-gray-600">
                Gerencie todas as receitas e despesas
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <ModernButton
                onClick={() => {
                  setSelectedTransacao(undefined);
                  setOpenModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
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
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "ALL" | "INCOME" | "EXPENSE")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            {filteredData?.length || 0} transação(ões) encontrada(s)
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 text-lg font-medium">
                Erro ao carregar transações
              </div>
              <p className="text-red-500 mt-2">
                Tente novamente em alguns instantes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Data
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Tipo
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Valor
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Categoria
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Método
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData && filteredData.length > 0 ? (
                    filteredData.map(
                      (transaction: Transaction, index: number) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(transaction.date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium text-gray-900">
                              {transaction.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getTypeIcon(transaction.type)}
                              <span
                                className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeStyle(
                                  transaction.type
                                )}`}
                              >
                                {transaction.type === "INCOME"
                                  ? "Receita"
                                  : "Despesa"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm font-medium ${
                                transaction.type === "INCOME"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(transaction.value)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.category?.name || (
                              <span className="text-gray-400 italic">
                                Sem categoria
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.method?.name || (
                              <span className="text-gray-400 italic">
                                Sem método
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedTransacao(transaction);
                                  setOpenModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(transaction.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhuma transação encontrada
                          </h3>
                          <p className="text-gray-500">
                            {searchTerm || filterType !== "ALL"
                              ? "Tente ajustar os filtros de busca"
                              : "Comece criando sua primeira transação"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        <TransacaoModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedTransacao(undefined);
          }}
          transacao={selectedTransacao}
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
                Tem certeza que deseja excluir esta transação?
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

export default TransacoesFinanceiras;
