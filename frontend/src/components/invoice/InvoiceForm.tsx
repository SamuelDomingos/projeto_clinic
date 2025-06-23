import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calculator, Receipt } from "lucide-react";
import { toast } from "sonner";
import type { CreateInvoiceData, Patient, Protocol  } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface InvoiceFormProps {
  onBack: () => void;
  protocols: Protocol[];
  patients: Patient[];
  onSubmit: (data: CreateInvoiceData) => Promise<void>;
}

interface InvoiceItem {
  protocolId: string;
  quantity: number;
  price: number;
}

type UpdateItemField = 'protocolId' | 'quantity' | 'price';
type UpdateItemValue = string | number;

export function InvoiceForm({ onBack, protocols, patients, onSubmit }: InvoiceFormProps) {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { protocolId: "", quantity: 1, price: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [notes, setNotes] = useState("");

  // Atualizar subtotal e total sempre que items, discount ou discountType mudar
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return sum + itemTotal;
    }, 0);
    setSubtotal(newSubtotal);

    const newTotal = discountType === 'percentage'
      ? newSubtotal - (newSubtotal * discount / 100)
      : newSubtotal - discount;
    setTotal(newTotal);
  }, [items, discount, discountType]);

  // Verificar se os protocolos estão carregados
  if (!protocols || protocols.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Carregando protocolos...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto carregamos os protocolos disponíveis.</p>
        </div>
      </div>
    );
  }

  const addItem = () => {
    setItems([...items, { protocolId: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: UpdateItemField, value: UpdateItemValue) => {
    console.log('=== updateItem chamado ===');
    console.log('Parâmetros:', { index, field, value });
    
    const newItems = items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item };
        
        if (field === 'protocolId') {
          // Garantir que value seja string para protocolId
          const protocolId = String(value);
          const protocol = protocols.find(p => p.id === protocolId);
          console.log('Protocolo encontrado:', protocol);
          
          const protocolPrice = protocol ? parseFloat(protocol.totalPrice) || 0 : 0;
          console.log('Preço do protocolo convertido:', protocolPrice);
          
          updatedItem.protocolId = protocolId;
          updatedItem.price = protocolPrice;
        } else if (field === 'quantity') {
          updatedItem.quantity = typeof value === 'number' ? value : 1;
        } else if (field === 'price') {
          updatedItem.price = typeof value === 'number' ? value : 0;
        }
        
        console.log('Item atualizado:', updatedItem);
        return updatedItem;
      }
      return item;
    });
    
    console.log('Novos items após atualização:', newItems);
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    const total = price * quantity;
    console.log('Calculando total do item:', { item, total });
    return total;
  };

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente");
      return;
    }

    if (items.some(item => !item.protocolId)) {
      toast.error("Preencha todos os procedimentos");
      return;
    }

    if (!user?.name) {
      toast.error("Usuário não identificado");
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();

    onSubmit({
      type: 'budget',
      patientId: selectedPatient,
      performedBy: user.name,
      date: formattedDate,
      notes: notes,
      items: items.map(item => ({
        protocolId: item.protocolId,
        quantity: item.quantity,
        price: item.price
      })),
      discount,
      discountType,
      payments: []
    });
  };

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Novo Orçamento</h1>
          <p className="text-muted-foreground">Criar orçamento para procedimentos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Seleção do Paciente */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Items do Orçamento */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Procedimentos</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <Select 
                        value={item.protocolId} 
                        onValueChange={(value: string) => {
                          console.log('Protocolo selecionado:', value);
                          updateItem(index, 'protocolId', value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um procedimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {protocols && protocols.length > 0 ? (
                            protocols.map((protocol) => (
                              <SelectItem key={protocol.id} value={protocol.id}>
                                {protocol.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              Carregando protocolos...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="w-24 text-right font-medium text-foreground">
                      R$ {calculateItemTotal(item).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {items.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o orçamento"
                className="bg-background border-input"
              />
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-foreground">Subtotal:</span>
                <span className="text-foreground">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Desconto:</span>
                <div className="flex space-x-2">
                  <Select 
                    value={discountType} 
                    onValueChange={(value: "fixed" | "percentage") => setDiscountType(value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">R$</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right bg-background border-input"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-foreground">Total:</span>
                  <span className="text-foreground">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSubmit}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Salvar Orçamento
                </Button>
                <Button variant="outline" className="w-full">
                  <Receipt className="h-4 w-4 mr-2" />
                  Criar Fatura Direta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 