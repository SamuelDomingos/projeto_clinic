import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Supplier, inventoryApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface StockMovementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  type: 'entrada' | 'saida' | 'transferencia';
  stockUnits: Supplier[];
  suppliersList: Supplier[];
  onSuccess: () => Promise<void>;
}

export function StockMovementDialog({
  isOpen,
  onOpenChange,
  product,
  type,
  stockUnits,
  suppliersList,
  onSuccess
}: StockMovementDialogProps) {
  const { toast } = useToast();
  const [movementForm, setMovementForm] = useState({
    type: '',
    date: '',
    origin: '',
    destination: '',
    quantity: 0,
    reason: '',
    expiryDate: '',
    supplierId: '',
    sku: '',
    price: 0,
    newDestinationName: '' // novo campo para nome de unidade
  });

  // Filtrar apenas fornecedores (não unidades)
  const actualSuppliers = suppliersList.filter(supplier => 
    supplier.type === 'fornecedor' || 
    (supplier.type === undefined && supplier.category !== 'estoque')
  );

  console.log(product);
  

  const handleSubmit = async () => {
    if (!product) return;

    try {
      switch (type) {
        case 'entrada': {
          // Só permite entrada se houver unidade selecionada
          if (!movementForm.destination) {
            toast({
              title: 'Erro',
              description: 'Selecione uma unidade de estoque para dar entrada.',
              variant: 'destructive'
            });
            return;
          }
          await inventoryApi.addStock({
            productId: product.id,
            locationId: movementForm.destination,
            quantity: movementForm.quantity,
            expiryDate: movementForm.expiryDate,
            supplierId: movementForm.supplierId,
            sku: movementForm.sku,
            price: movementForm.price
          });
          break;
        }
        case 'saida':
          await inventoryApi.removeStock({
            productId: product.id,
            locationId: movementForm.origin,
            quantity: movementForm.quantity,
            reason: movementForm.reason
          });
          break;
        case 'transferencia':
          await inventoryApi.transferStock({
            productId: product.id,
            fromLocationId: movementForm.origin,
            toLocationId: movementForm.destination,
            quantity: movementForm.quantity,
            reason: movementForm.reason
          });
          break;
      }

      await onSuccess();
      onOpenChange(false);
      setMovementForm({
        type: '',
        date: '',
        origin: '',
        destination: '',
        quantity: 0,
        reason: '',
        expiryDate: '',
        supplierId: '',
        sku: '',
        price: 0,
        newDestinationName: ''
      });

      toast({
        title: "Sucesso",
        description: `Estoque ${type === 'entrada' ? 'adicionado' : type === 'saida' ? 'removido' : 'transferido'} com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ${type === 'entrada' ? 'adicionar' : type === 'saida' ? 'remover' : 'transferir'} o estoque`,
        variant: "destructive"
      });
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'entrada':
        return 'Entrada de Estoque';
      case 'saida':
        return 'Saída de Estoque';
      case 'transferencia':
        return 'Transferência de Estoque';
      default:
        return 'Movimentação de Estoque';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'entrada':
        return 'Confirmar Entrada';
      case 'saida':
        return 'Confirmar Saída';
      case 'transferencia':
        return 'Confirmar Transferência';
      default:
        return 'Confirmar';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {product && (
          <div className="space-y-4">
            {/* Informações do Produto */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Informações do Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unidade</p>
                  <p className="font-medium">{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Total</p>
                  <p className="font-medium">{product.totalQuantity} {product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={product.inventoryStatus === 'normal' ? 'default' : 'destructive'}>
                    {product.inventoryStatus === 'normal' ? 'Normal' : 'Baixo'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type !== 'entrada' && (
                <div className="space-y-2">
                  <Label htmlFor="movement-origin">Origem</Label>
                  <Select
                    value={movementForm.origin}
                    onValueChange={(value) => setMovementForm(prev => ({ ...prev, origin: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.stockLocations && product.stockLocations.length > 0
                        ? product.stockLocations
                            .filter(location => location.id && location.location)
                            .map(location => (
                              <SelectItem key={location.id} value={location.id}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{location.location}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {location.quantity} {product.unit}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                        : (
                          <SelectItem value="none" disabled>
                            Nenhuma localização disponível
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                  {movementForm.origin && product.stockLocations && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Disponível: {(() => {
                        const originLocation = product.stockLocations.find(
                          loc => loc.id === movementForm.origin
                        );
                        return originLocation?.quantity ?? 0;
                      })()} {product.unit}
                    </div>
                  )}
                </div>
              )}
              {type !== 'saida' && (
                <div className="space-y-2">
                  <Label htmlFor="movement-destination">Destino</Label>
                  <Select
                    value={movementForm.destination}
                    onValueChange={(value) => setMovementForm(prev => ({ ...prev, destination: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockUnits.length > 0 ? (
                        stockUnits
                          .filter(unit => unit.id && unit.name)
                          .map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="" disabled>
                          Nenhuma unidade cadastrada
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {stockUnits.length === 0 && (
                    <div className="text-sm text-red-600 mt-2">
                      Cadastre uma unidade de estoque antes de dar entrada.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="movement-quantity">Quantidade</Label>
                <Input
                  id="movement-quantity"
                  type="number"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                />
              </div>
              {type === 'entrada' && (
                <div className="space-y-2">
                  <Label htmlFor="movement-price">Preço</Label>
                  <Input
                    id="movement-price"
                    type="number"
                    value={movementForm.price}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {type === 'entrada' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="movement-expiry">Data de Validade</Label>
                  <Input
                    id="movement-expiry"
                    type="date"
                    value={movementForm.expiryDate}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="movement-supplier">Fornecedor</Label>
                  <Select
                    value={movementForm.supplierId}
                    onValueChange={(value) => setMovementForm(prev => ({ ...prev, supplierId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {actualSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                                      {actualSuppliers.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum fornecedor encontrado. Crie fornecedores com tipo "fornecedor" primeiro.
                      </p>
                    )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="movement-reason">Motivo</Label>
              <Textarea
                id="movement-reason"
                value={movementForm.reason}
                onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={`Digite o motivo da ${type === 'entrada' ? 'entrada' : type === 'saida' ? 'saída' : 'transferência'}...`}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={type === 'entrada' && (!movementForm.destination || stockUnits.length === 0)}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 