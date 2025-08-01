import { Protocol } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface ProtocolsTableProps {
  protocols: Protocol[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (protocol: Protocol) => void;
}

export function ProtocolsTable({ protocols, loading, onDelete, onEdit }: ProtocolsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Serviços</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Valor Total</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                Carregando...
              </td>
            </tr>
          ) : protocols?.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                Nenhum protocolo encontrado
              </td>
            </tr>
          ) : (
            protocols?.map((protocol) => (
              <tr 
                key={protocol.id} 
                className="border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => onEdit(protocol)}
              >
                <td className="p-4 font-medium text-foreground">{protocol.name}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(protocol.services || []).map((service) => (
                      <Badge 
                        key={service.id || service.name}
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-medium text-foreground">
                  {formatCurrency(Number(protocol.totalPrice))}
                </td>
                <td className="p-4 space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(protocol.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 