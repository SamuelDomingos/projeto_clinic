import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown,
  Filter,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft as TransferIcon
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inventoryApi, type Product, type StockMovement, supplierApi, type Supplier as SupplierType } from "../lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ProductDetailsDialog } from "@/components/ProductDetailsDialog";
import { StockMovementDialog } from "@/components/StockMovementDialog";

interface ProductWithDetails extends Product {
  supplierId?: string;
  sku?: string;
  price?: number;
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isRemoveStockDialogOpen, setIsRemoveStockDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    unit: '',
    category: '',
    minimumStock: 0,
    productStatus: 'active' as const,
    specifications: {}
  });
  const [suppliersList, setSuppliersList] = useState<SupplierType[]>([]);
  const [stockUnits, setStockUnits] = useState<SupplierType[]>([]);
  const [movementType, setMovementType] = useState<'entrada' | 'saida' | 'transferencia' | null>(null);
  const [movementForm, setMovementForm] = useState({
    type: '',
    date: '',
    origin: '',
    destination: '',
    quantity: 0,
    reason: '',
    expiryDate: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    unit: '',
    category: '',
    minimumStock: 0,
    productStatus: 'active' as const,
    specifications: {}
  });

  const [showProductForm, setShowProductForm] = useState(false);

  // Carregar produtos e fornecedores
  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getProducts();
      console.log('Produtos carregados:', data);
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await supplierApi.getSuppliers();
      setSuppliersList(data);
      // Filtrar apenas unidades com categoria de estoque para o destino
      const stockUnits = data.filter(supplier => supplier.category === 'estoque');
      setStockUnits(stockUnits);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fornecedores",
        variant: "destructive"
      });
    }
  };

  // Adicionar estoque
  const handleAddStock = async (productId: string, locationId: string, quantity: number, expiryDate?: string, supplierId?: string, sku?: string, price?: number) => {
    try {
      await inventoryApi.addStock({ 
        productId, 
        locationId, 
        quantity, 
        expiryDate, 
        supplierId, 
        sku, 
        price: price ? Number(price) : undefined 
      });
      await loadProducts();
      toast({
        title: "Sucesso",
        description: "Estoque adicionado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o estoque",
        variant: "destructive"
      });
    }
  };

  // Remover estoque
  const handleRemoveStock = async (productId: string, locationId: string, quantity: number, reason: string) => {
    try {
      await inventoryApi.removeStock({ productId, locationId, quantity, reason });
      await loadProducts();
      toast({
        title: "Sucesso",
        description: "Estoque removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o estoque",
        variant: "destructive"
      });
    }
  };

  // Transferir estoque
  const handleTransferStock = async (productId: string, fromLocationId: string, toLocationId: string, quantity: number, reason: string) => {
    try {
      await inventoryApi.transferStock({ 
        productId, 
        fromLocationId, 
        toLocationId, 
        quantity, 
        reason 
      });
      await loadProducts();
      toast({
        title: "Sucesso",
        description: "Estoque transferido com sucesso"
      });
    } catch (error) {
      console.error('Erro na transferência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível transferir o estoque",
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

  const lowStockProducts = products.filter(p => p.inventoryStatus === 'low' || p.inventoryStatus === 'out');
  const expiringProducts = products.filter(p => p.inventoryStatus === 'expiring');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.inventoryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProductClick = async (product: ProductWithDetails) => {
    try {
      // Buscar o produto atualizado do backend
      const updatedProduct = await inventoryApi.getProduct(product.id);
      console.log('Produto atualizado:', updatedProduct);
      setSelectedProduct(updatedProduct);
    } catch (error) {
      console.error('Erro ao buscar produto atualizado:', error);
      setSelectedProduct(product);
    }
    setIsProductDialogOpen(true);
  };

  const handleAddMovement = async (data: {
    productId: string;
    locationId: string;
    quantity: number;
    expiryDate?: string;
    supplierId?: string;
    sku?: string;
    price?: number;
  }) => {
    try {
      const { productId, locationId, quantity, expiryDate, supplierId, sku, price } = data;
      await inventoryApi.addStock({
        productId,
        locationId,
        quantity,
        expiryDate,
        supplierId,
        sku,
        price
      });
      await loadProducts();
      toast({
        title: "Sucesso",
        description: "Movimentação adicionada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a movimentação",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
          <p className="text-muted-foreground">Controle de produtos por localização</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            {!selectedProduct ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Selecione ou Crie um Produto</h3>
                  <Button
                    variant="outline"
                    onClick={() => setShowProductForm(!showProductForm)}
                  >
                    {showProductForm ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar Novo Produto
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Produto
                      </>
                    )}
                  </Button>
                </div>

                {showProductForm ? (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h4 className="font-medium">Novo Produto</h4>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Digite o nome do produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do produto"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade</Label>
                        <Select
                          value={productForm.unit}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, unit: value }))}
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
                      <div className="space-y-2">
                        <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                        <Input
                          id="minimumStock"
                          type="number"
                          value={productForm.minimumStock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
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
                          setShowProductForm(false);
                          setProductForm({
                            name: '',
                            description: '',
                            unit: '',
                            category: '',
                            minimumStock: 0,
                            productStatus: 'active',
                            specifications: {}
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            const newProduct = await inventoryApi.createProduct(productForm);
                            setSelectedProduct(newProduct);
                            setShowProductForm(false);
                            await loadProducts();
                            toast({
                              title: "Sucesso",
                              description: "Produto criado com sucesso"
                            });
                          } catch (error) {
                            toast({
                              title: "Erro",
                              description: "Não foi possível criar o produto",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        Criar Produto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="product">Selecione o Produto</Label>
                    {products.length === 0 ? (
                      <div className="mt-2 p-4 bg-blue-50 border border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 rounded text-sm">
                        Nenhum produto cadastrado ainda. Crie um produto primeiro para poder fazer movimentações de estoque.
                      </div>
                    ) : (
                    <Select
                      value={selectedProduct?.id || ''}
                      onValueChange={async (value) => {
                        const product = products.find(p => p.id === value);
                        if (product) {
                          // Buscar o produto completo com localizações atualizadas
                          try {
                            console.log('Buscando produto completo:', product.id);
                            const fullProduct = await inventoryApi.getProduct(product.id);
                            console.log('Produto completo recebido:', fullProduct);
                            setSelectedProduct(fullProduct);
                          } catch (error) {
                            console.error('Erro ao buscar produto completo:', error);
                            // Se não conseguir buscar o produto completo, usar o produto da lista
                            setSelectedProduct(product);
                          }
                        } else {
                          setSelectedProduct(null);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    )}
                  </div>
                )}
              </div>
            ) : !movementType ? (
              <div className="grid grid-cols-3 gap-4 py-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32"
                  onClick={() => setMovementType('entrada')}
                >
                  <ArrowDownToLine className="h-8 w-8 mb-2" />
                  <span>Entrada</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32"
                  onClick={() => setMovementType('saida')}
                >
                  <ArrowUpFromLine className="h-8 w-8 mb-2" />
                  <span>Saída</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32"
                  onClick={() => setMovementType('transferencia')}
                >
                  <TransferIcon className="h-8 w-8 mb-2" />
                  <span>Transferência</span>
                </Button>
              </div>
            ) : (
              <StockMovementDialog
                isOpen={true}
                onOpenChange={(open) => {
                  if (!open) {
                    setMovementType(null);
                    setSelectedProduct(null);
                    setIsCreateDialogOpen(false);
                  }
                }}
                product={selectedProduct}
                type={movementType}
                stockUnits={stockUnits}
                suppliersList={suppliersList}
                onSuccess={loadProducts}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Estoque */}
      {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-300">
                  <TrendingDown className="h-5 w-5" />
                  <span>Estoque Baixo/Zerado</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">{product.name}</span>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {product.totalQuantity} {product.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {expiringProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-300">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Produtos Vencendo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringProducts.map(product => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-orange-700 dark:text-orange-300">{product.name}</span>
                      <span className="text-orange-600 dark:text-orange-400 text-sm">
                        Verificar estoques
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 bg-muted">
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Produtos</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar produtos..." 
              className="pl-10 bg-background border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-popover border-border">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Filtros</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Estoque Baixo</SelectItem>
                      <SelectItem value="out">Sem Estoque</SelectItem>
                      <SelectItem value="expiring">Vencendo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Fornecedor</label>
                  <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {suppliersList.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <TabsContent value="products">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Package className="h-5 w-5 text-primary" />
                <span>Lista de Produtos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-border rounded-lg bg-card">
                    <div 
                      className="p-4 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.stockLocations?.map(loc => `${loc.location}: ${loc.quantity} ${product.unit}`).join(', ') || 'Sem localização'}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-medium text-foreground">
                                {product.totalQuantity} {product.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                            
                            <Badge className={getStatusColor(product.inventoryStatus || 'normal')}>
                              {getStatusLabel(product.inventoryStatus || 'normal')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        isOpen={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        onEdit={async (product) => {
          try {
            const updatedProduct = await inventoryApi.getProduct(product.id);
            setSelectedProduct(updatedProduct);
          } catch (error) {
            setSelectedProduct(product);
          }
          setMovementType('transferencia');
          setIsCreateDialogOpen(true);
        }}
        onTransfer={async (product) => {
          try {
            const updatedProduct = await inventoryApi.getProduct(product.id);
            setSelectedProduct(updatedProduct);
          } catch (error) {
            setSelectedProduct(product);
          }
          setMovementType('transferencia');
          setIsCreateDialogOpen(true);
        }}
        onAddStock={async (product) => {
          try {
            const updatedProduct = await inventoryApi.getProduct(product.id);
            setSelectedProduct(updatedProduct);
          } catch (error) {
            setSelectedProduct(product);
          }
          setMovementType('entrada');
          setIsCreateDialogOpen(true);
        }}
        onRemoveStock={async (product) => {
          try {
            const updatedProduct = await inventoryApi.getProduct(product.id);
            setSelectedProduct(updatedProduct);
          } catch (error) {
            setSelectedProduct(product);
          }
          setMovementType('saida');
          setIsCreateDialogOpen(true);
        }}
        onRefresh={loadProducts}
      />

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  <Input
                    id="edit-name"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unidade</Label>
                  <Select
                    value={selectedProduct.unit}
                    onValueChange={(value) => setSelectedProduct(prev => prev ? {...prev, unit: value} : null)}
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
                  value={selectedProduct.description}
                  onChange={(e) => setSelectedProduct(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-minimumStock">Estoque Mínimo</Label>
                  <Input
                    id="edit-minimumStock"
                    type="number"
                    value={selectedProduct.minimumStock}
                    onChange={(e) => setSelectedProduct(prev => prev ? {...prev, minimumStock: Number(e.target.value)} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={selectedProduct.category}
                    onValueChange={(value) => setSelectedProduct(prev => prev ? {...prev, category: value} : null)}
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (selectedProduct) {
                        // Since updateProduct doesn't exist, we'll need to implement it in the API
                        // For now, we'll just show a message
                        toast({
                          title: "Aviso",
                          description: "Funcionalidade de edição em desenvolvimento",
                          variant: "default"
                        });
                        setIsEditDialogOpen(false);
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

      {/* Transfer Stock Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transferir Estoque</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-from">Origem</Label>
                  <Select
                    value={movementForm.origin}
                    onValueChange={(value) => {
                      setMovementForm(prev => ({ 
                        ...prev, 
                        origin: value,
                        quantity: 0 // Reset quantity when origin changes
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.stockLocations && selectedProduct.stockLocations.length > 0 ? (
                        selectedProduct.stockLocations.map((location) => (
                          <SelectItem key={location.location} value={location.location}>
                            {location.location}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Nenhuma localização disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-to">Destino</Label>
                  <Select
                    value={movementForm.destination}
                    onValueChange={(value) => setMovementForm(prev => ({ ...prev, destination: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockUnits.map((unit) => (
                        <SelectItem key={unit.name} value={unit.name}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-quantity">Quantidade</Label>
                <Input
                  id="transfer-quantity"
                  type="number"
                  min="1"
                  max={(() => {
                    if (movementForm.origin && selectedProduct?.stockLocations) {
                      const originLocation = selectedProduct.stockLocations.find(
                        loc => loc.location === movementForm.origin
                      );
                      return originLocation?.quantity || 0;
                    }
                    return 0;
                  })()}
                  value={movementForm.quantity}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const maxQuantity = (() => {
                      if (movementForm.origin && selectedProduct?.stockLocations) {
                        const originLocation = selectedProduct.stockLocations.find(
                          loc => loc.location === movementForm.origin
                        );
                        return originLocation?.quantity || 0;
                      }
                      return 0;
                    })();
                    
                    setMovementForm(prev => ({ 
                      ...prev, 
                      quantity: Math.min(value, maxQuantity)
                    }));
                  }}
                />
                {movementForm.origin && selectedProduct?.stockLocations && (
                  <div className="text-sm text-muted-foreground">
                    Disponível: {(() => {
                      const originLocation = selectedProduct.stockLocations.find(
                        loc => loc.location === movementForm.origin
                      );
                      return originLocation?.quantity || 0;
                    })()} {selectedProduct.unit}
                  </div>
                )}
                {movementForm.quantity > (() => {
                  if (movementForm.origin && selectedProduct?.stockLocations) {
                    const originLocation = selectedProduct.stockLocations.find(
                      loc => loc.location === movementForm.origin
                    );
                    return originLocation?.quantity || 0;
                  }
                  return 0;
                })() && (
                  <div className="text-sm text-red-600">
                    Quantidade excede o estoque disponível!
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-reason">Motivo</Label>
                <Textarea
                  id="transfer-reason"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Digite o motivo da transferência..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTransferDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  disabled={
                    !movementForm.origin ||
                    !movementForm.destination ||
                    movementForm.quantity <= 0 ||
                    movementForm.quantity > (() => {
                      if (movementForm.origin && selectedProduct?.stockLocations) {
                        const originLocation = selectedProduct.stockLocations.find(
                          loc => loc.location === movementForm.origin
                        );
                        return originLocation?.quantity || 0;
                      }
                      return 0;
                    })()
                  }
                  onClick={async () => {
                    try {
                      if (selectedProduct) {
                        await handleTransferStock(
                          selectedProduct.id,
                          movementForm.origin,
                          movementForm.destination,
                          movementForm.quantity,
                          movementForm.reason
                        );
                        setIsTransferDialogOpen(false);
                        setMovementForm({
                          type: '',
                          date: '',
                          origin: '',
                          destination: '',
                          quantity: 0,
                          reason: '',
                          expiryDate: ''
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível transferir o estoque",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Transferir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Entrada de Estoque</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-stock-location">Localização</Label>
                  <Select
                    value={movementForm.destination}
                    onValueChange={(value) => setMovementForm(prev => ({ ...prev, destination: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockUnits.map((unit) => (
                        <SelectItem key={unit.name} value={unit.name}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-stock-quantity">Quantidade</Label>
                  <Input
                    id="add-stock-quantity"
                    type="number"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-stock-expiry">Data de Validade</Label>
                <Input
                  id="add-stock-expiry"
                  type="date"
                  value={movementForm.expiryDate}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-stock-reason">Motivo</Label>
                <Textarea
                  id="add-stock-reason"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Digite o motivo da entrada..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddStockDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (selectedProduct) {
                        await handleAddMovement({
                          productId: selectedProduct.id,
                          locationId: movementForm.destination,
                          quantity: movementForm.quantity,
                          expiryDate: movementForm.expiryDate,
                          supplierId: selectedProduct.supplierId,
                          sku: selectedProduct.sku,
                          price: selectedProduct.price
                        });
                        setIsAddStockDialogOpen(false);
                        setMovementForm({
                          type: '',
                          date: '',
                          origin: '',
                          destination: '',
                          quantity: 0,
                          reason: '',
                          expiryDate: ''
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível adicionar o estoque",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Confirmar Entrada
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Stock Dialog */}
      <Dialog open={isRemoveStockDialogOpen} onOpenChange={setIsRemoveStockDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Remover Estoque</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remove-stock-location">Localização</Label>
                  <Select
                    value={movementForm.origin}
                    onValueChange={(value) => setMovementForm(prev => ({ ...prev, origin: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.stockLocations?.map((location) => (
                        <SelectItem key={location.location} value={location.location}>
                          {location.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remove-stock-quantity">Quantidade</Label>
                  <Input
                    id="remove-stock-quantity"
                    type="number"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remove-stock-reason">Motivo</Label>
                <Textarea
                  id="remove-stock-reason"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Digite o motivo da saída..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRemoveStockDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (selectedProduct) {
                        await handleRemoveStock(
                          selectedProduct.id,
                          movementForm.origin,
                          movementForm.quantity,
                          movementForm.reason
                        );
                        setIsRemoveStockDialogOpen(false);
                        setMovementForm({
                          type: '',
                          date: '',
                          origin: '',
                          destination: '',
                          quantity: 0,
                          reason: '',
                          expiryDate: ''
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível remover o estoque",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
