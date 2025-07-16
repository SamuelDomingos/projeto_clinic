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
  XCircle,
  Printer,
  Share2
} from "lucide-react";
import { medicalRecordApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { MedicalRecord } from '@/lib/api';
import { MedicalRecordForm } from "./MedicalRecordForm";

interface MedicalRecordProps {
  patientId: string;
}

export function MedicalRecord({ patientId }: MedicalRecordProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

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
    const matchesSearch = record.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || record.recordCategory === typeFilter;
    return matchesSearch && matchesType;
  });

  // Agrupamento por ano e data
  const grouped: Record<string, Record<string, MedicalRecord[]>> = records.reduce((acc, record) => {
    const dateObj = new Date(record.date);
    const year = String(dateObj.getFullYear());
    const day = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    if (!acc[year]) acc[year] = {};
    if (!acc[year][day]) acc[year][day] = [];
    acc[year][day].push(record);
    return acc;
  }, {} as Record<string, Record<string, MedicalRecord[]>>);

  return (
    <div className="space-y-6">
      {/* Barra de ações rápidas */}
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="icon" title="Nova Evolução" onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" title="Anexar Arquivo">
          <FileText className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" title="Imprimir">
          <Printer className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" title="Imagens">
          <Camera className="h-5 w-5" />
        </Button>
      </div>

      {/* Formulário de nova evolução */}
      {showForm && (
        <div className="mb-6">
          <MedicalRecordForm
            patientId={patientId}
            onSuccess={() => {
              setShowForm(false);
              loadRecords();
            }}
          />
        </div>
      )}

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
              <SelectItem value="observation">Observação</SelectItem>
              <SelectItem value="evolution">Evolução</SelectItem>
              <SelectItem value="private_note">Nota Privada</SelectItem>
              <SelectItem value="attachment">Anexo</SelectItem>
              <SelectItem value="prescription">Prescrição</SelectItem>
              <SelectItem value="exam_request">Solicitação de Exame</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, days]: [string, Record<string, MedicalRecord[]>]) => (
          <div key={year}>
            <h2 className="text-xl font-bold mb-2">{year}</h2>
            {Object.entries(days).map(([day, records]: [string, MedicalRecord[]]) => (
              <div key={day} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-muted-foreground">{day}</span>
                </div>
                {records
                  .filter((record) => {
                    const matchesSearch = record.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      record.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesType = typeFilter === "all" || record.recordCategory === typeFilter;
                    return matchesSearch && matchesType;
                  })
                  .map((record) => (
                  <Card key={record.id} className="mb-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-muted">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{record.recordCategory === 'observation' ? 'Observações' : record.recordCategory}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {record.doctor?.name} &bull; {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{record.isPrivate ? 'Privado' : ''}</span>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm whitespace-pre-line">{record.content}</p>
                        {record.attachments && record.attachments.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {record.attachments.map((attachment: any, index: number) => (
                              <Badge key={index} variant="secondary">
                                <FileCheck className="h-3 w-3 mr-1" />
                                {attachment.filename || attachment.type}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" title="Imprimir">
                            <Printer className="h-4 w-4 mr-1" /> Imprimir
                          </Button>
                          <Button size="sm" variant="outline" title="Revalidar">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Revalidar
                          </Button>
                          <Button size="sm" variant="outline" title="Compartilhar">
                            <Share2 className="h-4 w-4 mr-1" /> Compartilhar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
