import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Stethoscope,
  FileText,
  Camera,
  Plus,
  ChevronDown,
  ChevronUp,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { medicalRecordApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecordProps {
  patientId: string;
}

export function MedicalRecord({ patientId }: MedicalRecordProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordApi.getPatientTimeline(patientId);
      setRecords(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico do paciente",
        variant: "destructive"
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4" />;
      case "procedure":
        return <FileText className="h-4 w-4" />;
      case "examination":
        return <Camera className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "procedure":
        return "bg-purple-100 text-purple-800";
      case "examination":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consulta";
      case "procedure":
        return "Procedimento";
      case "examination":
        return "Exame";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Agendado</Badge>;
      case "completed":
        return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de registro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="consultation">Consultas</SelectItem>
              <SelectItem value="procedure">Procedimentos</SelectItem>
              <SelectItem value="examination">Exames</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${getColor(record.type)}`}>
                  {getIcon(record.type)}
                </div>
                <div>
                  <CardTitle className="text-base">{record.procedure}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()} - {record.doctorName}
                  </p>
                </div>
              </div>
              {getStatusBadge(record.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{record.notes}</p>
                {record.evolution && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Evolução:</strong> {record.evolution}
                  </div>
                )}
                {record.attachments && record.attachments.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {record.attachments.map((attachment: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        <FileCheck className="h-3 w-3 mr-1" />
                        {attachment.type}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
