import API from "@/utils/apiService";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { set } from "date-fns";

// Interface for Service data from backend
interface Service {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  imageSrc?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await API.get("/services");
        setServices(response.data);
        
      } catch (err) {
        console.error("Failed to fetch services:", err);
        toast.error("Falha ao carregar serviços. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <Card className="mb-8 bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white">
                Nossos Serviços
              </CardTitle>
              <CardDescription className="text-slate-300">
                Conheça os serviços de estética automotiva premium que
                oferecemos em Goiânia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Oferecemos serviços de estética automotiva de alta qualidade a
                domicílio. Agende agora mesmo e tenha seu veículo revitalizado
                com produtos profissionais.
              </p>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
              <span className="ml-3 text-xl text-slate-300">
                Carregando serviços...
              </span>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description || ""}
                  price={service.price}
                  imageSrc={service.imageSrc}
                  duration={service.duration}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-slate-400">
                Nenhum serviço encontrado.
              </p>
              <p className="text-slate-500 mt-2">
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
