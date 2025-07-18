import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calculator, Receipt } from "lucide-react";
import { toast } from "sonner";
import type { CreateInvoiceData, Patient, Protocol, InvoicePaymentInput } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { calculateInvoice } from '@/lib/api/services/invoice';
import type { InvoiceCalculationResult } from '@/lib/api/types/invoice';

// Adicionar tipos auxiliares para pagamentos
const PAYMENT_METHODS = [
  { value: "Dinheiro", label: "Dinheiro", type: "cash" },
  { value: "Pix", label: "Pix", type: "cash" },
  { value: "Cartão de Crédito", label: "Cartão de Crédito", type: "card" },
  { value: "Cartão de Débito", label: "Cartão de Débito", type: "card" },
  // Adicione outros métodos se necessário
];
const CARD_BRANDS = [
  "Visa", "Mastercard", "Elo", "Amex", "Hipercard", "Outros"
];
const MACHINES = [
  // Exemplo: substitua por fetch real se necessário
  { id: "maq-1", name: "Maquineta 1" },
  { id: "maq-2", name: "Maquineta 2" },
];

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
  const [calculation, setCalculation] = useState<InvoiceCalculationResult | null>(null);
  const [notes, setNotes] = useState("");
  const [payments, setPayments] = useState<InvoicePaymentInput[]>([]);

  // Atualizar subtotal e total sempre que items, discount ou discountType mudar
  useEffect(() => {
    async function fetchCalculation() {
      try {
        console.log('Calculando com:', { items, discount, discountType, payments });
        const result = await calculateInvoice({
          items,
          discount,
          discountType,
          payments: payments.map(p => {
            const method = PAYMENT_METHODS.find(m => m.value === p.paymentMethodName);
            const isCard = method?.type === 'card';
            const installmentValue = Number(p.installmentValue) || 0;
            return {
              paymentMethodId: isCard ? p.paymentMethodId : p.paymentMethodId || '',
              installments: isCard ? Number(p.installments) || 1 : 1,
              installmentValue,
              totalValue: installmentValue, // Sempre igual ao installmentValue
              cardBrand: isCard ? p.cardBrand : undefined,
            };
          }),
        });
        console.log('Resultado do cálculo:', result);
        setCalculation(result);
      } catch (err) {
        console.error('Erro no cálculo:', err);
        setCalculation(null);
      }
    }
    fetchCalculation();
  }, [items, discount, discountType, payments]);

  // Funções para manipular pagamentos
  const addPayment = () => {
    // Calcular valor restante
    const totalPayments = payments.reduce((sum, p) => sum + (Number(p.totalValue) || 0), 0);
    const remaining = Math.max(calculation?.total || 0 - totalPayments, 0);
    setPayments([
      ...payments,
      {
        paymentMethodName: "Dinheiro",
        dueDate: new Date().toISOString().slice(0, 10),
        installments: 1,
        installmentValue: "",
        totalValue: "",
        paymentMethodId: undefined,
        cardBrand: undefined,
      },
    ]);
  };
  const removePayment = (idx: number) => {
    setPayments(payments.filter((_, i) => i !== idx));
  };
  const updatePayment = (idx: number, field: keyof InvoicePaymentInput, value: string | number) => {
    setPayments(payments.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const updatePaymentMethod = (idx: number, value: string) => {
    const method = PAYMENT_METHODS.find(m => m.value === value);
    let updated = { ...payments[idx], paymentMethodName: value };
    if (method?.type === "card") {
      updated = { ...updated, paymentMethodId: MACHINES[0]?.id || "", cardBrand: CARD_BRANDS[0], installments: 1 };
    } else {
      updated = { ...updated, paymentMethodId: undefined, cardBrand: undefined };
    }
    setPayments(payments.map((p, i) => i === idx ? updated : p));
  };

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
          
          const protocolPrice = protocol ? Number(protocol.totalPrice) || 0 : 0;
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
    // Validação dos pagamentos
    for (const [i, p] of payments.entries()) {
      if (!p.paymentMethodName || !p.dueDate || !p.installments || !p.installmentValue || !p.totalValue) {
        toast.error(`Preencha todos os campos obrigatórios do pagamento #${i + 1}`);
        return;
      }
      const method = PAYMENT_METHODS.find(m => m.value === p.paymentMethodName);
      if (method?.type === "card") {
        if (!p.paymentMethodId || !p.cardBrand) {
          toast.error(`Selecione maquineta e bandeira para o pagamento em cartão #${i + 1}`);
          return;
        }
      }
    }
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    onSubmit({
      type: 'budget',
      patientId: selectedPatient,
      performedBy: user.name,
      notes: notes,
      items: items.map(item => ({
        protocolId: item.protocolId,
        quantity: item.quantity,
        price: item.price
      })),
      discount,
      discountType,
      payments: payments.map(p => ({
        ...p,
        installmentValue: Number(p.installmentValue),
        totalValue: Number(p.totalValue),
      })),
    });
  };

  return (
    <div className="space-y-8 bg-background p-2 md:p-6">
      {/* ===== Dados do Paciente ===== */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
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
      <hr className="my-4 border-muted" />

      {/* ===== Procedimentos ===== */}
      <Card className="shadow-md bg-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Procedimentos</CardTitle>
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
                  R$ {calculation ? calculation.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '...'}
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
      <hr className="my-4 border-muted" />

      {/* ===== Observações ===== */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Observações</CardTitle>
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
      <hr className="my-4 border-muted" />

      {/* ===== Pagamentos ===== */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">Pagamentos</span>
              <Button size="sm" variant="outline" onClick={addPayment}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Pagamento
              </Button>
            </div>
            <div className="space-y-4">
              {payments.length === 0 && <div className="text-muted-foreground text-sm">Nenhum pagamento adicionado.</div>}
              {payments.map((p, idx) => {
                const method = PAYMENT_METHODS.find(m => m.value === p.paymentMethodName);
                return (
                  <div key={idx} className="border border-border rounded-lg p-3 space-y-2 relative">
                    <div className="flex items-center gap-2">
                      <Select value={p.paymentMethodName} onValueChange={v => updatePaymentMethod(idx, v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Método" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        className="w-36"
                        value={String(p.dueDate)}
                        onChange={e => updatePayment(idx, 'dueDate', e.target.value)}
                      />
                      <Input
                        type="number"
                        className="w-24"
                        min={1}
                        value={String(p.installments)}
                        onChange={e => updatePayment(idx, 'installments', parseInt(e.target.value) || 1)}
                        placeholder="Parcelas"
                      />
                      <Input
                        type="number"
                        className="w-28"
                        value={String(p.installmentValue)}
                        onChange={e => updatePayment(idx, 'installmentValue', e.target.value)}
                        placeholder="Valor do Pagamento"
                      />
                      <Button size="icon" variant="ghost" onClick={() => removePayment(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {method?.type === "card" && (
                      <div className="flex items-center gap-2 mt-2">
                        <Select value={p.paymentMethodId || ""} onValueChange={v => updatePayment(idx, 'paymentMethodId', v)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Maquineta" />
                          </SelectTrigger>
                          <SelectContent>
                            {MACHINES.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={p.cardBrand || ""} onValueChange={v => updatePayment(idx, 'cardBrand', v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Bandeira" />
                          </SelectTrigger>
                          <SelectContent>
                            {CARD_BRANDS.map(b => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      <hr className="my-4 border-muted" />

      {/* ===== Resumo ===== */}
      <Card className="shadow-md bg-muted/20">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculation === null && (
            <div className="text-red-600 text-sm">Erro ao calcular o resumo financeiro. Verifique os dados dos procedimentos e pagamentos.</div>
          )}
          <div className="flex justify-between">
            <span className="text-foreground">Subtotal:</span>
            <span className="text-foreground">R$ {calculation ? calculation.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '...'}</span>
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
              <span className="text-foreground">R$ {calculation ? calculation.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '...'}</span>
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
  );
} 