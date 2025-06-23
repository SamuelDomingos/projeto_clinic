
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus, FileText } from "lucide-react";

interface MedicalHistoryProps {
  patient: {
    id: number;
    name: string;
  };
}

export function MedicalHistory({ patient }: MedicalHistoryProps) {
  // Dados mockados do histórico médico
  const medicalHistory = [
    {
      id: 1,
      date: "2024-06-01",
      time: "14:30",
      type: "Consulta",
      doctor: "Dr. João Silva",
      procedure: "Consulta Dermatológica",
      status: "Concluído",
      notes: "Paciente apresentou melhora significativa nas lesões. Continuidade do tratamento prescrito."
    },
    {
      id: 2,
      date: "2024-05-15",
      time: "10:00",
      type: "Procedimento",
      doctor: "Dr. João Silva",
      procedure: "Aplicação de Botox",
      status: "Concluído",
      notes: "Aplicação realizada conforme protocolo. Paciente orientada sobre cuidados pós-procedimento."
    },
    {
      id: 3,
      date: "2024-05-01",
      time: "16:00",
      type: "Consulta",
      doctor: "Dra. Ana Costa",
      procedure: "Avaliação Estética",
      status: "Concluído",
      notes: "Primeira consulta. Anamnese completa realizada. Plano de tratamento estabelecido."
    },
    {
      id: 4,
      date: "2024-06-10",
      time: "09:00",
      type: "Consulta",
      doctor: "Dr. João Silva",
      procedure: "Retorno",
      status: "Agendado",
      notes: "Retorno para avaliação dos resultados do tratamento."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consulta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Procedimento':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Exame':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Timeline Médico</h3>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consultas e Procedimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicalHistory.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Linha de conexão */}
                {index < medicalHistory.length - 1 && (
                  <div className="absolute left-4 top-16 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Indicador de tempo */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{entry.time}</p>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(entry.type)}>
                          {entry.type}
                        </Badge>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">{entry.procedure}</h4>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{entry.doctor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Total de Consultas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">8</p>
              <p className="text-sm text-gray-600">Procedimentos Realizados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">6</p>
              <p className="text-sm text-gray-600">Meses de Tratamento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
