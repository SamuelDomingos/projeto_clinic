import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, CreditCard, DollarSign, Landmark, QrCode } from "lucide-react";
import type { Invoice, InvoicePayment, InvoiceWithDetails, Patient, Protocol, PaymentMethod, UpdateInvoiceData, InvoiceStatus } from "@/lib/api";
import { paymentMethodApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { calculateInvoice } from '@/lib/api/services/invoice';
import type { InvoiceCalculationResult } from '@/lib/api/types/invoice';
import type { InvoicePaymentInput } from '@/lib/api/types/invoice';

interface InvoiceDetailsProps {
  invoice: InvoiceWithDetails;
  protocols: Protocol[];
  onBack: () => void;
  onConvertToInvoice: (id: string) => Promise<void>;
  onUpdate: (id: string, data: import('@/lib/api/types/invoice').UpdateInvoiceData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface InvoiceItem {
  id?: string;
  protocolId: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  protocol?: Protocol;
}

const paymentMethodIcons: Record<string, JSX.Element> = {
  pix: <QrCode className="h-4 w-4 mr-2" />,
  cash: <DollarSign className="h-4 w-4 mr-2" />,
  credit_card: <CreditCard className="h-4 w-4 mr-2" />,
  debit_card: <CreditCard className="h-4 w-4 mr-2" />,
  bank_transfer: <Landmark className="h-4 w-4 mr-2" />,
};

// Função utilitária para agrupar métodos genéricos (NUNCA mostra maquinetas no select principal)
function getGenericPaymentMethods(paymentMethods: PaymentMethod[]) {
  const generics: { id: string; name: string; type: string }[] = [];
  // Adiciona todos os métodos que não são cartão
  for (const m of paymentMethods) {
    if (!['credit_card', 'debit_card'].includes(m.type) && !m.machineName) {
      generics.push({ id: m.id, name: m.name, type: m.type });
    }
  }
  // Adiciona UMA opção genérica para cartão, se houver pelo menos uma maquineta
  if (paymentMethods.some(m => (m.type === 'credit_card' || m.type === 'debit_card') && m.machineName)) {
    generics.push({ id: 'cartao', name: 'Cartão', type: 'credit_card' });
  }
  return generics;
}

export function InvoiceDetails({ 
  invoice, 
  protocols,
  onUpdate,
  onDelete,
  onConvertToInvoice,
}: InvoiceDetailsProps) {
  console.log('Exibindo detalhes da fatura/orçamento:', invoice);
  const [invoiceData, setInvoiceData] = useState(invoice);
  const [items, setItems] = useState<InvoiceItem[]>(
    (invoice.items ?? []).map(item => ({
      id: item.id,
      protocolId: item.protocolId,
      quantity: item.quantity ?? 1,
      price: parseFloat(item.price?.toString() ?? "0"),
      total: item.total !== undefined && item.total !== null
        ? parseFloat(item.total?.toString() ?? "0")
        : (parseFloat(item.price?.toString() ?? "0") * (item.quantity ?? 1)),
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? new Date().toISOString(),
      protocol: item.protocol
    }))
  );
  const [discount, setDiscount] = useState(
    parseFloat(invoice.discount?.toString() ?? "0")
  );
  const [discountType, setDiscountType] = useState(invoice.discountType);
  const [payments, setPayments] = useState<InvoicePaymentInput[]>(invoice.payments as InvoicePaymentInput[] || []);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [calculation, setCalculation] = useState<InvoiceCalculationResult | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await paymentMethodApi.list();
        // Adiciona métodos padrão se não existirem
        const defaultMethods: PaymentMethod[] = [
          {
            id: 'pix',
            name: 'Pix',
            type: 'pix',
            personType: 'pf',
            beneficiaryId: 'system',
            beneficiaryType: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'dinheiro',
            name: 'Dinheiro',
            type: 'cash',
            personType: 'pf',
            beneficiaryId: 'system',
            beneficiaryType: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'transferencia',
            name: 'Transferência',
            type: 'bank_transfer',
            personType: 'pf',
            beneficiaryId: 'system',
            beneficiaryType: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        const allMethods = [...methods];
        defaultMethods.forEach(defaultMethod => {
          if (!methods.some(m => m.id === defaultMethod.id)) {
            allMethods.push(defaultMethod);
          }
        });
        setPaymentMethods(allMethods);
        console.log('Métodos de pagamento carregados:', allMethods);
      } catch (error) {
        console.error('Erro ao carregar métodos de pagamento:', error);
        // Em caso de erro, usa os métodos padrão
        setPaymentMethods([
          {
            id: 'pix',
            name: 'Pix',
            type: 'pix',
            personType: 'pf',
            beneficiaryId: 'system',
            beneficiaryType: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'dinheiro',
            name: 'Dinheiro',
            type: 'cash',
            personType: 'pf',
            beneficiaryId: 'system',
            beneficiaryType: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'transferencia',
            name: 'Transferência',
            type: 'bank_transfer',
            personType: 'pf',
            beneficiaryId: 'system',
            beneficiaryType: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
        console.log('Métodos de pagamento padrão carregados.');
      }
    };
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    async function fetchCalculation() {
      try {
        const result = await calculateInvoice({
          items: items.map(item => ({
            protocolId: item.protocolId,
            quantity: item.quantity,
            price: item.price
          })),
          discount,
          discountType,
          payments: payments.map(payment => {
            const isCard = payment.paymentMethodId === 'cartao';
            const installmentValue = Number(payment.installmentValue) || 0;
            return {
              paymentMethodId: isCard ? payment.machineId : payment.paymentMethodId || '',
              installments: isCard ? Number(payment.installments) || 1 : 1,
              installmentValue,
              totalValue: installmentValue, // Sempre igual ao installmentValue
              cardBrand: isCard ? payment.cardBrand : undefined,
            };
          }),
        });
        setCalculation(result);
      } catch (err) {
        setCalculation(null);
      }
    }
    fetchCalculation();
  }, [items, discount, discountType, payments]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      protocolId: "",
      quantity: 1,
      price: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item };
        
        if (field === 'protocolId') {
          const protocolId = String(value);
          const protocol = protocols.find(p => p.id === protocolId);
          const protocolPrice = protocol ? Number(protocol.totalPrice) || 0 : 0;
          
          updatedItem.protocolId = protocolId;
          updatedItem.price = protocolPrice;
          updatedItem.total = protocolPrice * updatedItem.quantity;
          updatedItem.protocol = protocol;
        } else if (field === 'quantity') {
          const quantity = typeof value === 'number' ? value : 1;
          updatedItem.quantity = quantity;
          updatedItem.total = updatedItem.price * quantity;
        } else if (field === 'price') {
          const price = typeof value === 'number' ? value : 0;
          updatedItem.price = price;
          updatedItem.total = price * updatedItem.quantity;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(newItems);
  };

  const addPayment = () => {
    // Calcular valor restante
    const totalPayments = payments.reduce((sum, p) => sum + (Number(p.totalValue) || 0), 0);
    const remaining = Math.max(calculation?.total - totalPayments || 0, 0);
    const newPayment: InvoicePaymentInput = {
      paymentMethodName: 'Dinheiro',
      dueDate: new Date().toISOString(),
      installments: 1,
      installmentValue: 0,
      totalValue: 0,
      controlNumber: '',
      description: '',
    };
    setPayments([...payments, newPayment]);
  };

  // Corrigir updatePayment para não usar 'any'
  const updatePayment = (paymentIndex: number, field: keyof InvoicePaymentInput, value: string | number | undefined) => {
    setPayments(payments =>
      payments.map((payment, idx) =>
        idx === paymentIndex
          ? { ...payment, [field]: value }
          : payment
      )
    );
  };

  const handlePatientClick = () => {
    window.open(`/patients/${invoiceData.patientId}`, '_blank');
  };

  return (
    <div className="space-y-8 bg-background p-2 md:p-6">
      {/* ===== Dados Gerais ===== */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Dados do Documento</CardTitle>
          <p className="text-muted-foreground text-sm">Informações principais da fatura/orçamento</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Código da Guia</label>
                  <Input
                    value={invoiceData.guide}
                    disabled
                    className="bg-muted border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Data de Emissão</label>
                  <Input
                    type="date"
                    value={invoiceData.date.split('T')[0]}
                    disabled
                    className="bg-muted border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Profissional Responsável</label>
                  <Input
                    value={invoiceData.performedBy}
                    disabled
                    className="bg-muted border-input"
                  />
                </div>
              </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-foreground">Observações e Comentários</label>
            <Textarea
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              rows={3}
              className="bg-background border-input"
            />
          </div>
        </CardContent>
      </Card>
      <hr className="my-4 border-muted" />

      {/* ===== Procedimentos ===== */}
      <Card className="shadow-md bg-muted/30">
        <CardHeader>
          <CardTitle>Procedimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <Select 
                        value={item.protocolId} 
                        onValueChange={(value: string) => updateItem(index, 'protocolId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um procedimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {protocols.map((protocol) => (
                            <SelectItem key={protocol.id} value={protocol.id}>
                              {protocol.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Quantidade"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="w-24 text-right font-medium text-foreground">
                      R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      {/* ===== Pagamentos ===== */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">Pagamentos</span>
            <Button size="sm" variant="outline" onClick={addPayment}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Pagamento
            </Button>
          </div>
          {paymentMethods.length === 0 ? (
            <div className="text-red-600">Nenhum método de pagamento disponível.</div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-auto pr-2">
                  {payments.map((payment, index) => {
                    // O método selecionado é genérico (ex: 'credit_card') ou id real
                    const isCard = payment.paymentMethodId === 'credit_card' || payment.paymentMethodId === 'debit_card';
                    // Para cartões, lista todas as maquinetas desse tipo
                    const availableMachines = isCard ? paymentMethods.filter(m => m.type === payment.paymentMethodId) : [];
                    const genericMethods = getGenericPaymentMethods(paymentMethods);
                    // LOG PARA DEPURAÇÃO
                    console.log('Métodos de pagamento disponíveis:', paymentMethods);
                    console.log('genericMethods:', genericMethods);
                    return (
                      <div key={index} className="p-4 border border-border rounded-lg bg-card">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-foreground">Registro de Pagamento {index + 1}</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPayments(payments.filter((_, idx) => idx !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 bg-muted/30 rounded-lg">
                          <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-primary">Método de Pagamento</label>
                            <Select 
                              value={payment.paymentMethodId ?? ''}
                              onValueChange={(value) => {
                                updatePayment(index, 'paymentMethodId', value);
                                // Só limpa maquineta/bandeira se o método NÃO for 'cartao'
                                if (value !== 'cartao') {
                                  updatePayment(index, 'machineId', '');
                                  updatePayment(index, 'cardBrand', '');
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha o método de pagamento" />
                              </SelectTrigger>
                              <SelectContent>
                                {getGenericPaymentMethods(paymentMethods).map((method) => (
                                  <SelectItem key={method.id} value={method.id}>
                                    <div className="flex items-center">
                                      {paymentMethodIcons[method.type] || null}
                                      <span>{method.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Maquineta e bandeira só aparecem se for cartão */}
                          {payment.paymentMethodId === 'cartao' ? (
                            <>
                              <div className="col-span-1 flex flex-col">
                                <label className="block text-sm font-semibold mb-2 text-primary">Maquineta</label>
                                <Select
                                  value={String(payment.machineId || '')}
                                  onValueChange={v => updatePayment(index, 'machineId', v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a maquineta" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethods.filter(m => (m.type === 'credit_card' || m.type === 'debit_card') && m.machineName).map(m => (
                                      <SelectItem key={String(m.id)} value={String(m.id)}>{m.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-1 flex flex-col">
                                <label className="block text-sm font-semibold mb-2 text-primary">Bandeira</label>
                                <Select
                                  value={String(payment.cardBrand || '')}
                                  onValueChange={v => updatePayment(index, 'cardBrand', v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a bandeira" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(paymentMethods.find(m => String(m.id) === String(payment.machineId))?.acceptedBrands || []).map(b => (
                                      <SelectItem key={String(b)} value={String(b)}>{b}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-span-1"></div>
                              <div className="col-span-1"></div>
                            </>
                          )}
                          {/* Campos comuns para todos os métodos */}
                          <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-primary">Data de Recebimento</label>
                            <Input
                              type="date"
                              value={payment.dueDate ? payment.dueDate.split('T')[0] : ''}
                              onChange={(e) => updatePayment(index, 'dueDate', new Date(e.target.value).toISOString())}
                              className="bg-background border-input"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-primary">Nº Comprovante</label>
                            <Input
                              value={payment.controlNumber ?? ''}
                              onChange={(e) => updatePayment(index, 'controlNumber', e.target.value)}
                              className="bg-background border-input"
                            />
                          </div>
                          {/* Parcelas: só para cartão */}
                          {payment.paymentMethodId === 'cartao' ? (
                            <div className="col-span-1">
                              <label className="block text-sm font-semibold mb-2 text-primary">Parcelas</label>
                              <Input
                                type="number"
                                min="1"
                                value={String(payment.installments)}
                                onChange={e => updatePayment(index, 'installments', parseInt(e.target.value) || 1)}
                                className="bg-background border-input"
                              />
                            </div>
                          ) : (
                            <div className="col-span-1">
                              <label className="block text-sm font-semibold mb-2 text-primary">Parcelas</label>
                              <Input
                                type="number"
                                min="1"
                                value="1"
                                disabled
                                className="bg-background border-input opacity-50"
                              />
                            </div>
                          )}
                          <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-primary">Valor do Pagamento</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={payment.installmentValue?.toString() ?? ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updatePayment(index, 'installmentValue', value);
                                updatePayment(index, 'totalValue', value);
                              }}
                              className={`bg-background border-input${!payment.installmentValue ? ' border-red-500' : ''}`}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-semibold mb-2 text-primary">Observações do Pagamento</label>
                            <Input
                              value={payment.description ?? ''}
                              onChange={(e) => updatePayment(index, 'description', e.target.value)}
                              placeholder="Observações sobre o pagamento"
                              className="bg-background border-input"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            )}
          </CardContent>
        </Card>
      <hr className="my-4 border-muted" />

      {/* ===== Resumo Financeiro ===== */}
      <Card className="shadow-md bg-muted/20">
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-foreground">Valor dos Procedimentos:</span>
            <span className="text-foreground">R$ {calculation ? calculation.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '...'}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-foreground">Aplicar Desconto:</span>
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
                  className="w-24"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Valor Total do Documento:</span>
            <span className="text-foreground font-bold">R$ {calculation ? calculation.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '...'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Valor Total Recebido:</span>
            <span className="text-foreground">R$ {calculation ? calculation.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '...'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground">Situação do Pagamento:</span>
            <Badge variant={
              calculation?.paymentStatus === 'paid' ? 'default' :
              calculation?.paymentStatus === 'partial' ? 'secondary' :
              'destructive'
            }>
              {calculation?.paymentStatus === 'paid' ? 'Pagamento Concluído' :
                calculation?.paymentStatus === 'partial' ? 'Pagamento Parcial' :
                'Aguardando Pagamento'}
            </Badge>
          </div>
        </CardContent>
      </Card>
      {/* Bloco de botões de ação */}
      <div className="flex gap-2 justify-end mt-4">
        <Button
          onClick={() => onUpdate(invoiceData.id, {
            items: items.map(item => ({
              protocolId: item.protocolId,
              quantity: item.quantity,
              price: item.price
            })),
            payments: payments.map(payment => {
              const isCard = !!payment.paymentMethodId && payment.paymentMethodId !== 'cartao';
              const installmentValue = Number(payment.installmentValue) || 0;
              if (isCard) {
                return {
                  paymentMethodId: payment.paymentMethodId,
                  paymentMethodName: payment.paymentMethodName || 'Cartão de Crédito',
                  cardBrand: payment.cardBrand,
                  dueDate: payment.dueDate,
                  installments: Number(payment.installments) || 1,
                  installmentValue,
                  totalValue: installmentValue,
                  controlNumber: payment.controlNumber,
                  description: payment.description,
                  machineId: payment.machineId,
                };
              } else {
                // Envie paymentMethodId: null para métodos simples
                return {
                  paymentMethodId: null,
                  paymentMethodName: payment.paymentMethodName || 'Dinheiro',
                  dueDate: payment.dueDate,
                  installments: 1,
                  installmentValue,
                  totalValue: installmentValue,
                  controlNumber: payment.controlNumber,
                  description: payment.description,
                };
              }
            }),
            discount,
            discountType,
            notes: invoiceData.notes,
          })}
        >
          Salvar Alterações
        </Button>
        <Button variant="destructive" onClick={() => onDelete(invoiceData.id)}>
          Excluir
        </Button>
        {invoiceData.type === 'budget' && (
          <Button variant="outline" onClick={() => onConvertToInvoice(invoiceData.id)}>
            Converter em Fatura
          </Button>
        )}
      </div>
    </div>
  );
} 