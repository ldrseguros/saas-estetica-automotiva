import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BookingLayout from "./pages/Booking";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";

import Usuarios from "./pages/Admin/Usuarios";
import Clientes from "./pages/Admin/Clientes";
import Servicos from "./pages/Admin/Servicos";
import Agendamentos from "./pages/Admin/Agendamentos";
import WhatsApp from "./pages/Admin/WhatsApp";
import Assinatura from "./pages/Admin/Assinatura";
import Planos from "./pages/Admin/Planos";
import Email from "./pages/Admin/Email";
import TenantDashboard from "./pages/Admin/TenantDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Novas páginas SaaS
import LandingPage from "./pages/LandingPage";
import Cadastro from "./pages/Cadastro";
import Checkout from "./pages/Checkout";
import PublicBooking from "./pages/PublicBooking";
import DashboardFinanceiro from "./pages/Admin/Financeiro/Dashboard";
import TransacoesFinanceiras from "./pages/Admin/Financeiro/Transacoes";
import CategoriasFinanceiras from "./pages/Admin/Financeiro/Categorias";
import MetodosPagamento from "./pages/Admin/Financeiro/Metodos";

const queryClient = new QueryClient();

// Página de não autorizado
const UnauthorizedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Acesso Negado
      </h2>
      <p className="text-gray-600 mb-8">
        Você não tem permissão para acessar esta página.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Voltar
      </button>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas SaaS */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rota original da página home (renomeada para /cliente) */}
          <Route path="/cliente" element={<Home />} />

          {/* Rotas protegidas para usuários/clientes */}
          <Route
            path="/painel"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE", "CLIENT"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicos"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE", "CLIENT"]}>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendar/*"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE", "CLIENT"]}>
                <BookingLayout />
              </ProtectedRoute>
            }
          />

          {/* Rotas de administração - apenas para TENANT_ADMIN e SUPER_ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agendamentos"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Agendamentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Clientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/servicos"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Servicos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/whatsapp"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <WhatsApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assinatura"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Assinatura />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/planos"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Planos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <Email />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/financeiro"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <DashboardFinanceiro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/financeiro/transacoes"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <TransacoesFinanceiras />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/financeiro/categorias"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <CategoriasFinanceiras />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/financeiro/metodos"
            element={
              <ProtectedRoute allowedRoles={["TENANT_ADMIN", "SUPER_ADMIN"]}>
                <MetodosPagamento />
              </ProtectedRoute>
            }
          />

          {/* Rota de captura */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
