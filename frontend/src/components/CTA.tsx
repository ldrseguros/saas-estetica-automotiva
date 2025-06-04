import React from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";

const CTA: React.FC = () => {
  const navigate = useNavigate();

  const handleScheduleClick = () => {
    // Check if user is logged in
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      // If logged in, go directly to scheduling
      navigate("/agendar");
    } else {
      // If not logged in, redirect to login page
      navigate("/login", { state: { redirect: "/agendar" } });
    }
  };

  return (
    <section className="bg-brand-red py-16">
      <div className="container text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Pronto para transformar seu veículo?
        </h2>
        <p className="text-white/80 mb-8 max-w-2xl mx-auto">
          Agende seu horário hoje e experimente a excelência da DM Centro de
          Estética Automotiva.
        </p>
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent border-white text-white hover:bg-white hover:text-brand-red"
          onClick={handleScheduleClick}
        >
          Agendar Seu Serviço
        </Button>
      </div>
    </section>
  );
};

export default CTA;
