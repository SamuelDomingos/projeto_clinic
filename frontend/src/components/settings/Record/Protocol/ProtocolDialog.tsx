import { useState } from "react";
import { Protocol, ProtocolService } from "@/lib/api";
import { ProtocolForm } from "./ProtocolForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocol?: Protocol | null;
  onSave: (protocol: Omit<Protocol, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

interface FormData {
  name: string;
  totalPrice: number;
  services: {
    name: string;
    type: 'consultation' | 'injection' | 'massage' | 'drainage' | 'calometry';
    requiresScheduling: boolean;
    numberOfSessions: number;
    requiresIntervalControl: boolean;
  }[];
}

export function ProtocolDialog({ open, onOpenChange, protocol, onSave }: ProtocolDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);
      
      const protocolData: Omit<Protocol, "id" | "createdAt" | "updatedAt"> = {
        name: data.name,
        totalPrice: Number(data.totalPrice),
        services: data.services.map((service): ProtocolService => ({
          name: service.name,
          type: service.type,
          requiresScheduling: service.requiresScheduling,
          numberOfSessions: Number(service.numberOfSessions),
          requiresIntervalControl: service.requiresIntervalControl,
        })),
      };
      
      console.log('Protocol data to save:', protocolData);
      await onSave(protocolData);
      toast.success(protocol ? "Protocolo atualizado com sucesso" : "Protocolo criado com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving protocol:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar protocolo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {protocol ? "Editar Protocolo" : "Novo Protocolo"}
          </DialogTitle>
        </DialogHeader>
        <ProtocolForm
          protocol={protocol}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
} 