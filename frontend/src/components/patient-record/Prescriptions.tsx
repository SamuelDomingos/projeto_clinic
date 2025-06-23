
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Printer } from "lucide-react";

interface PrescriptionsProps {
  patient: { id: number; name: string };
}

export function Prescriptions({ patient }: PrescriptionsProps) {
  const prescriptions = [
    { id: 1, medication: "Hidroquinona 4%", dosage: "Aplicar à noite", date: "2024-06-01", active: true },
    { id: 2, medication: "Protetor Solar FPS 60", dosage: "Reaplicar a cada 2h", date: "2024-06-01", active: true },
    { id: 3, medication: "Vitamina C", dosage: "Aplicar pela manhã", date: "2024-05-15", active: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Prescrições</h3>
        <Button><Plus className="h-4 w-4 mr-2" />Nova Receita</Button>
      </div>

      <div className="grid gap-4">
        {prescriptions.map(prescription => (
          <Card key={prescription.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <Pill className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">{prescription.medication}</h4>
                    <p className="text-sm text-gray-600">{prescription.dosage}</p>
                    <p className="text-xs text-gray-500">{prescription.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    prescription.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.active ? 'Ativo' : 'Finalizado'}
                  </span>
                  <Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
