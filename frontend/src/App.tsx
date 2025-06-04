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
import AdminDashboard from "./pages/Admin";
import Usuarios from "./pages/Admin/Usuarios";
import Clientes from "./pages/Admin/Clientes";
import WhatsApp from "./pages/Admin/WhatsApp";
import Assinatura from "./pages/Admin/Assinatura";
import TenantDashboard from "./pages/Admin/TenantDashboard";

// Novas páginas SaaS
import LandingPage from "./pages/LandingPage";
import Cadastro from "./pages/Cadastro";
import Checkout from "./pages/Checkout";
import PublicBooking from "./pages/PublicBooking";

const queryClient = new QueryClient();

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
          <Route path="/agendar-servico" element={<PublicBooking />} />

          {/* Rota original da página home (renomeada para /cliente) */}
          <Route path="/cliente" element={<Home />} />

          {/* Rotas protegidas */}
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/agendar/*" element={<BookingLayout />} />

          {/* Rotas de administração */}
          <Route path="/admin" element={<TenantDashboard />} />
          <Route path="/admin/dashboard" element={<TenantDashboard />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/clientes" element={<Clientes />} />
          <Route path="/admin/whatsapp" element={<WhatsApp />} />
          <Route path="/admin/assinatura" element={<Assinatura />} />

          {/* Rota de captura */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
