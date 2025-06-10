import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "./ui/button";

// Definição do tipo para o usuário
interface User {
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "EMPLOYEE" | "CLIENT";
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // Verificar se o usuário está logado ao carregar o componente
  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Função para logout
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Função para verificar login antes de agendar
  const handleScheduleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate("/login", { state: { redirect: "/agendar" } });
    }
  };

  return (
    <header className="border-b border-border bg-card text-card-foreground sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground"
              }`
            }
          >
            Início
          </NavLink>
          <NavLink
            to="/agendar"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground"
              }`
            }
            onClick={handleScheduleClick}
          >
            Agendar
          </NavLink>
          <NavLink
            to="/servicos"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground"
              }`
            }
          >
            Serviços
          </NavLink>
          {user && (
            <NavLink
              to={
                user.role === "TENANT_ADMIN" || user.role === "SUPER_ADMIN"
                  ? "/admin"
                  : "/painel"
              }
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-foreground"
                }`
              }
            >
              {user.role === "TENANT_ADMIN" || user.role === "SUPER_ADMIN"
                ? "Admin"
                : "Painel"}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild variant="outline" className="hidden md:flex">
              <NavLink to="/agendar">Agendar Agora</NavLink>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={handleScheduleClick}
            >
              Agendar Agora
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm">
                Olá, {user.name.split(" ")[0]}
              </span>
              <Button
                variant="default"
                onClick={handleLogout}
                className="bg-brand-red hover:bg-brand-red/90"
              >
                <span className="hidden md:inline">Sair</span>
                <span className="md:hidden">Sair</span>
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="default"
              className="bg-brand-red hover:bg-brand-red/90"
            >
              <NavLink to="/login">Entrar</NavLink>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
