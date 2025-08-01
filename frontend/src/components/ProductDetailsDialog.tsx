import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Plus, 
  ArrowRightLeft, 
  Trash2, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  Calendar,
  MapPin,
  FileText,
  User,
  ChevronDown,
  X
} from "lucide-react";
import { Product, StockMovement, inventoryApi, supplierApi, Supplier } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onTransfer: (product: Product) => void;
  onAddStock: (product: Product) => void;
  onRemoveStock: (product: Product) => void;
  onRefresh: () => Promise<void>;
}

interface EditFormData {
  quantity: number;
  location: string;
  reason: string;
}

export function ProductDetailsDialog({
  isOpen,
  onOpenChange,
  product,
  onEdit,
  onTransfer,
  onAddStock,
  onRemoveStock,
  onRefresh
}: ProductDetailsDialogProps) {
  const { toast } = useToast();
  const [isDeletingMovement, setIsDeletingMovement] = useState(false);
  const [isEditingMovement, setIsEditingMovement] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [editForm, setEditForm] = useState({
    quantity: 0,
    location: '',
    reason: ''
  });
  const [stockUnits, setStockUnits] = useState<Supplier[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  console.log(movements);
  

  useEffect(() => {
    if (product && isOpen) {
      loadMovements();
    }
  }, [product, isOpen]);

  useEffect(() => {
    const loadStockUnits = async () => {
      try {
        const data = await supplierApi.getSuppliers();
        const stockUnits = data.filter(supplier => supplier.category === 'estoque');
        setStockUnits(stockUnits);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as unidades de estoque",
          variant: "destructive"
        });
      }
    };

    loadStockUnits();
  }, []);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await supplierApi.getSuppliers();
        setSuppliersList(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de fornecedores",
          variant: "destructive"
        });
      }
    };

    loadSuppliers();
  }, []);

  const loadMovements = async () => {
    if (!product) return;
    
    try {
      const data = await inventoryApi.getMovements(product.id);
      setMovements(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as movimentações",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'out':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'expiring':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Estoque Baixo';
      case 'out':
        return 'Sem Estoque';
      case 'expiring':
        return 'Vencendo';
      default:
        return status;
    }
  };

  const handleDeleteMovement = async (movementId: string) => {
    try {
      setIsDeletingMovement(true);
      await inventoryApi.deleteMovement(movementId);
      await onRefresh();
      await loadMovements();
      toast({
        title: "Sucesso",
        description: "Movimentação excluída com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a movimentação",
        variant: "destructive"
      });
    } finally {
      setIsDeletingMovement(false);
    }
  };

  const handleEditMovement = (movement: StockMovement) => {
    setSelectedMovement(movement);
    setEditForm({
      quantity: movement.quantity,
      location: movement.location,
      reason: movement.reason
    });
    setIsEditingMovement(true);
  };

  const handleSaveMovementEdit = async () => {
    if (!selectedMovement) return;

    try {
      await inventoryApi.updateMovement(selectedMovement.id, editForm);
      
      await onRefresh();
      await loadMovements();
      
      setIsEditingMovement(false);
      toast({
        title: "Sucesso",
        description: "Movimentação atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a movimentação",
        variant: "destructive"
      });
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in':
        return 'Entrada';
      case 'out':
        return 'Saída';
      case 'transfer':
        return 'Transferência';
      default:
        return type;
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDownToLine className="h-4 w-4" />;
      case 'out':
        return <ArrowUpFromLine className="h-4 w-4" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'out':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (!product) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] h-[90vh] max-w-none">
          <DialogHeader className="flex flex-row items-center justify-between pb-4">
            <DialogTitle className="text-2xl">Detalhes do Produto</DialogTitle>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingProduct(product);
                  onOpenChange(false);
                  setIsEditDialogOpen(true);
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Produto
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Movimentar
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTransfer(product)}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transferir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddStock(product)}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Entrada
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRemoveStock(product)}>
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Saída
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 100px)' }}>
            {/* Cards de Informação */}
            <div className="grid grid-cols-2 gap-6">
              {/* Informações Básicas e Estoque */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Informações do Produto</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nome:</span> {product?.name}</p>
                  <p><span className="font-medium">Categoria:</span> {product?.category}</p>
                  <p><span className="font-medium">Unidade:</span> {product?.unit}</p>
                  <p><span className="font-medium">Estoque Mínimo:</span> {product?.minimumStock}</p>
                  <div className="pt-2 border-t">
                    <p><span className="font-medium">Quantidade Total:</span> {product?.totalQuantity} {product?.unit}</p>
                    <Badge className={getStatusColor(product?.inventoryStatus || 'normal')}>
                      {getStatusLabel(product?.inventoryStatus || 'normal')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Estoque por Localização */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Estoque por Localização</h3>
                <div className="space-y-2">
                  {product.stockLocations && product.stockLocations.length > 0 ? (
                    product.stockLocations.map((location) => (
                      <div key={location.location} className="flex items-center justify-between bg-background p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{location.location}</p>
                          {location.expiryDate && (
                            <p className="text-sm text-muted-foreground">
                              Validade: {new Date(location.expiryDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">{location.quantity} {product.unit}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhuma localização registrada</p>
                  )}
                </div>
              </div>
            </div>

            {/* Movimentações */}
            <div>
              <h3 className="font-medium mb-3">Movimentações</h3>
              <div className="space-y-2">
                {movements && movements.length > 0 ? (
                  movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between bg-background p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getMovementTypeColor(movement.type)}>
                            <span className="flex items-center gap-1">
                              {getMovementTypeIcon(movement.type)}
                              {getMovementTypeLabel(movement.type)}
                            </span>
                          </Badge>
                          <span className="text-muted-foreground text-sm">
                            {new Date(movement.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          {movement.type === 'transfer' ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {movement.fromLocation?.location || 'Origem desconhecida'}
                                {" "}
                                <ArrowRightLeft className="inline h-3 w-3 mx-1" />
                                {" "}
                                {movement.toLocation?.location || 'Destino desconhecido'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{typeof movement.location === 'object' && movement.location !== null ? movement.location.location : (movement.location || 'Localização desconhecida')}</span>
                            </div>
                          )}
                          {movement.user && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{movement.user.name}</span>
                            </div>
                          )}
                          {movement.type === 'in' && (
                            <>
                              {movement.price && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>R$ {Number(movement.price).toFixed(2)}</span>
                                </div>
                              )}
                              {movement.supplier && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>{movement.supplier.name}</span>
                                </div>
                              )}
                              {movement.expiryDate && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(movement.expiryDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity} {product?.unit}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            onClick={() => handleEditMovement(movement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                            onClick={() => handleDeleteMovement(movement.id)}
                            disabled={isDeletingMovement}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhuma movimentação registrada</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Movement Dialog */}
      <Dialog open={isEditingMovement} onOpenChange={setIsEditingMovement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Movimentação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantidade</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Localização</Label>
              <Select
                value={editForm.location}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  {stockUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reason">Motivo</Label>
              <Textarea
                id="edit-reason"
                value={editForm.reason}
                onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditingMovement(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveMovementEdit}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unidade</Label>
                  <Select
                    value={editingProduct.unit}
                    onValueChange={(value) => setEditingProduct(prev => prev ? {...prev, unit: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="ml">Mililitro</SelectItem>
                      <SelectItem value="l">Litro</SelectItem>
                      <SelectItem value="mg">Miligrama</SelectItem>
                      <SelectItem value="g">Grama</SelectItem>
                      <SelectItem value="kg">Quilograma</SelectItem>
                      <SelectItem value="ampola">Ampola</SelectItem>
                      <SelectItem value="frasco">Frasco</SelectItem>
                      <SelectItem value="caixa">Caixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-minimumStock">Estoque Mínimo</Label>
                  <Input
                    id="edit-minimumStock"
                    type="number"
                    value={editingProduct.minimumStock}
                    onChange={(e) => setEditingProduct(prev => prev ? {...prev, minimumStock: Number(e.target.value)} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) => setEditingProduct(prev => prev ? {...prev, category: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (editingProduct) {
                        await onEdit(editingProduct);
                        await onRefresh();
                        setIsEditDialogOpen(false);
                        setEditingProduct(null);
                        toast({
                          title: "Sucesso",
                          description: "Produto atualizado com sucesso"
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível atualizar o produto",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 