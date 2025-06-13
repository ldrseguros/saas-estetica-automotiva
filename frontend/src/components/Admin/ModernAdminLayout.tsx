import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Bell,
  Search,
  Package,
  TrendingUp,
} from "lucide-react";

interface ModernAdminLayoutProps {
  children: React.ReactNode;
}

const ModernAdminLayout: React.FC<ModernAdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current:
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard",
      description: "Visão geral",
    },
    {
      name: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
      current: location.pathname === "/admin/usuarios",
      description: "Equipe",
    },
    {
      name: "Agendamentos",
      href: "/admin/agendamentos",
      icon: Calendar,
      current: location.pathname === "/admin/agendamentos",
      description: "Gerenciar agendamentos",
    },
    {
      name: "Clientes",
      href: "/admin/clientes",
      icon: UserCircle,
      current: location.pathname === "/admin/clientes",
      description: "Base de clientes",
    },
    {
      name: "Serviços",
      href: "/admin/servicos",
      icon: Package,
      current: location.pathname === "/admin/servicos",
      description: "Serviços oferecidos",
    },
    {
      name: "Financeiro",
      href: "/admin/financeiro",
      icon: TrendingUp,
      current: location.pathname.startsWith("/admin/financeiro"),
      description: "Gestão financeira",
    },
    {
      name: "WhatsApp",
      href: "/admin/whatsapp",
      icon: MessageCircle,
      current: location.pathname === "/admin/whatsapp",
      description: "Automação",
    },
    {
      name: "Assinatura",
      href: "/admin/assinatura",
      icon: CreditCard,
      current: location.pathname === "/admin/assinatura",
      description: "Planos",
    },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 lg:hidden"
          >
            <Sidebar
              navigation={navigation}
              user={user}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar navigation={navigation} user={user} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-lg mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  description: string;
}

interface User {
  name?: string;
  role?: string;
}

// Sidebar Component
const Sidebar: React.FC<{
  navigation: NavigationItem[];
  user: User;
  onLogout: () => void;
  onClose?: () => void;
}> = ({ navigation, user, onLogout, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-red-600 to-red-700">
        <div className="flex items-center my-3">
          <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-bold">Admin Panel</h1>
            <p className="text-red-100 text-xs">Estética Automotiva</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.current
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                    item.current ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div
                    className={`text-xs ${
                      item.current ? "text-red-100" : "text-gray-400"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {item.current && (
                  <motion.div
                    layoutId="activeTab"
                    className="h-2 w-2 bg-white rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminLayout;
