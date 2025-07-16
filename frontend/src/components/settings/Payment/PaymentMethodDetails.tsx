import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { userApi, User, supplierApi, Supplier, PaymentMethod } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface PaymentMethodDetailsProps {
  method: PaymentMethod;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Partial<PaymentMethod>) => void;
}

const cardBrands = [
  { id: 'visa', name: 'Visa', logo: '/visa.svg' },
  { id: 'mastercard', name: 'Mastercard', logo: '/mastercard.svg' },
  { id: 'elo', name: 'Elo', logo: '/elo.svg' },
  { id: 'amex', name: 'American Express', logo: '/amex.svg' },
  { id: 'hipercard', name: 'Hipercard', logo: '/hipercard.svg' },
  { id: 'maestro', name: 'Maestro', logo: '/maestro.svg' },
  { id: 'hiper', name: 'Hiper', logo: '/hiper.svg' }
];

export function PaymentMethodDetails({ method, isOpen, onClose, onSave }: PaymentMethodDetailsProps) {
  const [activeTab, setActiveTab] = useState<'machine' | 'brands'>('machine');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(method.acceptedBrands || []);
  const [personType, setPersonType] = useState<'pf' | 'pj'>(method.personType || 'pf');
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>(method);
  

  useEffect(() => {
    setFormData(method);
    setSelectedBrands(method.acceptedBrands || []);
    setPersonType(method.personType || 'pf');
  }, [method]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersResponse, suppliersResponse] = await Promise.all([
          userApi.list(),
          supplierApi.getSuppliers()
        ]);
        setUsers(usersResponse);
        setSuppliers(Array.isArray(suppliersResponse) ? suppliersResponse.filter(s => s.category === 'conta') : []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => {
      const currentBrands = Array.isArray(prev) ? prev : [];
      return currentBrands.includes(brandId)
        ? currentBrands.filter(id => id !== brandId)
        : [...currentBrands, brandId];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados obrigatórios
    if (!formData.name || !formData.beneficiaryId) {
      toast({
        title: "Erro",
        description: "Nome e beneficiário são campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar bandeiras aceitas para cartão de crédito/débito
    if ((formData.type === 'credit_card' || formData.type === 'debit_card') && 
        (!selectedBrands || selectedBrands.length === 0)) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma bandeira aceita",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      ...formData,
      acceptedBrands: selectedBrands,
      personType,
      // Garantir que campos numéricos sejam números
      debitTerm: formData.debitTerm ? Number(formData.debitTerm) : undefined,
      firstInstallmentTerm: formData.firstInstallmentTerm ? Number(formData.firstInstallmentTerm) : undefined,
      otherInstallmentsTerm: formData.otherInstallmentsTerm ? Number(formData.otherInstallmentsTerm) : undefined,
      maxInstallments: formData.maxInstallments ? Number(formData.maxInstallments) : undefined,
      anticipationTerm: formData.anticipationTerm ? Number(formData.anticipationTerm) : undefined,
      debitFee: formData.debitFee ? Number(formData.debitFee) : undefined,
      creditFees: formData.creditFees ? Object.fromEntries(
        Object.entries(formData.creditFees).map(([key, value]) => [key, Number(value)])
      ) : undefined
    };

    onSave?.(dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {method.id ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'machine' | 'brands')} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="machine" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Configurações da Maquineta</span>
              </TabsTrigger>
              <TabsTrigger value="brands" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Configurações das Bandeiras</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="machine" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Pessoa</Label>
                  <RadioGroup
                    value={personType}
                    onValueChange={(value) => setPersonType(value as 'pf' | 'pj')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pf" id="pf" />
                      <Label htmlFor="pf">Pessoa Física</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pj" id="pj" />
                      <Label htmlFor="pj">Pessoa Jurídica</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Favorecido *</Label>
                  {loading ? (
                    <div className="h-10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                  ) : personType === 'pf' ? (
                    <>
                      <Select
                        value={formData.beneficiaryId}
                        onValueChange={(value) => {
                          const selectedUser = users.find(u => u.id === value);
                          setFormData({ 
                            ...formData, 
                            beneficiaryId: value, 
                            beneficiaryType: 'user',
                            machineName: selectedUser?.name || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o usuário" />
                        </SelectTrigger>
                        <SelectContent>
                            {(users || []).map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {users.length === 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-sm">
                          Nenhum usuário disponível para seleção. Cadastre um usuário antes de criar uma forma de pagamento.
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Select
                        value={formData.beneficiaryId}
                        onValueChange={(value) => {
                          const selectedSupplier = suppliers.find(s => s.id === value);
                          setFormData({ 
                            ...formData, 
                            beneficiaryId: value, 
                            beneficiaryType: 'supplier',
                            machineName: selectedSupplier?.name || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta bancária" />
                        </SelectTrigger>
                        <SelectContent>
                          {(suppliers || []).map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {suppliers.length === 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-sm">
                          Nenhuma conta bancária disponível para seleção. Cadastre uma conta bancária antes de criar uma forma de pagamento.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Maquineta *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da maquineta"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debitTerm">Prazo Débito (dias)</Label>
                  <Input
                    id="debitTerm"
                    type="number"
                    value={formData.debitTerm || ''}
                    onChange={(e) => setFormData({ ...formData, debitTerm: parseInt(e.target.value) })}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstInstallment">Prazo 1ª Parcela (dias)</Label>
                  <Input
                    id="firstInstallment"
                    type="number"
                    value={formData.firstInstallmentTerm || ''}
                    onChange={(e) => setFormData({ ...formData, firstInstallmentTerm: parseInt(e.target.value) })}
                    placeholder="30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otherInstallments">Prazo Demais Parcelas (dias)</Label>
                  <Input
                    id="otherInstallments"
                    type="number"
                    value={formData.otherInstallmentsTerm || ''}
                    onChange={(e) => setFormData({ ...formData, otherInstallmentsTerm: parseInt(e.target.value) })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxInstallments">Qtd. Máx. de Parcelas</Label>
                  <Input
                    id="maxInstallments"
                    type="number"
                    value={formData.maxInstallments || ''}
                    onChange={(e) => setFormData({ ...formData, maxInstallments: parseInt(e.target.value) })}
                    placeholder="12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="anticipationTerm">Prazo para Antecipação</Label>
                  <Input
                    id="anticipationTerm"
                    type="number"
                    value={formData.anticipationTerm || ''}
                    onChange={(e) => setFormData({ ...formData, anticipationTerm: parseInt(e.target.value) })}
                    placeholder="1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brands" className="space-y-6">
              <div className="space-y-4">
                <Label>Selecionar Bandeiras Aceitas *</Label>
                <div className="grid grid-cols-3 gap-4">
                  {cardBrands.map((brand) => (
                    <Card
                      key={brand.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary",
                        selectedBrands.includes(brand.id) && "border-primary bg-primary/5"
                      )}
                      onClick={() => toggleBrand(brand.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-center">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-8 object-contain"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="debitFee">Débito: Taxa %</Label>
                  <Input
                    id="debitFee"
                    type="number"
                    step="0.01"
                    value={formData.debitFee || ''}
                    onChange={(e) => setFormData({ ...formData, debitFee: parseFloat(e.target.value) })}
                    placeholder="2.5"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Crédito:</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((parcela) => (
                      <div key={parcela} className="space-y-1">
                        <Label className="text-xs">
                          Taxa {parcela}x %
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.creditFees?.[parcela.toString()] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            creditFees: {
                              ...formData.creditFees,
                              [parcela]: parseFloat(e.target.value)
                            }
                          })}
                          placeholder={parcela === 1 ? "3.5" : (3.5 + parcela * 0.2).toFixed(1)}
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Configurações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
