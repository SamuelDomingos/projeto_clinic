
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Stethoscope, Syringe, FileText } from "lucide-react";

interface ProcedureDetailsProps {
  procedure: {
    id: number;
    name: string;
    price: number;
    sessions: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ProcedureDetails({ procedure, isOpen, onClose }: ProcedureDetailsProps) {
  const procedureDetails = {
    doctorSessions: [
      { id: 1, name: "Consulta Inicial", duration: 60, description: "Avaliação completa do paciente" },
      { id: 2, name: "Acompanhamento 1", duration: 30, description: "Primeira consulta de acompanhamento" },
      { id: 3, name: "Acompanhamento 2", duration: 30, description: "Segunda consulta de acompanhamento" }
    ],
    applications: [
      { id: 1, name: "Aplicação Botox", product: "Botox Allergan 100U", quantity: 50, unit: "unidades" },
      { id: 2, name: "Preenchimento", product: "Ácido Hialurônico", quantity: 1, unit: "ml" }
    ],
    otherItems: [
      { id: 1, name: "Kit Cuidados Pós", description: "Kit com produtos para cuidados em casa" },
      { id: 2, name: "Orientações", description: "Manual de cuidados e orientações" }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {procedure.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Preço Total</label>
              <p className="text-lg font-bold text-green-600">R$ {procedure.price.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total de Sessões</label>
              <p className="text-lg font-bold text-blue-600">{procedure.sessions}</p>
            </div>
          </div>

          <Tabs defaultValue="sessions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sessions" className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4" />
                <span>Sessões com Médico</span>
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center space-x-2">
                <Syringe className="h-4 w-4" />
                <span>Aplicações/Injetáveis</span>
              </TabsTrigger>
              <TabsTrigger value="others" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Outros Itens</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sessões com o Médico</h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Sessão
                </Button>
              </div>
              
              <div className="space-y-3">
                {procedureDetails.doctorSessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{session.name}</h4>
                          <p className="text-sm text-gray-600">{session.description}</p>
                          <Badge variant="outline">{session.duration} minutos</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Aplicações/Injetáveis</h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Aplicação
                </Button>
              </div>
              
              <div className="space-y-3">
                {procedureDetails.applications.map((application) => (
                  <Card key={application.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{application.name}</h4>
                          <p className="text-sm text-gray-600">{application.product}</p>
                          <Badge variant="outline">
                            {application.quantity} {application.unit}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="others" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Outros Itens</h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {procedureDetails.otherItems.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
