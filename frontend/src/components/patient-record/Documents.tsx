
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Upload, Download, Eye } from "lucide-react";

interface DocumentsProps {
  patient: { id: number; name: string };
}

export function Documents({ patient }: DocumentsProps) {
  const documents = [
    { id: 1, name: "Termo de Consentimento - Botox", type: "PDF", date: "2024-05-15", signed: true },
    { id: 2, name: "Contrato de Tratamento", type: "PDF", date: "2024-04-15", signed: true },
    { id: 3, name: "Relatório Médico", type: "PDF", date: "2024-06-01", signed: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documentos</h3>
        <Button><Upload className="h-4 w-4 mr-2" />Adicionar Documento</Button>
      </div>

      <div className="grid gap-4">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.type} - {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    doc.signed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.signed ? 'Assinado' : 'Pendente'}
                  </span>
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
