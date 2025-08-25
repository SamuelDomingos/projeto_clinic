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
import Health from "./pages/Health/Health";
import VideoDetail from "./pages/Culture/VideoDetail";
import VideoPlayer from "./pages/Culture/VideoPlayer";
import Culture from "./pages/Culture/Culture";
import QuestionPage from "./pages/Health/Question/QuestionPage";
import Painel from "./pages/Health/Manager/Painel";
import IAPage from "./pages/Health/Manager/IAPage";
import ManagerHealth from "./pages/Health/Manager/ManagerHealth";
import CategoryForm from "./pages/Health/Category/CategoryForm";
import QuestionForm from "./pages/Health/Question/QuestionForm";
import Schedule from "./pages/settings/Schedule";
import ExecutorConfig from './pages/settings/ExecutorConfig';
import { ScheduleConfigProvider } from "./contexts/ScheduleConfigContext";
import { FloatingHelpDesk } from "./components/help-desk/floating-help-desk";
// import Management from "./pages/Management/Management"; // Quando o arquivo existir

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

  return (
    <>
      {children}
      <FloatingHelpDesk />
    </>
  );
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
        <Route path="transactions" element={<Transactions />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sessions" element={<Sessions />} />
        {/* Rotas para Cultura e Saúde */}
        <Route path="culture" element={<Culture />} />
        <Route path="health" element={<Health />} />
        <Route path="health/question" element={<QuestionPage />} />
        <Route path="health/question/new" element={<QuestionForm />} />
        <Route path="health/question/:id/edit" element={<QuestionForm />} />
        // Adicionar após a linha 84:
        <Route path="health/question/:id" element={<QuestionPage />} />
        <Route path="health/painel" element={<Painel />} />
        <Route path="health/ia" element={<IAPage />} />
        <Route path="health/manager" element={<ManagerHealth />} />
        <Route path="health/category/new" element={<CategoryForm />} />
        <Route path="health/category/:id/edit" element={<CategoryForm />} />
        <Route path="settings" element={<Settings />}>
          <Route index element={<Navigate to="protocols" replace />} />
          <Route path="protocols" element={<Protocols />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="users" element={<Users />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="theme" element={<Theme />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="executors/:id" element={<ExecutorConfig />} />
        </Route>
        <Route path="users/:id" element={<UserProfile />} />
        <Route path="culture/video-detail" element={<VideoDetail />} />
        <Route path="culture/video-player" element={<VideoPlayer />} />
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
          <ScheduleConfigProvider>
            <AppRoutes />
          </ScheduleConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
