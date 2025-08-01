
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface EvolutionProps {
  patient: { id: number; name: string };
}

export function Evolution({ patient }: EvolutionProps) {
  const evolutions = [
    { id: 1, date: "2024-06-01", doctor: "Dr. João Silva", notes: "Paciente apresenta melhora das lesões pigmentares. Continuidade do tratamento." },
    { id: 2, date: "2024-05-15", doctor: "Dr. João Silva", notes: "Primeira aplicação de hidroquinona. Orientações sobre fotoproteção reforçadas." }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Evolução do Paciente</h3>
        <Button><Plus className="h-4 w-4 mr-2" />Nova Evolução</Button>
      </div>

      <div className="space-y-4">
        {evolutions.map(evolution => (
          <Card key={evolution.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{evolution.doctor}</span>
                </div>
                <span className="text-sm text-gray-500">{evolution.date}</span>
              </div>
              <p className="text-gray-700">{evolution.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
