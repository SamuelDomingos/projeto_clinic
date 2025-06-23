import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ContactCRM from "./pages/ContactCRM";
import Scheduling from "./pages/Scheduling";
import Invoices from "./pages/Invoices";
import Transactions from "./pages/Transactions";
import Inventory from "./pages/Inventory";
import Sessions from "./pages/Sessions";
import Settings from "./pages/Settings";
import Protocols from "./pages/settings/Protocols";
import PaymentMethods from "./pages/settings/PaymentMethods";
import Users from "./pages/settings/Users";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Suppliers from "./pages/settings/Suppliers";
import Theme from "./pages/settings/Theme";
import Categories from "./pages/settings/Categories";

const queryClient = new QueryClient();

// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<ContactCRM />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="settings" element={<Settings />}>
          <Route index element={<Navigate to="protocols" replace />} />
          <Route path="protocols" element={<Protocols />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="users" element={<Users />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="theme" element={<Theme />} />
        </Route>
        <Route path="users/:id" element={<UserProfile />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
