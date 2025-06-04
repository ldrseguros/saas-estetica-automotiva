
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2 text-brand-red no-underline">
      <div className="relative w-8 h-8">
        {/* Placeholder for logo image */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-brand-red">
          <span className="text-brand-red text-xs font-bold">DM</span>
        </div>
      </div>
      <span className="font-bold text-xl">DM Centro de Estética Automotiva</span>
    </Link>
  );
};

export default Logo;
