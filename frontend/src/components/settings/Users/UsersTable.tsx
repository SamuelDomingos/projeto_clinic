import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Shield, Pencil } from "lucide-react";
import { userApi, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UsersTableProps {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (user: User) => void;
}

export function UsersTable({ onView, onDelete, onEdit }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.list();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsers([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'health_professional': return 'Profissional da Saúde';
      case 'receptionist': return 'Recepcionista';
      case 'financial': return 'Financeiro';
      case 'scheduling': return 'Central de Agendamento';
      case 'common': return 'Comum';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'health_professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'receptionist': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'financial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'scheduling': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Cargos</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Último Login</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-muted-foreground">
                Carregando...
              </td>
            </tr>
          ) : users?.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-muted-foreground">
                Nenhum usuário encontrado
              </td>
            </tr>
          ) : (
            users?.map((user) => {
              const permissions = Array.isArray(user.permissions) 
                ? user.permissions 
                : typeof user.permissions === 'string' 
                  ? JSON.parse(user.permissions) 
                  : [];

              return (
                <tr 
                  key={user.id} 
                  className="border-b border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => onView(user.id)}
                >
                  <td className="p-4 font-medium text-foreground">{user.name}</td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <Badge 
                      variant="outline"
                      className={getRoleColor(user.role)}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="p-4 space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(user.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
} 