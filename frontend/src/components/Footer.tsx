
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border py-10">
      <div className="container grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-muted-foreground text-sm">
            Centro especializado em estética automotiva.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Links Rápidos</h3>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/agendar" className="text-muted-foreground hover:text-primary transition-colors">
              Agendar
            </Link>
            <Link to="/painel" className="text-muted-foreground hover:text-primary transition-colors">
              Painel
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Contato</h3>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Endereço: Av. Castro Alves - Res. Pedro Miranda, Sen. Canedo - GO, 75262-541</p>
            <p>Instagram: @dm.centrodesteticaautomotiva</p>
            <p>Ligação: +55 (62) 9367-9897</p>
            <p>WhatsApp: +55 (62) 99232-8648</p>
          </div>
        </div>
      </div>
      
      <div className="container mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2025 DM Centro de Estética Automotiva. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
