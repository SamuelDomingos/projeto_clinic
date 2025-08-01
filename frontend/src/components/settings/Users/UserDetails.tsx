import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Lock } from "lucide-react";

interface UserDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
    permissions: string[];
    status: string;
    lastLogin?: string;
    photo?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetails({ user, isOpen, onClose }: UserDetailsProps) {
  const permissions = Array.isArray(user.permissions) 
    ? user.permissions 
    : typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Detalhes do Usuário - {user.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informações Pessoais</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Permissões de Acesso</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome</label>
                      <p className="text-gray-900 font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Último Login</label>
                      <p className="text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Permissões de Acesso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {permissions.includes('*') ? (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium">Este usuário possui acesso total ao sistema</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Permissões Atuais</label>
                        <div className="grid grid-cols-2 gap-4">
                          {permissions.map((permission) => (
                            <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="text-gray-900">{permission}</span>
                              <Badge className="bg-green-100 text-green-800">Permitido</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Editar Permissões
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
