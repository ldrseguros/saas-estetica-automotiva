
import React from 'react';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  
  const handleScheduleClick = () => {
    // Check if user is logged in
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      // If logged in, go directly to scheduling
      navigate('/agendar');
    } else {
      // If not logged in, redirect to login page
      navigate('/login', { state: { redirect: '/agendar' } });
    }
  };

  return (
    <div className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Placeholder for background image */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90 z-10"></div>
      
      <div className="container relative z-20 py-20">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Estética Automotiva Profissional
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Agende seu horário em minutos e deixe seu veículo impecável.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-brand-red hover:bg-brand-red/90"
              onClick={handleScheduleClick}
            >
              Agendar
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <Link to="/servicos">
                Nossos Serviços
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
