
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Heart, AlertTriangle } from "lucide-react";

interface AnamnesisProps {
  patient: {
    id: number;
    name: string;
  };
}

export function Anamnesis({ patient }: AnamnesisProps) {
  const anamnesisData = {
    chiefComplaint: "Manchas escuras no rosto que apareceram após a gravidez",
    currentIllness: "Paciente relata surgimento de melasma há 2 anos, intensificado pela exposição solar",
    pastHistory: [
      "Hipertensão arterial controlada",
      "Duas gestações sem complicações",
      "Cirurgia de vesícula em 2018"
    ],
    familyHistory: [
      "Mãe: Diabetes tipo 2, hipertensão",
      "Pai: Infarto aos 65 anos",
      "Irmã: Câncer de mama aos 45 anos"
    ],
    allergies: ["Penicilina", "Látex"],
    medications: [
      "Losartana 50mg - 1x ao dia",
      "Anticoncepcional oral",
      "Complexo vitamínico"
    ],
    socialHistory: {
      smoking: "Nunca fumou",
      alcohol: "Social (fins de semana)",
      exercise: "Caminhada 3x por semana",
      diet: "Balanceada"
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Queixa Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Queixa Principal</CardTitle>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{anamnesisData.chiefComplaint}</p>
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">História da Doença Atual</h4>
            <p className="text-gray-600 text-sm">{anamnesisData.currentIllness}</p>
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Antecedentes Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {anamnesisData.pastHistory.map((history, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700">{history}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes Familiares */}
      <Card>
        <CardHeader>
          <CardTitle>Antecedentes Familiares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {anamnesisData.familyHistory.map((history, index) => (
              <div key={index} className="text-sm text-gray-700">
                {history}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos e Alergias */}
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos e Alergias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              Alergias
            </h4>
            <div className="flex flex-wrap gap-1">
              {anamnesisData.allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive">{allergy}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Medicamentos em Uso</h4>
            <div className="space-y-1">
              {anamnesisData.medications.map((med, index) => (
                <div key={index} className="text-sm text-gray-700">{med}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hábitos de Vida */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Hábitos de Vida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h5 className="font-medium text-gray-900">Tabagismo</h5>
              <p className="text-sm text-gray-600">{anamnesisData.socialHistory.smoking}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Álcool</h5>
              <p className="text-sm text-gray-600">{anamnesisData.socialHistory.alcohol}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Exercícios</h5>
              <p className="text-sm text-gray-600">{anamnesisData.socialHistory.exercise}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Dieta</h5>
              <p className="text-sm text-gray-600">{anamnesisData.socialHistory.diet}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
