import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";

interface Procedure {
  id: number;
  name: string;
  duration: number;
  price: string;
  category: string;
}

interface ProceduresTableProps {
  procedures: Procedure[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProceduresTable({ procedures, onView, onEdit, onDelete }: ProceduresTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Duração</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Preço</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {procedures.map((procedure) => (
            <tr key={procedure.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-4 font-medium text-foreground">{procedure.name}</td>
              <td className="p-4 text-muted-foreground">{procedure.duration} min</td>
              <td className="p-4 text-foreground">{procedure.price}</td>
              <td className="p-4">
                <Badge variant="outline" className="border-border text-foreground">{procedure.category}</Badge>
              </td>
              <td className="p-4 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onView(procedure.id)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(procedure.id)}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(procedure.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 