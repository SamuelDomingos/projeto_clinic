import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Camera, UserCircle, ChevronDown, ChevronRight } from "lucide-react";
import { userApi, type User as UserType } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const permissionGroups = {
  'Pacientes': [
    { id: 'patients:read', label: 'Visualizar Pacientes' },
    { id: 'patients:create', label: 'Criar Pacientes' },
    { id: 'patients:update', label: 'Editar Pacientes' },
    { id: 'patients:delete', label: 'Excluir Pacientes' },
  ],
  'Consultas': [
    { id: 'appointments:read', label: 'Visualizar Consultas' },
    { id: 'appointments:create', label: 'Criar Consultas' },
    { id: 'appointments:update', label: 'Editar Consultas' },
    { id: 'appointments:delete', label: 'Excluir Consultas' },
  ],
  'Prontuários': [
    { id: 'medical-records:read', label: 'Visualizar Prontuários' },
    { id: 'medical-records:create', label: 'Criar Prontuários' },
    { id: 'medical-records:update', label: 'Editar Prontuários' },
    { id: 'medical-records:delete', label: 'Excluir Prontuários' },
  ],
  'Estoque': [
    { id: 'inventory:read', label: 'Visualizar Estoque' },
    { id: 'inventory:create', label: 'Adicionar Estoque' },
    { id: 'inventory:update', label: 'Gerenciar Estoque' },
  ],
  'Configurações': [
    { id: 'settings:read', label: 'Visualizar Configurações' },
    { id: 'settings:update', label: 'Editar Configurações' },
  ],
  'Usuários': [
    { id: 'users:read', label: 'Visualizar Usuários' },
    { id: 'users:create', label: 'Criar Usuários' },
    { id: 'users:update', label: 'Editar Usuários' },
    { id: 'users:delete', label: 'Excluir Usuários' },
  ],
  'Fornecedores': [
    { id: 'suppliers:read', label: 'Visualizar Fornecedores' },
    { id: 'suppliers:create', label: 'Criar Fornecedores' },
    { id: 'suppliers:update', label: 'Editar Fornecedores' },
    { id: 'suppliers:delete', label: 'Excluir Fornecedores' },
  ],
};

interface UserFormData extends Partial<UserType> {
  password?: string;
}

export default function UserProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<UserFormData>({});
  const [showPassword, setShowPassword] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await userApi.getById(id!);
      setUser(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error loading data:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        permissions: Array.isArray(formData.permissions) ? formData.permissions : []
      };

      // Se não houver senha, remover do objeto
      if (!data.password) {
        delete data.password;
      }

      const response = await userApi.update(id!, data);
      setUser(response.data);
      setFormData(response.data);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar o tipo do arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Formato de imagem não suportado. Use JPG, PNG ou WEBP.",
        variant: "destructive",
      });
      return;
    }

    // Validar o tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao fazer upload da foto' }));
        throw new Error(error.message || 'Falha ao fazer upload da foto');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setFormData(updatedUser);
      toast({
        title: "Sucesso",
        description: "Foto atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar foto",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => {
      const permissions = Array.isArray(prev.permissions) ? [...prev.permissions] : [];
      const index = permissions.indexOf(permissionId);
      
      if (index === -1) {
        permissions.push(permissionId);
      } else {
        permissions.splice(index, 1);
      }
      
      return { ...prev, permissions };
    });
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Usuário não encontrado</p>
      </div>
    );
  }

  const permissions = Array.isArray(formData.permissions) 
    ? formData.permissions 
    : typeof formData.permissions === 'string' 
      ? JSON.parse(formData.permissions) 
      : [];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Perfil do Usuário</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Foto do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <UserCircle className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge 
                    variant={user.status === 'active' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'health_professional' | 'receptionist' | 'financial' | 'scheduling' | 'common') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="health_professional">Profissional da Saúde</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="scheduling">Central de Agendamento</SelectItem>
                      <SelectItem value="common">Comum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status === 'active'}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                    />
                    <Label htmlFor="status">
                      {formData.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Permissões de Acesso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissionGroups).map(([group, permissions]) => (
                <Collapsible
                  key={group}
                  open={openGroups[group]}
                  onOpenChange={() => toggleGroup(group)}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                    <div className="flex items-center space-x-2">
                      {openGroups[group] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <h3 className="text-lg font-semibold text-foreground">{group}</h3>
                    </div>
                    <Badge variant="secondary">
                      {permissions.length} permissões
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Switch
                            id={permission.id}
                            checked={formData.permissions?.includes(permission.id)}
                            onCheckedChange={() => handlePermissionChange(permission.id)}
                          />
                          <Label htmlFor={permission.id}>{permission.label}</Label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="submit">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
} 