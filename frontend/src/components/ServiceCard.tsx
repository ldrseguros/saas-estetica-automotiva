import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { formatCurrency, formatDuration } from "@/utils/formatters";
import { Clock, Tag } from "lucide-react";
import { buildImageUrl } from "../utils/imageUtils.js";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageSrc?: string | null;
  duration?: number | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  price,
  imageSrc,
  duration,
}) => {
  // Construir URL da imagem baseada no ambiente
  const imageUrl = buildImageUrl(imageSrc);

  console.log("ServiceCard RENDERIZADO");
  console.log("[ServiceCard] imageSrc recebido:", imageSrc);
  console.log("[ServiceCard] imageUrl final:", imageUrl);

  return (
    <>
      <div className="service-card bg-slate-800/60 rounded-lg overflow-hidden border border-slate-700 shadow-lg flex flex-col h-full hover:shadow-brand-red/30 transition-shadow duration-300">
        <div className="service-image-container h-48 bg-slate-700 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Imagem do serviço ${title}`}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/img/placeholder.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-400">
              <span className="text-sm">Imagem Indisponível</span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow gap-3">
          <h3
            className="text-xl font-semibold text-white truncate"
            title={title}
          >
            {title}
          </h3>
          <p className="text-sm text-slate-300 line-clamp-3 flex-grow min-h-[60px]">
            {description}
          </p>

          <div className="flex items-center justify-between text-sm mt-2">
            <div
              className="flex items-center gap-1 text-emerald-400"
              title="Preço"
            >
              <Tag size={16} />
              <span className="font-medium">{formatCurrency(price)}</span>
            </div>
            {duration && duration > 0 && (
              <div
                className="flex items-center gap-1 text-slate-400"
                title="Duração"
              >
                <Clock size={16} />
                <span className="font-medium">{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-auto w-full bg-transparent border-brand-red text-brand-red hover:bg-brand-red hover:text-white transition-colors duration-200"
          >
            <Link to={`/agendar?service=${id}`}>Agendar Este Serviço</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ServiceCard;
