import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Search,
  Filter,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

type TableRowData = Record<
  string,
  React.ReactNode | string | number | boolean | null | undefined
> & {
  id?: React.Key;
};

interface Column<T extends TableRowData = TableRowData> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Action<T extends TableRowData = TableRowData> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  color?: "primary" | "danger" | "secondary";
}

interface ModernTableProps<T extends TableRowData = TableRowData> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  searchable?: boolean;
  filterable?: boolean;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export const ModernTable = <T extends TableRowData = TableRowData>({
  columns,
  data,
  actions = [],
  searchable = true,
  filterable = false,
  className = "",
  emptyMessage = "Nenhum item encontrado",
  loading = false,
}: ModernTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [openActionMenus, setOpenActionMenus] = useState<Set<React.Key>>(
    new Set()
  );

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleActionMenu = (rowId: React.Key) => {
    const newSet = new Set(openActionMenus);
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    setOpenActionMenus(newSet);
  };

  const getActionColor = (color: string) => {
    switch (color) {
      case "primary":
        return "text-blue-600 hover:bg-blue-50";
      case "danger":
        return "text-red-600 hover:bg-red-50";
      default:
        return "text-gray-600 hover:bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      {(searchable || filterable) && (
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            {searchable && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            )}
            {filterable && (
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortField === column.key
                            ? sortDirection === "desc"
                              ? "rotate-180"
                              : "rotate-0"
                            : "opacity-50"
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {sortedData.map((row, index) => {
                const rowKey = row.id ?? index;
                return (
                  <motion.tr
                    key={rowKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {column.render ? (
                          column.render(row[column.key] as T[keyof T], row)
                        ) : (
                          <span className="text-sm text-gray-900">
                            {String(row[column.key] ?? "")}
                          </span>
                        )}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative">
                          <button
                            onClick={() => toggleActionMenu(rowKey)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <AnimatePresence>
                            {openActionMenus.has(rowKey) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                              >
                                {actions.map((action, actionIndex) => {
                                  const Icon = action.icon;
                                  return (
                                    <button
                                      key={actionIndex}
                                      onClick={() => {
                                        action.onClick(row);
                                        toggleActionMenu(rowKey);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center ${getActionColor(
                                        action.color || "secondary"
                                      )}`}
                                    >
                                      <Icon className="h-4 w-4 mr-2" />
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ModernTable;
