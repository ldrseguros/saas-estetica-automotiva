import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UploadCloud, X, Image } from "lucide-react";
import axios from "axios";

interface Service {
  title: string;
  description?: string;
  price: number;
  duration: number;
  imageSrc?: string;
}

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Service) => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [serviceData, setServiceData] = useState<Service>({
    title: "",
    description: "",
    price: 0,
    duration: 60,
    imageSrc: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
    price?: string;
    duration?: string;
  }>({});

  // Estado para gerenciar o upload de imagem
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "duration" ? Number(value) : value,
    }));

    // Limpar erro quando o usuário corrige o campo
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Função para lidar com a seleção de arquivo
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Verificar tipo de arquivo
      if (!file.type.match("image.*")) {
        toast.error("Por favor, selecione apenas arquivos de imagem.");
        return;
      }

      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem não pode ser maior que 5MB.");
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Função para remover a imagem selecionada
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setServiceData((prev) => ({ ...prev, imageSrc: "" }));
  };

  // Função para fazer upload da imagem
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append("image", selectedImage);

    setUploading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "/api/services/admin/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.imagePath;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw new Error("Não foi possível fazer o upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!serviceData.title.trim()) {
      newErrors.title = "O título do serviço é obrigatório";
    }

    if (serviceData.price <= 0) {
      newErrors.price = "O preço deve ser maior que zero";
    }

    if (serviceData.duration <= 0) {
      newErrors.duration = "A duração deve ser maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setUploading(true);

        // Se há uma imagem selecionada, primeiro faz o upload
        let imagePath = null;
        if (selectedImage) {
          imagePath = await uploadImage();
        }

        // Cria objeto de serviço com caminho da imagem se disponível
        const serviceToSave = {
          ...serviceData,
          imageSrc: imagePath || serviceData.imageSrc,
        };

        onSave(serviceToSave);
        resetForm();
      } catch (error) {
        console.error("Error saving service:", error);
        toast.error("Erro ao criar serviço");
      } finally {
        setUploading(false);
      }
    }
  };

  const resetForm = () => {
    setServiceData({
      title: "",
      description: "",
      price: 0,
      duration: 60,
      imageSrc: "",
    });
    setErrors({});
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Novo Serviço
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha as informações para adicionar um novo serviço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Título*
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Lavagem completa"
              value={serviceData.title}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white"
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalhes sobre o serviço"
              value={serviceData.description}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">
                Preço (R$)*
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="36.99"
                value={serviceData.price}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
              {errors.price && (
                <p className="text-red-400 text-sm">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">
                Duração (minutos)*
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                placeholder="60"
                value={serviceData.duration}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
              {errors.duration && (
                <p className="text-red-400 text-sm">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Seção de upload de imagem */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">
              Imagem do Serviço
            </Label>

            {previewUrl ? (
              <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden border border-slate-700">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-slate-600 rounded-md p-4 text-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() =>
                  document.getElementById("service-image")?.click()
                }
              >
                <UploadCloud className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">
                  Clique para fazer upload de uma imagem
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Formatos suportados: JPG, PNG, WEBP ou GIF (max. 5MB)
                </p>
              </div>
            )}

            <Input
              id="service-image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-brand-red to-red-500 hover:from-brand-red/90 hover:to-red-600 text-white"
              disabled={uploading}
            >
              {uploading ? "Salvando..." : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceModal;
