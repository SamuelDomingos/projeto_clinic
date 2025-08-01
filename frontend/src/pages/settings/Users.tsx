import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userApi, type User, type CreateUserData } from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UsersTable } from "@/components/settings/Users/UsersTable";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { UserDialog } from "@/components/settings/Users/UserDialog";

export default function UsersSettings() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersResponse = await userApi.list();
      if (usersResponse && typeof usersResponse === 'object' && 'data' in usersResponse) {
        setUsers(usersResponse.data as User[]);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (id: string) => {
    navigate(`/users/${id}`);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setUserToDelete(user);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await userApi.delete(userToDelete.id);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setShowDeleteDialog(false);
        toast({
          title: "Sucesso",
          description: "Usuário excluído permanentemente",
        });
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir usuário",
          variant: "destructive",
        });
      } finally {
        setUserToDelete(null);
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleSaveUser = async (data: { name: string; email: string; password?: string; status: 'active' | 'inactive'; role: string; }) => {
    try {
      if (selectedUser) {
        const updateData = {
          name: data.name,
          email: data.email,
          password: data.password,
          permissions: selectedUser.permissions,
          status: data.status,
          role: data.role
        };
        const response = await userApi.update(selectedUser.id, updateData);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? response.data : u));
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        const createData: CreateUserData = {
          name: data.name,
          email: data.email,
          password: data.password || '123456',
          permissions: [],
          status: data.status || 'active',
          role: data.role
        };
        const response = await userApi.create(createData);
        setUsers(prev => [...prev, response.data]);
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        });
      }
      setShowUserDialog(false);
      setSelectedUser(null);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar usuário",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
        <CardDescription>
          Gerencie os usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowUserDialog(true)}>
            Novo Usuário
          </Button>
        </div>
        <UsersTable 
          onView={handleViewUser}
          onDelete={handleDeleteUser}
          onEdit={handleEditUser}
        />
      </CardContent>
      <UserDialog
        open={showUserDialog}
        onOpenChange={(open) => {
          setShowUserDialog(open);
          if (!open) setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão permanente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o usuário {userToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 