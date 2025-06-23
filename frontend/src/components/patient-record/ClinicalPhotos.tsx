
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Eye } from "lucide-react";

interface ClinicalPhotosProps {
  patient: { id: number; name: string };
}

export function ClinicalPhotos({ patient }: ClinicalPhotosProps) {
  const photos = [
    { id: 1, title: "Antes - Melasma Facial", date: "2024-04-15", url: "/placeholder.svg" },
    { id: 2, title: "Durante - 1 mês", date: "2024-05-15", url: "/placeholder.svg" },
    { id: 3, title: "Atual - 2 meses", date: "2024-06-15", url: "/placeholder.svg" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fotos Clínicas</h3>
        <Button><Camera className="h-4 w-4 mr-2" />Adicionar Foto</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map(photo => (
          <Card key={photo.id}>
            <CardContent className="p-4">
              <img src={photo.url} alt={photo.title} className="w-full h-48 object-cover rounded mb-2" />
              <h4 className="font-medium">{photo.title}</h4>
              <p className="text-sm text-gray-600">{photo.date}</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <Eye className="h-4 w-4 mr-2" />Visualizar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
