import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Clock,
  Star,
  Image,
  Upload,
  X,
  Check,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import ModernAdminLayout from "@/components/Admin/ModernAdminLayout";
import { ModernCard, StatCard } from "@/components/Admin/ModernCard";
import ModernButton from "@/components/Admin/ModernButton";
import ModernTable from "@/components/Admin/ModernTable";
import { buildImageUrl } from "../../utils/imageUtils.js";
import API from '../../utils/apiService';

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration: number;
  imageSrc: string | null;
  createdAt: string;
  updatedAt: string;
}

// Type compatible with ModernTable
type ServiceTableData = Service & Record<string, React.ReactNode>;

interface ServiceFormData {
  title: string;
  description: string;
  price: number;
  duration: number;
  imageSrc?: string;
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    price: 0,
    duration: 60,
    imageSrc: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await API.get("/services/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao buscar serviços");
      }

      const data = await response.data;
      setServices(data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error(`Erro ao carregar serviços: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const createService = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await API.post("/api/services/admin", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao criar serviço");
      }

      const newService = response.data;
      setServices((prev) => [...prev, newService]);
      setShowForm(false);
      resetForm();
      toast.success("Serviço criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao criar serviço: ${errorMessage}`);
    }
  };

  const updateService = async () => {
    if (!editingService) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await API.put(
        `/api/services/admin/${editingService.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao atualizar serviço");
      }

      const updatedService = response.data;
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? updatedService : s))
      );
      setEditingService(null);
      setShowForm(false);
      resetForm();
      toast.success("Serviço atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao atualizar serviço: ${errorMessage}`);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await API.get(`/api/services/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao deletar serviço");
      }

      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Serviço deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao deletar serviço: ${errorMessage}`);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);

      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await API.post("/api/services/admin/upload", formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const data = await response.data;
      setFormData((prev) => ({ ...prev, imageSrc: data.imagePath }));
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar imagem: ${errorMessage}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Formato de imagem não suportado");
        return;
      }

      uploadImage(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      duration: 60,
      imageSrc: "",
    });
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      imageSrc: service.imageSrc || "",
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingService(null);
    setShowForm(false);
    resetForm();
  };

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Convert services to table-compatible data
  const servicesTableData: ServiceTableData[] = filteredServices.map(
    (service) =>
      ({
        ...service,
        // Add additional properties needed for table compatibility
      } as ServiceTableData)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    // Arredondar para evitar muitas casas decimais
    const roundedMinutes = Math.round(minutes);

    if (roundedMinutes < 60) {
      return `${roundedMinutes}min`;
    }
    const hours = Math.floor(roundedMinutes / 60);
    const remainingMinutes = roundedMinutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  const getServiceStats = () => {
    const totalServices = services.length;
    const averagePrice =
      services.reduce((sum, service) => sum + service.price, 0) /
      (services.length || 1);

    // Calcular duração média e arredondar para número inteiro
    const totalDuration = services.reduce(
      (sum, service) => sum + service.duration,
      0
    );
    const averageDuration = Math.round(totalDuration / (services.length || 1));

    return {
      totalServices,
      averagePrice,
      averageDuration,
    };
  };

  const stats = getServiceStats();

  const columns = [
    {
      key: "title",
      label: "Serviço",
      render: (value: React.ReactNode, service: ServiceTableData) => (
        <div className="flex items-center space-x-3">
          {service.imageSrc ? (
            <img
              src={`http://localhost:3000${service.imageSrc}`}
              alt={service.title}
              className="h-10 w-10 rounded-lg object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/img/placeholder.png";
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{service.title}</div>
            {service.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {service.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Preço",
      render: (value: React.ReactNode, service: ServiceTableData) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(service.price)}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Duração",
      render: (value: React.ReactNode, service: ServiceTableData) => (
        <span className="text-gray-600">
          {formatDuration(service.duration)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (value: React.ReactNode, service: ServiceTableData) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startEdit(service)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteService(service.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao Carregar Serviços
            </h3>
            <p className="text-red-700">{error}</p>
            <ModernButton
              onClick={fetchServices}
              className="mt-4"
              variant="outline"
            >
              Tentar Novamente
            </ModernButton>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os serviços oferecidos pela sua empresa
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <ModernButton icon={Plus} onClick={() => setShowForm(true)}>
              Novo Serviço
            </ModernButton>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Serviços"
            value={stats.totalServices}
            icon={Package}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Preço Médio"
            value={formatCurrency(stats.averagePrice)}
            icon={DollarSign}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Duração Média"
            value={formatDuration(stats.averageDuration)}
            icon={Clock}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Serviços Ativos"
            value={stats.totalServices}
            icon={Star}
            gradient="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Search */}
        <ModernCard title="" description="" icon={Search} hoverable={false}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </ModernCard>

        {/* Services Table */}
        <ModernCard
          title="Lista de Serviços"
          description={`${filteredServices.length} serviço(s) encontrado(s)`}
          icon={Package}
          hoverable={false}
        >
          <ModernTable
            data={servicesTableData}
            columns={columns}
            emptyMessage="Nenhum serviço encontrado"
          />
        </ModernCard>

        {/* Service Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingService ? "Editar Serviço" : "Novo Serviço"}
                    </h2>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem do Serviço
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {formData.imageSrc ? (
                          <div className="relative">
                            <img
                              src={buildImageUrl(formData.imageSrc)}
                              alt="Preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/img/placeholder.png";
                              }}
                            />
                            <button
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  imageSrc: "",
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Clique para carregar uma imagem
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage
                                ? "Carregando..."
                                : "Carregar Imagem"}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Serviço *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ex: Lavagem Completa"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Descreva o serviço oferecido..."
                      />
                    </div>

                    {/* Price and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="0,00"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duração (minutos) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              duration: parseInt(e.target.value) || 60,
                            }))
                          }
                          className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="60"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-8">
                    <ModernButton variant="outline" onClick={cancelEdit}>
                      Cancelar
                    </ModernButton>
                    <ModernButton
                      icon={editingService ? Check : Plus}
                      onClick={editingService ? updateService : createService}
                      disabled={!formData.title || formData.price <= 0}
                    >
                      {editingService ? "Atualizar" : "Criar"} Serviço
                    </ModernButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModernAdminLayout>
  );
};

export default ServicesPage;
