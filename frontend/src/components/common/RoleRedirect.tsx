import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RoleRedirectProps {
  defaultPath?: string;
}

const RoleRedirect: React.FC<RoleRedirectProps> = ({ defaultPath = "/" }) => {
  const { user, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  // Se não autenticado, redirecionar para página padrão
  if (!user) {
    return <Navigate to={defaultPath} replace />;
  }

  // Redirecionar baseado no role
  switch (user.role) {
    case "TENANT_ADMIN":
    case "SUPER_ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "EMPLOYEE":
      return <Navigate to="/painel/dashboard" replace />;
    case "CLIENT":
      return <Navigate to="/agendar/servicos" replace />;
    default:
      return <Navigate to={defaultPath} replace />;
  }
};

export default RoleRedirect;
