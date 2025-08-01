import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Shield } from "lucide-react";
import { categoryService } from "@/lib/api/services/categoryService";
import { Category, CategoryType } from "@/lib/api/types/category";
import { toast } from "sonner";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CategoryType | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "revenue" as CategoryType,
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll({
        search: search || undefined,
        type: type === "all" ? undefined : type,
      });
      console.log('Resposta da API:', response);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error("Erro ao carregar categorias");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [search, type]);

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.delete(categoryToDelete);
      toast.success("Categoria excluída com sucesso");
      loadCategories();
    } catch (error: any) {
      // Verificar se é erro de categoria padrão
      if (error.response?.status === 403) {
        toast.error("Não é possível deletar categorias padrão do sistema");
      } else {
        toast.error("Erro ao excluir categoria");
      }
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCreate = async () => {
    try {
      const createdCategory = await categoryService.create(formData);
      console.log('Categoria criada:', createdCategory);
      toast.success("Categoria criada com sucesso");
      setIsModalOpen(false);
      setFormData({ name: "", type: "revenue" });
      await loadCategories();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error("Erro ao criar categoria");
    }
  };

  const handleEdit = async () => {
    if (!editingCategory) return;

    try {
      await categoryService.update(editingCategory.id, formData);
      toast.success("Categoria atualizada com sucesso");
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", type: "revenue" });
      await loadCategories();
    } catch (error: any) {
      // Verificar se é erro de categoria padrão
      if (error.response?.status === 403) {
        toast.error("Não é possível alterar o nome de categorias padrão do sistema");
      } else {
        toast.error("Erro ao atualizar categoria");
      }
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "revenue",
    });
    setIsModalOpen(true);
  };

  const getTypeColor = (type: CategoryType) => {
    switch (type) {
      case 'revenue': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'expense': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Buscar categorias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select value={type} onValueChange={(value) => setType(value as CategoryType | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="revenue">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Criado em</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : categories?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Nenhuma categoria encontrada
                    </td>
                  </tr>
                ) : (
                  categories?.map((category) => (
                    <tr 
                      key={category.id} 
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {category.name}
                          {category.isDefault && (
                            <Shield className="h-4 w-4 text-blue-500" title="Categoria padrão do sistema" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="outline"
                          className={getTypeColor(category.type)}
                        >
                          {category.type === "revenue" ? "Receita" : "Despesa"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {category.isDefault ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            Padrão
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                            Personalizada
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => openEditModal(category)}
                          disabled={category.isDefault} // Desabilitar edição para categorias padrão
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCategoryToDelete(category.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          disabled={category.isDefault} // Desabilitar exclusão para categorias padrão
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome da categoria"
                disabled={editingCategory?.isDefault} // Desabilitar edição do nome para categorias padrão
              />
              {editingCategory?.isDefault && (
                <p className="text-sm text-muted-foreground">
                  O nome de categorias padrão não pode ser alterado.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as CategoryType })}
                disabled={editingCategory?.isDefault} // Desabilitar edição do tipo para categorias padrão
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              {editingCategory?.isDefault && (
                <p className="text-sm text-muted-foreground">
                  O tipo de categorias padrão não pode ser alterado.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={editingCategory ? handleEdit : handleCreate} 
              disabled={!formData.name || editingCategory?.isDefault}
            >
              {editingCategory ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}