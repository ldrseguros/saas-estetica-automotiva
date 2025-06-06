import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  MessageCircle,
  CreditCard,
  Calendar,
  Car,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current:
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard",
    },
    {
      name: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
      current: location.pathname === "/admin/usuarios",
      description: "Funcionários e administradores",
    },
    {
      name: "Clientes",
      href: "/admin/clientes",
      icon: UserCircle,
      current: location.pathname === "/admin/clientes",
      description: "Gerenciar clientes",
    },
    {
      name: "WhatsApp",
      href: "/admin/whatsapp",
      icon: MessageCircle,
      current: location.pathname === "/admin/whatsapp",
      description: "Configurações de WhatsApp",
    },
    {
      name: "Assinatura",
      href: "/admin/assinatura",
      icon: CreditCard,
      current: location.pathname === "/admin/assinatura",
      description: "Planos e pagamentos",
    },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar para mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent
              navigation={navigation}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent
            navigation={navigation}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header mobile */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-red"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Área de conteúdo */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

// Tipos para a navegação
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  description?: string;
}

interface User {
  name?: string;
  role?: string;
}

// Componente do conteúdo da sidebar
const SidebarContent: React.FC<{
  navigation: NavigationItem[];
  user: User;
  onLogout: () => void;
}> = ({ navigation, user, onLogout }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header da sidebar */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-brand-red">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Car className="h-8 w-8 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-semibold">Admin Panel</h1>
            <p className="text-red-100 text-xs">Estética Automotiva</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-white space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? "bg-brand-red text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <Icon
                  className={`${
                    item.current
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  } mr-3 flex-shrink-0 h-5 w-5`}
                />
                <div className="flex-1">
                  <div>{item.name}</div>
                  {item.description && (
                    <div
                      className={`text-xs ${
                        item.current ? "text-red-100" : "text-gray-400"
                      }`}
                    >
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer da sidebar com informações do usuário */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-brand-red text-white flex items-center justify-center">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user.name || "Admin"}
                </p>
                <div className="flex items-center">
                  <Badge variant="secondary" className="text-xs">
                    {user.role === "TENANT_ADMIN" ? "Admin" : user.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
