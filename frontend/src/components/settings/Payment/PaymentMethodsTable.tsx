import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { PaymentMethodDetails } from "./PaymentMethodDetails";
import { PaymentMethod } from "@/lib/api";

interface PaymentMethodsTableProps {
  paymentMethods: PaymentMethod[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaymentMethodsTable({ paymentMethods, onView, onEdit, onDelete }: PaymentMethodsTableProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleRowClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsDetailsOpen(true);
    onView(method.id);
  };

  const formatTerm = (days?: number) => {
    if (!days) return '-';
    return `${days} dias`;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
              <th className="text-left p-4 font-medium text-muted-foreground">1ª Parcela</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Demais Parcelas</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Débito</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Antecipação</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((method) => (
              <tr 
                key={method.id} 
                className="border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleRowClick(method)}
              >
                <td className="p-4 font-medium text-foreground">{method.name}</td>
                <td className="p-4 text-muted-foreground">{formatTerm(method.firstInstallmentTerm)}</td>
                <td className="p-4 text-muted-foreground">{formatTerm(method.otherInstallmentsTerm)}</td>
                <td className="p-4 text-muted-foreground">{formatTerm(method.debitTerm)}</td>
                <td className="p-4 text-muted-foreground">{formatTerm(method.anticipationTerm)}</td>
                <td className="p-4">
                  <Badge 
                    variant={method.status === 'active' ? 'default' : 'secondary'}
                    className={method.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}
                  >
                    {method.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(method.id)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(method.id)}
                        className="text-red-600"
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMethod && (
        <PaymentMethodDetails
          method={selectedMethod}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedMethod(null);
          }}
        />
      )}
    </>
  );
} 