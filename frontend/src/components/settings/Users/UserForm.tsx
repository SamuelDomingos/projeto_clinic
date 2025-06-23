import { type User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'health_professional' | 'receptionist' | 'financial' | 'scheduling' | 'common';
}

interface UserFormProps {
  user?: User | null;
  onSave: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    status: user?.status || 'active',
    role: user?.role || 'common',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      role: formData.role
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
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
          <Label htmlFor="password">
            {user ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!user}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={formData.status === 'active'}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
          />
          <Label htmlFor="status">Usuário Ativo</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {user ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
} 