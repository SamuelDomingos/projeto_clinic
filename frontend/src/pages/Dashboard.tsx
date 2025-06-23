import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  Clock,
} from "lucide-react";
import { NumberFlow } from "@/components/ui/number-flow";

export default function Dashboard() {
  // Dados mockados para demonstração
  const stats = [
    {
      title: "Agendamentos Hoje",
      value: "12",
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Receita do Mês",
      value: "R$ 45.780",
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Pacientes Ativos",
      value: "347",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Produtos em Estoque",
      value: "156",
      icon: Package,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const alerts = [
    { type: "danger", message: "3 faturas vencidas", icon: AlertTriangle },
    { type: "warning", message: "5 produtos com validade próxima", icon: Clock },
    { type: "info", message: "2 contas a pagar vencem hoje", icon: DollarSign },
  ];

  const recentAppointments = [
    { time: "09:00", patient: "Maria Silva", procedure: "Consulta Dermatológica", status: "confirmed" },
    { time: "10:30", patient: "João Santos", procedure: "Aplicação Botox", status: "completed" },
    { time: "14:00", patient: "Ana Costa", procedure: "Limpeza de Pele", status: "pending" },
    { time: "15:30", patient: "Carlos Oliveira", procedure: "Consulta Geral", status: "confirmed" },
  ];

  function renderStatValue(stat: { value: string }) {
    if (stat.value.startsWith("R$")) {
      const numeric = Number(stat.value.replace(/[^\d,.-]/g, "").replace(",", "."));
      return <NumberFlow value={numeric} currency delay={200} />;
    } else {
      const numeric = Number(stat.value);
      return <NumberFlow value={numeric} delay={200} />;
    }
  }

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da clínica</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Última atualização</p>
          <p className="text-lg font-semibold text-foreground">
            {new Date().toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200 bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {renderStatValue(stat)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-card-foreground">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span>Alertas Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <alert.icon className={`h-5 w-5 ${
                  alert.type === 'danger' ? 'text-red-600 dark:text-red-400' :
                  alert.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                }`} />
                <span className="text-foreground">{alert.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agendamentos do Dia */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-card-foreground">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Agendamentos de Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-semibold text-foreground w-16">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.procedure}</p>
                  </div>
                </div>
                <Badge 
                  className={
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  }
                >
                  {appointment.status === 'completed' ? 'Concluído' :
                   appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
