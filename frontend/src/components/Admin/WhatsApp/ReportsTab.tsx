import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUp,
  Camera,
  Send,
  ImagePlus,
  Trash2,
  Search,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ReportsTabProps {
  onCreateReport: (
    bookingId: string,
    beforePhotos: string[],
    afterPhotos: string[],
    comments: string
  ) => Promise<boolean>;
  onUploadPhoto: (file: File) => Promise<string>;
  isLoading: boolean;
}

interface Booking {
  id: string;
  client: {
    name: string;
    whatsapp?: string;
  };
  vehicle: {
    brand: string;
    model: string;
    plate: string;
  };
  services: Array<{
    service: {
      title: string;
    };
  }>;
  date: string;
  time: string;
  status: string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  onCreateReport,
  onUploadPhoto,
  isLoading,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [beforePhotos, setBeforePhotos] = useState<
    { name: string; url: string }[]
  >([]);
  const [afterPhotos, setAfterPhotos] = useState<
    { name: string; url: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  // Carregar agendamentos
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/api/bookings/admin", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "completed" },
        });
        setBookings(response.data);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
        toast.error("Erro ao carregar agendamentos");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  // Filtrar agendamentos com base no termo de busca
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.client.name.toLowerCase().includes(searchLower) ||
      booking.vehicle.plate.toLowerCase().includes(searchLower) ||
      booking.services.some((s) =>
        s.service.title.toLowerCase().includes(searchLower)
      )
    );
  });

  // Lidar com upload de fotos "antes"
  const handleBeforePhotosUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const newFiles = Array.from(e.target.files).map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          file,
        }));

        // Em uma implementação completa, aqui seria feito o upload real para o servidor
        // const uploadedUrls = await Promise.all(
        //   newFiles.map(async ({ file }) => await onUploadPhoto(file))
        // );

        setBeforePhotos([
          ...beforePhotos,
          ...newFiles.map(({ name, url }) => ({ name, url })),
        ]);
        toast.success(`${newFiles.length} foto(s) "antes" adicionada(s)`);

        // Limpar input
        e.target.value = "";
      } catch (error) {
        console.error("Erro ao processar fotos:", error);
        toast.error("Erro ao processar fotos");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Lidar com upload de fotos "depois"
  const handleAfterPhotosUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const newFiles = Array.from(e.target.files).map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          file,
        }));

        // Em uma implementação completa, aqui seria feito o upload real para o servidor
        // const uploadedUrls = await Promise.all(
        //   newFiles.map(async ({ file }) => await onUploadPhoto(file))
        // );

        setAfterPhotos([
          ...afterPhotos,
          ...newFiles.map(({ name, url }) => ({ name, url })),
        ]);
        toast.success(`${newFiles.length} foto(s) "depois" adicionada(s)`);

        // Limpar input
        e.target.value = "";
      } catch (error) {
        console.error("Erro ao processar fotos:", error);
        toast.error("Erro ao processar fotos");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Remover foto "antes"
  const handleRemoveBeforePhoto = (index: number) => {
    const newPhotos = [...beforePhotos];
    URL.revokeObjectURL(newPhotos[index].url); // Liberar URL
    newPhotos.splice(index, 1);
    setBeforePhotos(newPhotos);
  };

  // Remover foto "depois"
  const handleRemoveAfterPhoto = (index: number) => {
    const newPhotos = [...afterPhotos];
    URL.revokeObjectURL(newPhotos[index].url); // Liberar URL
    newPhotos.splice(index, 1);
    setAfterPhotos(newPhotos);
  };

  // Limpar formulário
  const resetForm = () => {
    setSelectedBookingId("");
    setComments("");

    // Liberar URLs de objeto
    beforePhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
    afterPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));

    setBeforePhotos([]);
    setAfterPhotos([]);
  };

  // Enviar relatório
  const handleSubmit = async () => {
    if (!selectedBookingId) {
      toast.error("Selecione um agendamento");
      return;
    }

    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      toast.error("Adicione pelo menos uma foto antes e depois");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onCreateReport(
        selectedBookingId,
        beforePhotos.map((p) => p.url),
        afterPhotos.map((p) => p.url),
        comments
      );

      if (success) {
        toast.success("Relatório criado e enviado com sucesso");
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      toast.error("Erro ao criar relatório");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Antes/Depois</CardTitle>
        <CardDescription>
          Crie relatórios com fotos antes e depois do serviço e envie aos
          clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Seleção de agendamento */}
          <div className="space-y-2">
            <Label htmlFor="booking-search">Buscar Agendamento</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="booking-search"
                placeholder="Nome do cliente, placa ou serviço"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="booking-select">Selecionar Agendamento</Label>
              <Select
                value={selectedBookingId}
                onValueChange={setSelectedBookingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um agendamento" />
                </SelectTrigger>
                <SelectContent>
                  {loadingBookings ? (
                    <SelectItem value="loading" disabled>
                      Carregando agendamentos...
                    </SelectItem>
                  ) : filteredBookings.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum agendamento encontrado
                    </SelectItem>
                  ) : (
                    filteredBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.client.name} - {booking.vehicle.plate} -{" "}
                        {new Date(booking.date).toLocaleDateString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedBookingId && (
                <div className="mt-2 text-sm">
                  {(() => {
                    const booking = bookings.find(
                      (b) => b.id === selectedBookingId
                    );
                    if (!booking) return null;

                    return (
                      <div className="p-3 bg-slate-100 rounded-md">
                        <div>
                          <strong>Cliente:</strong> {booking.client.name}
                        </div>
                        <div>
                          <strong>Veículo:</strong> {booking.vehicle.brand}{" "}
                          {booking.vehicle.model} ({booking.vehicle.plate})
                        </div>
                        <div>
                          <strong>Serviços:</strong>{" "}
                          {booking.services
                            .map((s) => s.service.title)
                            .join(", ")}
                        </div>
                        <div>
                          <strong>Data:</strong>{" "}
                          {new Date(booking.date).toLocaleDateString()} às{" "}
                          {booking.time}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Upload de fotos */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fotos "antes" */}
            <div className="space-y-3">
              <Label className="text-lg font-bold">Fotos Antes</Label>
              <Button
                variant="outline"
                className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                onClick={() =>
                  document.getElementById("before-photos")?.click()
                }
                disabled={isUploading}
              >
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span>Adicionar Fotos "Antes"</span>
                <span className="text-xs text-muted-foreground">
                  {beforePhotos.length} foto(s) selecionada(s)
                </span>
              </Button>
              <Input
                id="before-photos"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleBeforePhotosUpload}
                disabled={isUploading}
              />

              {beforePhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {beforePhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-md overflow-hidden"
                    >
                      <img
                        src={photo.url}
                        alt={`Antes ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveBeforePhoto(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fotos "depois" */}
            <div className="space-y-3">
              <Label className="text-lg font-bold">Fotos Depois</Label>
              <Button
                variant="outline"
                className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                onClick={() => document.getElementById("after-photos")?.click()}
                disabled={isUploading}
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span>Adicionar Fotos "Depois"</span>
                <span className="text-xs text-muted-foreground">
                  {afterPhotos.length} foto(s) selecionada(s)
                </span>
              </Button>
              <Input
                id="after-photos"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleAfterPhotosUpload}
                disabled={isUploading}
              />

              {afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {afterPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-md overflow-hidden"
                    >
                      <img
                        src={photo.url}
                        alt={`Depois ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAfterPhoto(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comentários */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comentários sobre o Serviço</Label>
            <Textarea
              id="comments"
              placeholder="Descreva os detalhes do serviço realizado..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>

          {/* Botão Enviar */}
          <Button
            className="w-full bg-brand-red hover:bg-brand-red/90"
            disabled={
              isSubmitting ||
              isLoading ||
              !selectedBookingId ||
              beforePhotos.length === 0 ||
              afterPhotos.length === 0
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Enviar Relatório ao Cliente
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
