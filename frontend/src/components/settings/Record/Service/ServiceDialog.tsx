import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Service } from "@/lib/api";
import { ServiceForm } from "./ServiceForm";
import { toast } from "sonner";

interface ServiceDialogProps {
  service?: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Service, "id">) => Promise<void>;
}

export function ServiceDialog({
  service,
  open,
  onOpenChange,
  onSave,
}: ServiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Service, "id">) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      toast.success(
        service
          ? "Serviço atualizado com sucesso!"
          : "Serviço criado com sucesso!"
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        service
          ? "Erro ao atualizar serviço"
          : "Erro ao criar serviço"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <ServiceForm
          service={service}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 