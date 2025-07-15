import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Car,
  MapPin,
  Phone,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  RefreshCw,
  Download,
  CalendarDays,
} from "lucide-react";
import ModernAdminLayout from "../../components/Admin/ModernAdminLayout";
import CreateBookingModal from "../../components/Admin/CreateBookingModal";
import API from '../../utils/apiService'

// ====================================
// 📅 INTERFACES E TIPOS
// ====================================

interface BookingService {
  id: string;
  service: {
    id: string;
    title: string;
    price: number;
    duration: number;
  };
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  totalPrice: number;
  location: string;
  address?: string;
  notes?: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  services: BookingService[];
  createdAt: string;
  updatedAt: string;
}

interface BookingFilters {
  status: string;
  date: string;
  search: string;
}

// ====================================
// 🎨 COMPONENTES AUXILIARES
// ====================================

const StatusBadge: React.FC<{ status: Booking["status"] }> = ({ status }) => {
  const statusConfig: Record<
    Booking["status"],
    {
      label: string;
      color: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    scheduled: {
      label: "Agendado",
      color: "bg-blue-100 text-blue-800",
      icon: Calendar,
    },
    in_progress: {
      label: "Em Andamento",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    completed: {
      label: "Concluído",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.scheduled;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const BookingCard: React.FC<{
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onView: (booking: Booking) => void;
  onDelete: (id: string) => void;
}> = ({ booking, onEdit, onCancel, onComplete, onView, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.client.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(booking.date)} • {booking.startTime}
              </p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Cliente e Veículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>{booking.client.email}</span>
            </div>
            {booking.client.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{booking.client.phone}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Car className="w-4 h-4 mr-2" />
              <span>
                {booking.vehicle.brand} {booking.vehicle.model} (
                {booking.vehicle.year})
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-4 h-4 mr-2 text-center">🚗</span>
              <span>
                {booking.vehicle.plate} • {booking.vehicle.color}
              </span>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Serviços:</h4>
          <div className="space-y-1">
            {booking.services.map((service) => (
              <div
                key={service.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">{service.service.title}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(service.service.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Total:</span>
              <span className="text-red-600">
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Local */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {booking.location === "domicilio" && booking.address
                ? `Domicílio - ${booking.address}`
                : booking.location === "loja"
                ? "Na loja"
                : booking.location}
            </span>
          </div>
        </div>

        {/* Observações */}
        {booking.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Observações:</span> {booking.notes}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onView(booking)}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-3 h-3 mr-1" />
            Ver Detalhes
          </button>

          <button
            onClick={() => onEdit(booking)}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </button>

          {booking.status === "scheduled" && (
            <>
              <button
                onClick={() => onComplete(booking.id)}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Marcar como Concluído
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Cancelar
              </button>
            </>
          )}

          <button
            onClick={() => onDelete(booking.id)}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Deletar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ====================================
// 📅 COMPONENTE PRINCIPAL
// ====================================

const Agendamentos: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters>({
    status: "",
    date: "",
    search: "",
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(
    null
  );

  // ====================================
  // 🔄 CARREGAR DADOS
  // ====================================

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      const response = await API.get("/bookings/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao carregar agendamentos");
      }

      const data = response.data;
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Não foi possível carregar os agendamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ====================================
  // 🎯 AÇÕES
  // ====================================

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await API.get(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao cancelar agendamento");
      }

      await loadBookings();
    } catch (err) {
      console.error("Erro ao cancelar:", err);
      alert("Erro ao cancelar agendamento");
    }
  };

  const handleComplete = async (bookingId: string) => {
    if (!confirm("Marcar este agendamento como concluído?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await API.get(`/api/bookings/${bookingId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao completar agendamento");
      }

      await loadBookings();
    } catch (err) {
      console.error("Erro ao completar:", err);
      alert("Erro ao marcar como concluído");
    }
  };

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleDelete = (bookingId: string) => {
    setDeletingBookingId(bookingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingBookingId) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await API.get(`/api/bookings/${deletingBookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao deletar agendamento");
      }

      await loadBookings();
      setShowDeleteModal(false);
      setDeletingBookingId(null);
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao deletar agendamento");
    }
  };

  const handleSaveEdit = async (updatedBooking: Partial<Booking>) => {
    if (!editingBooking) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await API.put(`/api/bookings/admin/${editingBooking.id}`,
        updatedBooking,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao atualizar agendamento");
      }

      await loadBookings();
      setShowEditModal(false);
      setEditingBooking(null);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar agendamento");
    }
  };

  const handleCreateBooking = async (newBookingData: {
    clientId: string;
    vehicleId: string;
    serviceIds: string[];
    date: string;
    time: string;
    status: string;
    specialInstructions?: string;
    location?: string;
  }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await API.post("/api/bookings/admin", newBookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao criar agendamento");
      }

      await loadBookings();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      alert("Erro ao criar agendamento");
    }
  };

  // ====================================
  // 🔍 FILTROS
  // ====================================

  const filteredBookings = bookings.filter((booking) => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.date && booking.date !== filters.date) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        booking.client.name.toLowerCase().includes(searchLower) ||
        booking.client.email.toLowerCase().includes(searchLower) ||
        booking.vehicle.plate.toLowerCase().includes(searchLower) ||
        booking.vehicle.brand.toLowerCase().includes(searchLower) ||
        booking.vehicle.model.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // ====================================
  // 📊 ESTATÍSTICAS RÁPIDAS
  // ====================================

  const stats = {
    total: bookings.length,
    scheduled: bookings.filter((b) => b.status === "scheduled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    today: bookings.filter(
      (b) => b.date === new Date().toISOString().split("T")[0]
    ).length,
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
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os agendamentos da sua estética
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={loadBookings}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </button>

            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.scheduled}
            </div>
            <div className="text-sm text-gray-600">Agendados</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600">Concluídos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {stats.today}
            </div>
            <div className="text-sm text-gray-600">Hoje</div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, email, placa..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Status */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="scheduled">Agendado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>

            {/* Filtro por Data */}
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            {/* Limpar Filtros */}
            {(filters.status || filters.date || filters.search) && (
              <button
                onClick={() => setFilters({ status: "", date: "", search: "" })}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </motion.div>

        {/* Lista de Agendamentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={loadBookings}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {filters.status || filters.date || filters.search
                  ? "Nenhum agendamento encontrado com os filtros aplicados"
                  : "Nenhum agendamento encontrado"}
              </p>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => setShowCreateModal(true)}
              >
                Criar Primeiro Agendamento
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {showDetails && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Detalhes do Agendamento
                    </h2>
                    <p className="text-gray-600">ID: {selectedBooking.id}</p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Conteúdo do modal com todos os detalhes */}
                <div className="space-y-6">
                  {/* Status e Data */}
                  <div className="flex justify-between items-center">
                    <StatusBadge status={selectedBooking.status} />
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {new Date(selectedBooking.date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                      <div className="text-gray-600">
                        {selectedBooking.startTime} - {selectedBooking.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Informações completas... */}
                  {/* (Aqui continuaria com mais detalhes do agendamento) */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {showEditModal && editingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <EditBookingForm
                booking={editingBooking}
                onSave={handleSaveEdit}
                onCancel={() => setShowEditModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteModal && deletingBookingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmar Exclusão
                    </h3>
                    <p className="text-gray-600">
                      Esta ação não pode ser desfeita
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Tem certeza que deseja deletar permanentemente este
                  agendamento? Todos os dados relacionados serão perdidos.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Criar Agendamento */}
      <CreateBookingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateBooking}
      />
    </ModernAdminLayout>
  );
};

// ====================================
// 📝 COMPONENTE DE EDIÇÃO
// ====================================

const EditBookingForm: React.FC<{
  booking: Booking;
  onSave: (updatedBooking: Partial<Booking>) => void;
  onCancel: () => void;
}> = ({ booking, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    notes: booking.notes || "",
    location: booking.location,
    address: booking.address || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Editar Agendamento
          </h2>
          <p className="text-gray-600">ID: {booking.id}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Informações do Cliente e Veículo (Somente Leitura) */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          Informações do Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nome</p>
            <p className="font-medium text-gray-900">{booking.client.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">{booking.client.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Veículo</p>
            <p className="font-medium text-gray-900">
              {booking.vehicle.brand} {booking.vehicle.model} (
              {booking.vehicle.year})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Placa</p>
            <p className="font-medium text-gray-900">{booking.vehicle.plate}</p>
          </div>
        </div>
      </div>

      {/* Serviços (Somente Leitura) */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Serviços</h3>
        <div className="space-y-2">
          {booking.services.map((service) => (
            <div key={service.id} className="flex justify-between items-center">
              <span className="text-gray-700 text-lg">
                {service.service.title}
              </span>
              <span className="font-medium text-lg">
                {formatCurrency(service.service.price)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3">
          <div className="flex justify-between items-center font-semibold">
            <span>Total:</span>
            <span className="text-red-600">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Booking["status"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            >
              <option value="scheduled">Agendado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário de Início
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário de Término
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local
          </label>
          <select
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
          >
            <option value="loja">Na loja</option>
            <option value="domicilio">Domicílio</option>
          </select>
        </div>

        {formData.location === "domicilio" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Endereço completo para atendimento domiciliar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            placeholder="Observações adicionais..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default Agendamentos;
