import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, Palette, Building, Plus, Tag, Calendar } from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsRoot = location.pathname === "/settings";

  if (!isSettingsRoot) {
    return <Outlet />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/users")}>
          <CardHeader>
            <Users className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerencie os usuários do sistema</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/suppliers")}>
          <CardHeader>
            <Building className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Fornecedores</CardTitle>
            <CardDescription>Gerencie os fornecedores do sistema</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/protocols")}>
          <CardHeader>
            <Plus className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Protocolos</CardTitle>
            <CardDescription>Gerencie os protocolos e procedimentos</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/payment-methods")}>
          <CardHeader>
            <CreditCard className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>Gerencie as formas de pagamento</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/categories")}>
          <CardHeader>
            <Tag className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Gerencie as categorias de transações</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/theme")}>
          <CardHeader>
            <Palette className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Tema</CardTitle>
            <CardDescription>Personalize a aparência do sistema</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/settings/schedule")}>
          <CardHeader>
            <Calendar className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Agenda</CardTitle>
            <CardDescription>Gerencie as configurações de agenda da clínica</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
