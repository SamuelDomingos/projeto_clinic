import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { medicalRecordApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecordFormProps {
  patientId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

type RecordCategory = 'observation' | 'evolution' | 'private_note' | 'attachment' | 'prescription' | 'exam_request';

interface FormData {
  recordCategory: RecordCategory;
  procedure: string;
  doctorId: string;
  notes: string;
}

export function MedicalRecordForm({ patientId, onSuccess, trigger }: MedicalRecordFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    recordCategory: 'observation',
    procedure: '',
    doctorId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await medicalRecordApi.create({
        ...formData,
        patientId,
        date: new Date().toISOString(),
        content: `${formData.procedure} - ${formData.notes}`,
        doctorId: formData.doctorId,
        isPrivate: false, // Valor padrão
        createdBy: 'system' // Valor padrão, ajuste conforme necessário
      });

      toast({
        title: "Sucesso",
        description: "Registro médico criado com sucesso!",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar registro médico",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> Novo Registro</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Registro Médico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recordCategory">Categoria do Registro</Label>
            <Select
              value={formData.recordCategory}
              onValueChange={(value: RecordCategory) => setFormData({ ...formData, recordCategory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="observation">Observação</SelectItem>
                <SelectItem value="evolution">Evolução</SelectItem>
                <SelectItem value="private_note">Nota Privada</SelectItem>
                <SelectItem value="attachment">Anexo</SelectItem>
                <SelectItem value="prescription">Prescrição</SelectItem>
                <SelectItem value="exam_request">Solicitação de Exame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedure">Procedimento/Descrição</Label>
            <Input
              id="procedure"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorId">ID do Médico</Label>
            <Input
              id="doctorId"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}