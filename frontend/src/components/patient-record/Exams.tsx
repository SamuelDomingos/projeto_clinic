
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload, Eye } from "lucide-react";

interface ExamsProps {
  patient: { id: number; name: string };
}

export function Exams({ patient }: ExamsProps) {
  const exams = [
    { id: 1, name: "Hemograma Completo", date: "2024-05-15", type: "Laboratorial", status: "Normal" },
    { id: 2, name: "Dermatoscopia", date: "2024-05-01", type: "Imagem", status: "Alterado" },
    { id: 3, name: "Biópsia", date: "2024-04-20", type: "Histopatológico", status: "Benigno" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exames</h3>
        <Button><Upload className="h-4 w-4 mr-2" />Adicionar Exame</Button>
      </div>
      
      <div className="grid gap-4">
        {exams.map(exam => (
          <Card key={exam.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{exam.name}</h4>
                  <p className="text-sm text-gray-600">{exam.type} - {exam.date}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    exam.status === 'Normal' ? 'bg-green-100 text-green-800' : 
                    exam.status === 'Alterado' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>{exam.status}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
