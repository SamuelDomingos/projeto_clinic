import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Protocol, ProtocolService } from "@/lib/api/types/protocol";
import type { Invoice } from "@/lib/api";
import { CreditCard, Banknote, QrCode, Receipt, Building2, Plus, X } from "lucide-react";
import React from "react"; // Added missing import for React
import { invoiceApi } from "@/lib/api";
import { calculateInvoice } from "@/lib/api/services/invoice";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { paymentMethodApi } from "@/lib/api";
import type { PaymentMethod } from "@/lib/api/types/payment";
import type { InvoicePaymentInput, InvoiceStatus } from "@/lib/api/types/invoice";
import type { InvoiceCalculationResult } from "@/lib/api/types/invoice";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface BudgetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocols: Protocol[];
  loadingProtocols: boolean;
  invoiceToEdit?: Invoice | null;
  onSaved?: () => void;
  patientId: string; // NOVO PROP
}

// Função utilitária para extrair o preço do serviço de forma segura
function getServicePrice(ps: ProtocolService): number {
  if (ps.service && typeof ps.service === 'object' && 'price' in ps.service && typeof ps.service.price === 'number') {
    return ps.service.price;
  }
  if (ps.service && typeof ps.service === 'object' && 'price' in ps.service && typeof ps.service.price === 'number') {
    return ps.service.price;
  }
  return 0;
}

// Função para garantir que sempre pega os serviços do protocolo
function getProtocolServices(protocol: Protocol): ProtocolService[] {
  if (protocol.protocolServices && protocol.protocolServices.length > 0) return protocol.protocolServices;
  if (protocol.protocolServices && protocol.protocolServices.length > 0) return protocol.protocolServices;
  return [];
}

// MultiSelect customizado para protocolos
function ProtocolMultiSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const selectedOptions = options.filter(opt => value.includes(opt.value));
  const unselectedOptions = options.filter(opt => !value.includes(opt.value));

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap items-center min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        tabIndex={0}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-muted-foreground select-none">{placeholder}</span>
        )}
        {selectedOptions.map(opt => (
          <span key={opt.value} className="flex items-center bg-primary/10 text-primary rounded px-2 py-0.5 mr-1 mb-1 text-xs">
            {opt.label}
            <button
              type="button"
              className="ml-1 text-primary hover:text-red-500 focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                onChange(value.filter(v => v !== opt.value));
              }}
              tabIndex={-1}
            >×</button>
          </span>
        ))}
      </div>
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {unselectedOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum protocolo disponível</div>
          ) : (
            unselectedOptions.map(opt => (
              <div
                key={opt.value}
                className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                onClick={() => onChange([...value, opt.value])}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

type PaymentType = 'credit_card' | 'pix' | 'cash' | 'bank_slip' | 'bank_transfer';

interface PaymentTypeOption {
  id: PaymentType;
  name: string;
  icon: React.ReactNode;
}

// Definir paymentTypes após a importação dos ícones
const paymentTypes: PaymentTypeOption[] = [
  { id: 'credit_card', name: 'Cartão', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'pix', name: 'PIX', icon: <QrCode className="h-4 w-4" /> },
  { id: 'cash', name: 'Dinheiro', icon: <Banknote className="h-4 w-4" /> },
  { id: 'bank_slip', name: 'Boleto', icon: <Receipt className="h-4 w-4" /> },
  { id: 'bank_transfer', name: 'Transferência', icon: <Building2 className="h-4 w-4" /> },
];

// Adicionar tipo local que estende InvoicePaymentInput
type PaymentFormData = InvoicePaymentInput & {
  paymentType?: PaymentType;
};

export function BudgetDrawer({ open, onOpenChange, protocols, loadingProtocols, invoiceToEdit, onSaved, patientId }: BudgetDrawerProps) {
  const [tab, setTab] = useState("orcamento");
  // Detalhes
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("pending");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  // Pagamentos
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<PaymentFormData[]>([]);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    paymentMethodId: "",
    paymentType: undefined,
    dueDate: "",
    installments: 1,
    installmentValue: "",
    totalValue: "",
    machineId: "",
    cardBrand: "",
  });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [maxInstallments, setMaxInstallments] = useState<number>(1);
  const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>([]);
  const [procedimento, setProcedimento] = useState("");
  const [material, setMaterial] = useState("");
  // Estado para protocolo expandido
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);
  // Desconto único para o orçamento
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  // Quantidade de cada protocolo
  const [protocolQuantities, setProtocolQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const [calcResult, setCalcResult] = useState<InvoiceCalculationResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Não selecionar protocolo automaticamente ao abrir
  useEffect(() => {
    if (invoiceToEdit && open) {
      // Preencher os campos do drawer com os dados do invoiceToEdit
      const protocolIds = invoiceToEdit.items.map(item => item.protocolId);
      setSelectedProtocolIds(protocolIds);
      const quantities: Record<string, number> = {};
      invoiceToEdit.items.forEach(item => {
        quantities[item.protocolId] = item.quantity;
      });
      setProtocolQuantities(quantities);
      setGlobalDiscount(invoiceToEdit.discount || 0);
      // Preencha outros campos conforme necessário
    } else if (open) {
      // Limpe os campos para novo orçamento
      setSelectedProtocolIds([]);
      setGlobalDiscount(0);
      setProtocolQuantities({});
    }
  }, [invoiceToEdit, open]);

  // Carregar métodos de pagamento ao abrir aba pagamento
  useEffect(() => {
    if (tab === "pagamento" && paymentMethods.length === 0) {
      paymentMethodApi.list().then(setPaymentMethods);
    }
  }, [tab]);

  // Preencher detalhes ao editar
  useEffect(() => {
    if (invoiceToEdit && open) {
      setNumber(invoiceToEdit.number || "");
      setStatus(invoiceToEdit.status || "pending");
      setDate(invoiceToEdit.date ? invoiceToEdit.date.slice(0, 10) : "");
      setNotes(invoiceToEdit.notes || "");
      setPayments(invoiceToEdit.payments || []);
    } else if (open) {
      setNumber("");
      setStatus("pending");
      setDate("");
      setNotes("");
      setPayments([]);
    }
  }, [invoiceToEdit, open]);

  // Atualizar brands e parcelas ao escolher maquineta
  useEffect(() => {
    if (paymentForm.paymentType === 'credit_card' && paymentForm.machineId) {
      const method = paymentMethods.find(m => m.id === paymentForm.machineId);
      setAvailableBrands(method?.acceptedBrands || []);
      setMaxInstallments(method?.maxInstallments || 1);
    } else {
      setAvailableBrands([]);
      setMaxInstallments(1);
    }
  }, [paymentForm.paymentType, paymentForm.machineId, paymentMethods]);

  // Adicionar pagamento
  // No handleAddPayment, após adicionar o pagamento localmente:
  const handleAddPayment = async () => {
    // Para cartão, exige maquineta e bandeira
    if (paymentForm.paymentType === 'credit_card') {
      if (!paymentForm.totalValue || !paymentForm.dueDate || !paymentForm.machineId || !paymentForm.cardBrand) {
        toast({
          title: "Erro",
          description: "Para cartão, preencha valor, data, maquineta e bandeira.",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Para outros métodos, só exige valor e data
      if (!paymentForm.totalValue || !paymentForm.dueDate) {
        toast({
          title: "Erro",
          description: "Preencha valor e data de pagamento.",
          variant: "destructive"
        });
        return;
      }
    }

    const newPayment = {
      ...paymentForm,
      paymentMethodName: paymentTypes.find(pt => pt.id === paymentForm.paymentType)?.name,
    };

    const newPayments = [...payments, newPayment];
    setPayments(newPayments);

    // Se estiver editando um invoice existente, processar o pagamento
    // No handleAddPayment, onde está chamando processPayment:
    if (invoiceToEdit) {
      try {
        await invoiceApi.processPayment(invoiceToEdit.id, {
          amount: Number(paymentForm.totalValue),
          paymentMethodId: paymentForm.machineId || paymentForm.paymentMethodId || '',
          paymentMethodName: paymentTypes.find(pt => pt.id === paymentForm.paymentType)?.name || '',
          description: `Pagamento via ${paymentTypes.find(pt => pt.id === paymentForm.paymentType)?.name}`,
          userId: 'temp-user-id', // TEMPORÁRIO - substitua pelo ID real do usuário
          dueDate: new Date(paymentForm.dueDate),
          installments: paymentForm.installments || 1,
          cardBrand: paymentForm.cardBrand,
        });
        
        toast({ 
          title: "Pagamento processado!", 
          description: "Pagamento confirmado e transação criada automaticamente." 
        });
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        toast({ 
          title: "Erro", 
          description: `Erro ao processar pagamento: ${error.message}`, 
          variant: "destructive" 
        });
      }
    }

    setPaymentForm({
      paymentMethodId: "",
      paymentType: undefined,
      dueDate: "",
      installments: 1,
      installmentValue: "",
      totalValue: "",
      machineId: "",
      cardBrand: "",
    });
  };

  // Remover pagamento
  const handleRemovePayment = async (idx: number) => {
    const newPayments = payments.filter((_, i) => i !== idx);
    setPayments(newPayments);

    // Se estiver editando um invoice existente, já salva no backend
    if (invoiceToEdit) {
      try {
        // Sempre envie items e campos obrigatórios
        const items = selectedProtocolIds.map(pid => {
          const protocol = protocols.find(p => p.id === pid);
          return {
            protocolId: pid,
            quantity: protocolQuantities[pid] || 1,
            price: protocol?.totalPrice || 0,
          };
        });
        const formattedPayments: InvoicePaymentInput[] = newPayments.map(p => {
          const base = {
            paymentMethodName: p.paymentMethodName || paymentTypes.find(pt => pt.id === p.paymentType)?.name,
            dueDate: p.dueDate,
            installments: p.installments || 1,
            installmentValue: String(Number(p.totalValue) / (p.installments || 1)),
            totalValue: String(p.totalValue),
            cardBrand: p.cardBrand,
            machineId: p.machineId,
            description: `Pagamento via ${p.paymentMethodName || paymentTypes.find(pt => pt.id === p.paymentType)?.name}`,
          };
          if (p.paymentType === "credit_card" && p.machineId) {
            return { ...base, paymentMethodId: p.machineId };
          }
          return base;
        });
        await invoiceApi.update(invoiceToEdit.id, {
          items,
          payments: formattedPayments,
          discount: Number(globalDiscount),
          discountType: invoiceToEdit.discountType || "fixed",
          status: status || invoiceToEdit.status,
          performedBy: invoiceToEdit.performedBy,
          notes,
        });
        toast({ title: "Pagamento salvo!", description: "Pagamento adicionado com sucesso." });
      } catch (error) {
        toast({ title: "Erro", description: "Erro ao salvar pagamento.", variant: "destructive" });
      }
    }

    setPaymentForm({
      paymentMethodId: "",
      paymentType: undefined,
      dueDate: "",
      installments: 1,
      installmentValue: "",
      totalValue: "",
      machineId: "",
      cardBrand: "",
    });
  };

  const selectedProtocols = protocols.filter(p => selectedProtocolIds.includes(p.id));

  // No handleSave, garantir que os pagamentos estão no formato correto
  const handleSave = async () => {
    try {
      const items = selectedProtocolIds.map(pid => {
        const protocol = protocols.find(p => p.id === pid);
        return {
          protocolId: pid,
          quantity: protocolQuantities[pid] || 1,
          price: protocol?.totalPrice || 0,
        };
      });

      if (!items.length) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um protocolo/serviço antes de salvar.",
          variant: "destructive"
        });
        return;
      }

      // Garantir que os pagamentos estão no formato correto
      const formattedPayments: InvoicePaymentInput[] = payments.map(p => {
        const base = {
          paymentMethodName: p.paymentMethodName || paymentTypes.find(pt => pt.id === p.paymentType)?.name,
          dueDate: p.dueDate,
          installments: p.installments || 1,
          installmentValue: String(Number(p.totalValue) / (p.installments || 1)),
          totalValue: String(p.totalValue),
          cardBrand: p.cardBrand,
          machineId: p.machineId,
          description: `Pagamento via ${p.paymentMethodName || paymentTypes.find(pt => pt.id === p.paymentType)?.name}`,
        };
        if (p.paymentType === "credit_card" && p.machineId) {
          return { ...base, paymentMethodId: p.machineId };
        }
        return base;
      });

      const updateData = {
        items,
        discount: Number(globalDiscount),
        discountType: invoiceToEdit?.discountType || "fixed",
        payments: formattedPayments,
        status: status || invoiceToEdit?.status,
        performedBy: invoiceToEdit?.performedBy,
        notes,
      };

      if (invoiceToEdit) {
        // Edição
        await invoiceApi.update(invoiceToEdit.id, updateData);
        toast({ title: "Sucesso", description: "Orçamento/Fatura atualizado com sucesso!" });
      } else {
        // Criação
        const createData = {
          ...updateData,
          type: "budget" as const,
          patientId,
          performedBy: "usuário logado",
          protocolId: selectedProtocolIds[0] || undefined,
        };
        
        // ADICIONE ESTE LOG PARA DEBUG
        console.log('📤 Dados sendo enviados para API:', createData);
        
        await invoiceApi.create(createData);
        toast({ title: "Sucesso", description: "Orçamento criado com sucesso!" });
      }
      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (error) {
      console.error('❌ Erro detalhado:', error);
      toast({ title: "Erro", description: "Erro ao salvar alterações", variant: "destructive" });
    }
  };

  // Atualizar cálculo sempre que mudar protocolos, quantidades, desconto ou pagamentos
  useEffect(() => {
    const fetchCalculation = async () => {
      setCalcLoading(true);
      const items = selectedProtocolIds.map(pid => {
        const protocol = protocols.find(p => p.id === pid);
        return {
          protocolId: pid,
          quantity: protocolQuantities[pid] || 1,
          price: protocol?.totalPrice || 0,
        };
      });
      // No useEffect de cálculo, garantir que todos os pagamentos tenham os campos obrigatórios e estejam tipados corretamente
      const safePayments: {
        paymentMethodId: string;
        installments: number;
        installmentValue: number;
        totalValue: number;
        dueDate: string;
        cardBrand?: string;
        machineId?: string;
        paymentMethodName?: string;
      }[] = payments.map(p => ({
        paymentMethodId: p.paymentMethodId || '',
        installments: p.installments || 1,
        installmentValue: Number(p.installmentValue) || Number(p.totalValue) || 0,
        totalValue: Number(p.totalValue) || 0,
        dueDate: p.dueDate || '',
        cardBrand: p.cardBrand,
        machineId: p.machineId,
        paymentMethodName: p.paymentMethodName,
      }));
      try {
        const result = await calculateInvoice({
          items,
          discount: globalDiscount,
          discountType: "percentage",
          payments: safePayments,
        });
        setCalcResult(result);
      } catch (e) {
        setCalcResult(null);
      } finally {
        setCalcLoading(false);
      }
    };
    fetchCalculation();
  }, [selectedProtocolIds, protocolQuantities, globalDiscount, payments, protocols]);

  // Funções de cálculo
  const calculateSubtotal = () => {
    return selectedProtocols.reduce((acc, p) => {
      const price = typeof p.totalPrice === 'number' ? p.totalPrice : parseFloat(p.totalPrice) || 0;
      const quantity = protocolQuantities[p.id] || 1;
      return acc + price * quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (globalDiscount / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const calculateTotalPaid = () => {
    return payments.reduce((sum, p) => sum + Number(p.totalValue), 0);
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const paid = calculateTotalPaid();
    return Math.max(total - paid, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] w-[80vw]" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle>Orçamento para Paciente</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="mb-4 border-b w-full bg-transparent">
            <TabsTrigger value="orcamento" className="px-4">Orçamento</TabsTrigger>
            <TabsTrigger value="detalhes" className="px-4">Detalhes</TabsTrigger>
            <TabsTrigger value="pagamento" className="px-4">Pagamento</TabsTrigger>
          </TabsList>
          <TabsContent value="orcamento">
            <div className="space-y-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Modelos</label>
                  <ProtocolMultiSelect
                    options={protocols.map(protocol => ({ label: protocol.name, value: protocol.id }))}
                    value={selectedProtocolIds}
                    onChange={setSelectedProtocolIds}
                    placeholder={loadingProtocols ? "Carregando..." : "Selecione um ou mais protocolos"}
                    disabled={loadingProtocols}
                  />
                </div>
              </div>
              {/* Tabela de protocolos selecionados com expansão */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full table-auto border rounded">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left text-xs font-semibold">Protocolo</th>
                      <th className="p-2 text-left text-xs font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProtocols.length > 0 ? selectedProtocols.map((protocol) => {
                      let price = 0;
                      if (typeof protocol.totalPrice === 'number') price = protocol.totalPrice;
                      else if (typeof protocol.totalPrice === 'string') price = parseFloat(protocol.totalPrice) || 0;
                      const isExpanded = expandedProtocolId === protocol.id;
                      const quantity = protocolQuantities[protocol.id] || 1;
                      return (
                        <React.Fragment key={protocol.id}>
                          <tr
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => setExpandedProtocolId(isExpanded ? null : protocol.id)}
                          >
                            <td className="p-2 font-medium flex items-center gap-2">
                              <span>{protocol.name}</span>
                              <span className="flex items-center gap-1 ml-2">
                                <button
                                  type="button"
                                  className="px-2 py-0.5 border rounded text-lg font-bold bg-muted hover:bg-accent"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setProtocolQuantities(q => ({ ...q, [protocol.id]: Math.max(1, (q[protocol.id] || 1) - 1) }));
                                  }}
                                >-</button>
                                <span className="w-6 text-center">{quantity}</span>
                                <button
                                  type="button"
                                  className="px-2 py-0.5 border rounded text-lg font-bold bg-muted hover:bg-accent"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setProtocolQuantities(q => ({ ...q, [protocol.id]: (q[protocol.id] || 1) + 1 }));
                                  }}
                                >+</button>
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">{isExpanded ? '▲' : '▼'}</span>
                            </td>
                            <td className="p-2">R$ {(price * quantity).toFixed(2)}</td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={2} className="bg-muted/30 p-2">
                                <div className="pl-4">
                                  <table className="w-full table-auto">
                                    <thead>
                                      <tr>
                                        <th className="p-1 text-left text-xs font-semibold">Serviço</th>
                                        <th className="p-1 text-left text-xs font-semibold">Nº Sessões</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(protocol.services && protocol.services.length > 0 ? protocol.services : (protocol.protocolServices || [])).map((ps, idx) => (
                                        <tr key={ps.id || idx}>
                                          <td className="p-1 text-xs">{ps.service?.name || ps.Service?.name || '-'}</td>
                                          <td className="p-1 text-xs">{ps.numberOfSessions || 1}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }) : (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-muted-foreground">Selecione um ou mais protocolos para ver os valores</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Totais e desconto visual igual ao exemplo */}
              <div className="flex flex-col items-end mt-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                  {/* Valor total */}
                  <span>
                    Valor total <span className="font-semibold text-foreground">R$ {selectedProtocols.reduce((acc, p) => {
                      let price = 0;
                      if (typeof p.totalPrice === 'number') price = p.totalPrice;
                      else if (typeof p.totalPrice === 'string') price = parseFloat(p.totalPrice) || 0;
                      const quantity = protocolQuantities[p.id] || 1;
                      return acc + price * quantity;
                    }, 0).toFixed(2)}</span>
                  </span>
                  {/* Desconto total */}
                  <span>
                    Desconto total <span className="font-semibold text-foreground">R$ {(() => {
                      const total = selectedProtocols.reduce((acc, p) => {
                        let price = 0;
                        if (typeof p.totalPrice === 'number') price = p.totalPrice;
                        else if (typeof p.totalPrice === 'string') price = parseFloat(p.totalPrice) || 0;
                        const quantity = protocolQuantities[p.id] || 1;
                        return acc + price * quantity;
                      }, 0);
                      return (total * (globalDiscount / 100)).toFixed(2);
                    })()} ({globalDiscount}%)</span>
                  </span>
                  {/* Separador visual */}
                  <span className="text-muted-foreground">|</span>
                  {/* Total final em azul com ícone de editar */}
                  <span>
                    Total <span className="font-semibold text-primary">R$ {(() => {
                      const total = selectedProtocols.reduce((acc, p) => {
                        let price = 0;
                        if (typeof p.totalPrice === 'number') price = p.totalPrice;
                        else if (typeof p.totalPrice === 'string') price = parseFloat(p.totalPrice) || 0;
                        const quantity = protocolQuantities[p.id] || 1;
                        return acc + price * quantity;
                      }, 0);
                      return (total * (1 - globalDiscount / 100)).toFixed(2);
                    })()}</span> <span className="inline-block align-middle text-primary cursor-pointer"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232a3 3 0 1 1 4.243 4.243L7.5 21H3v-4.5L15.232 5.232Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  </span>
                </div>
                {/* Campo de desconto adicional abaixo */}
                <div className="flex items-center gap-2 mt-2">
                  <span>Desconto adicional:</span>
                  <div className="flex items-center gap-1">
                    <Input
                      className="w-20"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={globalDiscount}
                      onChange={e => setGlobalDiscount(Number(e.target.value))}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar alterações</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="detalhes">
            <div className="space-y-4 max-w-xl">
              <div>
                <Label>Número</Label>
                <Input value={number} onChange={e => setNumber(e.target.value)} disabled readOnly />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={v => setStatus(v as InvoiceStatus)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="invoiced">Faturado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Notas</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="pagamento">
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={paymentForm.paymentType} onValueChange={v => setPaymentForm(f => ({ ...f, paymentType: v as PaymentType }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione">
                        {paymentForm.paymentType && (
                          <div className="flex items-center gap-2">
                            {paymentTypes.find(t => t.id === paymentForm.paymentType)?.icon}
                            <span>{paymentTypes.find(t => t.id === paymentForm.paymentType)?.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={paymentForm.totalValue}
                    onChange={e => {
                      const value = e.target.value;
                      setPaymentForm(f => ({
                        ...f,
                        totalValue: value,
                        installmentValue: f.installments && f.installments > 1 ? String(Number(value) / f.installments) : value
                      }));
                    }}
                  />
                </div>

                <div>
                  <Label>Data de Pagamento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm font-normal justify-start text-left"
                      >
                        {paymentForm.dueDate
                          ? format(new Date(paymentForm.dueDate), "dd/MM/yyyy")
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background text-foreground">
                      <Calendar
                        mode="single"
                        selected={paymentForm.dueDate ? new Date(paymentForm.dueDate) : undefined}
                        onSelect={date =>
                          setPaymentForm(f => ({
                            ...f,
                            dueDate: date ? format(date, "yyyy-MM-dd") : ""
                          }))
                        }
                        initialFocus
                        className="bg-background text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Campos específicos para cartão */}
                {paymentForm.paymentType === 'credit_card' && (
                  <>
                    <div>
                      <Label>Maquineta</Label>
                      <Select value={paymentForm.machineId} onValueChange={v => setPaymentForm(f => ({ ...f, machineId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {paymentMethods.filter(pm => pm.type === 'credit_card').map(pm => (
                            <SelectItem key={pm.id} value={pm.id}>{pm.machineName || pm.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bandeira</Label>
                      <Select value={paymentForm.cardBrand} onValueChange={v => setPaymentForm(f => ({ ...f, cardBrand: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {availableBrands.map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Parcelas</Label>
                      <Select
                        value={String(paymentForm.installments)}
                        onValueChange={v => {
                          const installments = Number(v);
                          setPaymentForm(f => ({
                            ...f,
                            installments,
                            installmentValue: f.totalValue ? String(Number(f.totalValue) / installments) : ''
                          }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(n => (
                            <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <Button type="button" onClick={handleAddPayment} className="w-full">
                Adicionar Pagamento
              </Button>

              {/* Lista de pagamentos adicionados */}
              <div className="mt-4">
                <Label>Pagamentos adicionados</Label>
                <div className="space-y-2 mt-2">
                  {payments.map((p, idx) => {
                    const method = paymentMethods.find(pm => pm.id === p.machineId);
                    const isCreditCard = method?.type === 'credit_card';
                    const paymentType = paymentTypes.find(pt => 
                      isCreditCard ? pt.id === 'credit_card' : pt.name === p.paymentMethodName
                    );
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-md bg-background">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {paymentType?.icon}
                            <span className="font-medium">{paymentType?.name || p.paymentMethodName}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Valor:</span>
                            <span className="ml-2 font-medium">R$ {Number(p.totalValue).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Data:</span>
                            <span className="ml-2">{format(new Date(p.dueDate), "dd/MM/yyyy")}</span>
                          </div>
                          {isCreditCard && (
                            <div className="col-span-2 md:col-span-1">
                              <span className="text-sm text-muted-foreground">Cartão:</span>
                              <span className="ml-2">{p.cardBrand} ({p.installments}x)</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemovePayment(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {payments.length > 0 && (
                  <div className="mt-4 text-right">
                    <span className="text-sm text-muted-foreground mr-2">Total dos Pagamentos:</span>
                    <span className="font-medium text-primary">
                      R$ {payments.reduce((sum, p) => sum + Number(p.totalValue), 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Resumo Financeiro */}
            <div className="mt-8 border-t pt-4">
              <h4 className="font-semibold mb-4">Resumo Financeiro</h4>
              {calcLoading ? (
                <div className="text-center py-4">Calculando...</div>
              ) : calcResult ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                    <div className="text-lg font-semibold">
                      R$ {Number(calcResult.subtotal).toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Desconto</div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-500">
                      - R$ {Number(calcResult.discount).toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total a Pagar</div>
                    <div className="text-lg font-semibold text-primary">
                      R$ {Number(calcResult.total).toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total dos Pagamentos</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-500">
                      R$ {Number(calcResult.totalReceived).toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Saldo Restante</div>
                    <div className="text-lg font-semibold text-destructive">
                      R$ {Math.max(Number(calcResult.total) - Number(calcResult.totalReceived), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-destructive">Erro ao calcular valores</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
};