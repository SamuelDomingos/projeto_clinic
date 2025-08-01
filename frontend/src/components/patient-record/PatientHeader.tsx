import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Edit, Phone, Mail, Calendar, FileText } from "lucide-react";
import type { Patient } from "@/lib/api";

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          {/* Foto do Paciente */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
              {patient.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {/* Informações do Paciente */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{patient.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={patient.status === 'active' ? 'default' : 'secondary'}
                    className={patient.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-muted text-muted-foreground'}
                  >
                    {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {patient.bloodType && (
                    <Badge variant="outline" className="border-border text-foreground">
                      {patient.bloodType}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>

            {/* Detalhes de Contato */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{patient.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{patient.email}</span>
                </div>
                {patient.birthDate && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(patient.birthDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {patient.profession && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{patient.profession}</span>
                  </div>
                )}
                {patient.insurance && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{patient.insurance}</span>
                  </div>
                )}
                {patient.allergies && Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Alergias: {patient.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Última Visita</p>
                <p className="text-lg font-semibold">
                  {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total de Sessões</p>
                <p className="text-lg font-semibold">{patient.totalSessions || 0}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold capitalize">{patient.status}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
