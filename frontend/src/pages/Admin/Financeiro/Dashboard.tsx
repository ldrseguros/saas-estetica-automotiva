import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Calendar,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";
import { getTenantId } from "@/utils/tenantUtils";
import API from "@/utils/apiService";

const fetchDashboard = async () => {
  try {
    const tenantId = getTenantId();
    if (!tenantId) {
      console.warn("TenantId não encontrado");
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        chartData: [],
      };
    }

    const { data } = await API.get(
      `/finance/transactions/dashboard?tenantId=${tenantId}`
    );

    // Garantir que os dados têm a estrutura esperada
    return {
      totalIncome: data?.totalIncome || 0,
      totalExpense: data?.totalExpense || 0,
      balance: data?.balance || 0,
      chartData: data?.chartData || [],
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
};

const DashboardFinanceiro: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardFinanceiro"],
    queryFn: fetchDashboard,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (balance < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <ModernAdminLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
              <p className="mt-2 text-gray-600">
                Visão geral das finanças do seu negócio
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link to="/admin/financeiro/transacoes">
                <ModernButton variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todas
                </ModernButton>
              </Link>
              <Link to="/admin/financeiro/transacoes">
                <ModernButton size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium">
              Erro ao carregar dados do dashboard
            </div>
            <p className="text-red-500 mt-2">
              Tente novamente em alguns instantes
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <StatCard
                title="Receita Total"
                value={formatCurrency(data.totalIncome || 0)}
                change="+15% este mês"
                changeType="positive"
                icon={TrendingUp}
                gradient="from-green-500 to-green-600"
              />
              <StatCard
                title="Despesa Total"
                value={formatCurrency(data.totalExpense || 0)}
                change="-5% este mês"
                changeType="negative"
                icon={TrendingDown}
                gradient="from-red-500 to-red-600"
              />
              <StatCard
                title="Saldo"
                value={formatCurrency(data.balance || 0)}
                change={
                  (data.balance || 0) > 0
                    ? "Positivo"
                    : (data.balance || 0) < 0
                    ? "Negativo"
                    : "Neutro"
                }
                changeType={
                  (data.balance || 0) > 0
                    ? "positive"
                    : (data.balance || 0) < 0
                    ? "negative"
                    : "neutral"
                }
                icon={DollarSign}
                gradient={
                  (data.balance || 0) > 0
                    ? "from-green-500 to-green-600"
                    : (data.balance || 0) < 0
                    ? "from-red-500 to-red-600"
                    : "from-gray-500 to-gray-600"
                }
              />
            </motion.div>

            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Receitas vs Despesas
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Comparativo mensal de entradas e saídas
                    </p>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="text-sm">Últimos meses</span>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.chartData || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                          }).format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="income"
                        name="Receita"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expense"
                        name="Despesa"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Link to="/admin/financeiro/transacoes">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Transações
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Gerenciar receitas e despesas
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/admin/financeiro/categorias">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Categorias
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Organizar tipos de transação
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/admin/financeiro/metodos">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Métodos
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Formas de pagamento
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-gray-600 text-lg font-medium">
              Nenhum dado disponível
            </div>
            <p className="text-gray-500 mt-2">
              Aguarde enquanto carregamos os dados do dashboard
            </p>
          </div>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default DashboardFinanceiro;
