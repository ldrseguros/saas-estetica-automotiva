import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Interface for Service data from backend
interface Service {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  imageSrc?: string | null;
  // Add other fields if necessary, like createdAt, updatedAt
}

const Home: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null); // Optional: for displaying specific error messages

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      // setError(null);
      try {
        const response = await fetch("/api/services"); // Use proxied path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data.slice(0, 3)); // Assuming you want to show only a few featured services on home
      } catch (err) {
        console.error("Failed to fetch services:", err);
        toast.error("Falha ao carregar serviços. Tente novamente mais tarde.");
        // setError(err.message || "Failed to fetch services");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <main className="flex-1">
        <Hero />

        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-6 text-white">
              Nossos Serviços em Destaque
            </h2>
            <p className="text-center text-slate-300 mb-12 max-w-3xl mx-auto">
              Explore nossos serviços de estética automotiva premium, projetados
              para dar ao seu veículo o tratamento que ele merece, no conforto
              da sua casa.
            </p>

            {isLoading ? (
              <div className="text-center text-slate-300">
                <p>Carregando serviços...</p>{" "}
                {/* Replace with a spinner or skeleton loader if desired */}
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
              <div className="text-center text-slate-400 py-8">
                <p>Nenhum serviço disponível no momento. Volte em breve!</p>
              </div>
            )}

            <div className="mt-16 text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white transition-colors duration-200 py-3 px-8 text-lg"
              >
                <Link to="/servicos">Ver Todos os Serviços</Link>
              </Button>
            </div>
          </div>
        </section>

        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
