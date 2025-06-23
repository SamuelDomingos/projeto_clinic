import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from "@/lib/api/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";

type RecurrenceType = 'none' | 'recurring' | 'installment';
type RecurrenceMode = 'indeterminate' | 'quantity';

interface Supplier {
  id: string;
  name: string;
  type?: string;
  category?: string;
  status?: 'active' | 'inactive';
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSubmit: (transaction: Partial<Transaction>) => void;
  categories: { id: string; name: string; type: TransactionType }[];
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  categories,
}: TransactionDialogProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: "revenue",
    status: "pending",
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    description: "",
    category: "",
    notes: "",
    branch: "",
  });

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceMode, setRecurrenceMode] = useState<RecurrenceMode>('indeterminate');
  const [recurrenceQuantity, setRecurrenceQuantity] = useState(12);
  const [installments, setInstallments] = useState(1);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get<Supplier[]>('/suppliers');
        const unitSuppliers = response.data.filter(supplier => 
          (supplier.type === 'unidade' || supplier.category === 'unidade') && 
          supplier.status === 'active'
        );
        setSuppliers(unitSuppliers);
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
      }
    };

    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        branch: transaction.branch || "",
      });

      // Detectar se é recorrente ou parcelada
      if (transaction.reference) {
        if (transaction.installments && transaction.installments > 1) {
          setRecurrenceType('installment');
          setInstallments(transaction.installments);
        } else {
          setRecurrenceType('recurring');
          setRecurrenceMode('indeterminate');
        }
      } else {
        setRecurrenceType('none');
      }
    } else {
      setFormData({
        type: "revenue",
        status: "pending",
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        description: "",
        category: "",
        notes: "",
        branch: "",
      });
      setRecurrenceType('none');
      setInstallments(1);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gerar reference único para transações recorrentes/parceladas
    const reference = recurrenceType !== 'none' ? `ref_${Date.now()}` : undefined;
    
    // Se for recorrente ou parcelado, criar múltiplas transações
    if (recurrenceType === 'recurring') {
      const transactions = [];
      const startDate = new Date(formData.dueDate || '');
      const quantity = recurrenceMode === 'indeterminate' ? 12 : recurrenceQuantity;
      
      // Criar uma cópia da data inicial para não modificar a original
      let currentDate = new Date(startDate);
      
      // Criar transações para cada mês
      for (let i = 0; i < quantity; i++) {
        // Criar uma nova transação com a data atual
        const transaction = {
          ...formData,
          branch: formData.branch || '',
          dueDate: currentDate.toISOString().split('T')[0],
          reference,
        };
        
        // Adicionar à lista de transações
        transactions.push(transaction);
        
        // Avançar para o próximo mês
        const nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        currentDate = nextDate;
      }
      
      // Enviar cada transação individualmente
      transactions.forEach(transaction => {
        console.log('Criando transação com data:', transaction.dueDate);
        onSubmit(transaction);
      });
      
      // Fechar o diálogo após criar todas as transações
      onOpenChange(false);
    } else if (recurrenceType === 'installment' && installments > 1) {
      const transactions = [];
      const startDate = new Date(formData.dueDate || '');
      const installmentAmount = (formData.amount || 0) / installments;
      
      for (let i = 0; i < installments; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        
        const transaction = {
          ...formData,
          branch: formData.branch || '',
          amount: installmentAmount,
          dueDate: date.toISOString().split('T')[0],
          description: `${formData.description} (${i + 1}/${installments})`,
          reference,
          installments,
          installmentNumber: i + 1,
        };
        
        console.log('Criando parcela com data:', transaction.dueDate);
        transactions.push(transaction);
      }
      
      transactions.forEach(transaction => onSubmit(transaction));
      
      // Fechar o diálogo após criar todas as parcelas
      onOpenChange(false);
    } else {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  const handleChange = (
    field: keyof Transaction,
    value: string | number | TransactionType | TransactionStatus | PaymentMethod
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TransactionType) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                  required
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Filial/Unidade</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => handleChange("branch", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recorrente</Label>
                  <p className="text-sm text-muted-foreground">
                    Repetir mensalmente
                  </p>
                </div>
                <Switch
                  checked={recurrenceType === 'recurring'}
                  onCheckedChange={(checked) => {
                    setRecurrenceType(checked ? 'recurring' : 'none');
                    if (checked) {
                      handleChange("type", "expense");
                    }
                  }}
                />
              </div>

              {recurrenceType === 'recurring' && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Tipo de Recorrência</Label>
                    <RadioGroup
                      value={recurrenceMode}
                      onValueChange={(value: RecurrenceMode) => setRecurrenceMode(value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="indeterminate" id="indeterminate" />
                        <Label htmlFor="indeterminate" className="text-sm">Indeterminado (12 meses)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quantity" id="quantity" />
                        <Label htmlFor="quantity" className="text-sm">Quantidade</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {recurrenceMode === 'quantity' && (
                    <div className="space-y-2">
                      <Label htmlFor="recurrenceQuantity" className="text-sm">Quantidade de Meses</Label>
                      <Input
                        id="recurrenceQuantity"
                        type="number"
                        min="1"
                        max="60"
                        value={recurrenceQuantity}
                        onChange={(e) => setRecurrenceQuantity(parseInt(e.target.value))}
                        required
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Parcelado</Label>
                  <p className="text-sm text-muted-foreground">
                    Dividir em parcelas
                  </p>
                </div>
                <Switch
                  checked={recurrenceType === 'installment'}
                  onCheckedChange={(checked) => {
                    setRecurrenceType(checked ? 'installment' : 'none');
                    if (checked) {
                      handleChange("type", "expense");
                    }
                    if (!checked) setInstallments(1);
                  }}
                />
              </div>

              {recurrenceType === 'installment' && (
                <div className="mt-4">
                  <Label htmlFor="installments" className="text-sm">Número de Parcelas</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="48"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value))}
                      required
                      className="w-24"
                    />
                    {installments > 1 && (
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency((formData.amount || 0) / installments)} / parcela
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 