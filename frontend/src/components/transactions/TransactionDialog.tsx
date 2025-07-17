import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from "@/lib/api/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
import { supplierApi } from "@/lib/api/services/supplier";
import { patientApi } from "@/lib/api/services/patient";
import { userApi } from "@/lib/api/services/user";
import { Checkbox } from "@/components/ui/checkbox";
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from "@/lib/api/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b

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
<<<<<<< HEAD
  onSubmit: (transaction: Partial<Transaction> & { costCenter?: string }) => void;
=======
  onSubmit: (transaction: Partial<Transaction>) => void;
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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
<<<<<<< HEAD
  const [costCenters, setCostCenters] = useState<Supplier[]>([]);
  const [costCenter, setCostCenter] = useState("");
  const [boletoFile, setBoletoFile] = useState<File | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [competence, setCompetence] = useState("");
=======
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
<<<<<<< HEAD
        const response = await api.get<Supplier[]>("/suppliers");
        const unitSuppliers = response.data.filter(
          (supplier) =>
            (supplier.type === "unidade" || supplier.category === "unidade") &&
            supplier.status === "active"
        );
        setSuppliers(unitSuppliers);
        // Buscar centro de custo
        const costCenterSuppliers = response.data.filter(
          (supplier) => supplier.category === "centro de custo" && supplier.status === "active"
        );
        setCostCenters(costCenterSuppliers);
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
=======
        const response = await api.get<Supplier[]>('/suppliers');
        const unitSuppliers = response.data.filter(supplier => 
          (supplier.type === 'unidade' || supplier.category === 'unidade') && 
          supplier.status === 'active'
        );
        setSuppliers(unitSuppliers);
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
      }
    };

    if (open) {
      fetchSuppliers();
    }
  }, [open]);

<<<<<<< HEAD
  // Buscar pacientes e usuários quando for receita
  useEffect(() => {
    if (open && formData.type === "revenue") {
      patientApi.getPatients().then(setPatients).catch(() => setPatients([]));
      userApi.list().then(setUsers).catch(() => setUsers([]));
    }
  }, [open, formData.type]);

=======
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        branch: transaction.branch || "",
      });
<<<<<<< HEAD
      setCostCenter((transaction as { costCenter?: string }).costCenter || "");
      // Inicializa competência com o mês/ano do dueDate da transação
      if (transaction.dueDate) {
        setCompetence(`${String(new Date(transaction.dueDate).getMonth() + 1).padStart(2, '0')}/${new Date(transaction.dueDate).getFullYear()}`);
      } else {
        setCompetence("");
      }
=======

>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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
<<<<<<< HEAD
      setCostCenter("");
      // Inicializa competência com o mês/ano do dueDate padrão
      setCompetence(`${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`);
=======
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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
<<<<<<< HEAD
=======
        console.log('Criando transação com data:', transaction.dueDate);
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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
        
<<<<<<< HEAD
=======
        console.log('Criando parcela com data:', transaction.dueDate);
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
        transactions.push(transaction);
      }
      
      transactions.forEach(transaction => onSubmit(transaction));
      
      // Fechar o diálogo após criar todas as parcelas
      onOpenChange(false);
    } else {
<<<<<<< HEAD
      onSubmit({ ...formData, costCenter, competence });
=======
      onSubmit(formData);
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
      onOpenChange(false);
    }
  };

  const handleChange = (
<<<<<<< HEAD
    field: keyof Transaction | 'costCenter',
=======
    field: keyof Transaction,
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
    value: string | number | TransactionType | TransactionStatus | PaymentMethod
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

<<<<<<< HEAD
  const meses = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];
  const anoAtual = new Date().getFullYear();
  const anos = useMemo(() => Array.from({ length: 11 }, (_, i) => anoAtual - 5 + i), [anoAtual]);
  // Estado separado para mês e ano
  const [mesCompetencia, setMesCompetencia] = useState(() => competence ? competence.split("/")[0] : String(new Date().getMonth() + 1).padStart(2, '0'));
  const [anoCompetencia, setAnoCompetencia] = useState(() => competence ? competence.split("/")[1] : String(new Date().getFullYear()));
  // Atualiza competence sempre que mês ou ano mudar
  useEffect(() => {
    setCompetence(`${mesCompetencia}/${anoCompetencia}`);
  }, [mesCompetencia, anoCompetencia]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] min-w-[300px] max-h-[90vh] overflow-y-auto overflow-x-auto box-border">
=======
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) => handleChange("type", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">{formData.type === "revenue" ? "Recebido de" : "Pago a"}</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => handleChange("branch", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === "revenue"
                    ? ([
                        <SelectGroup key="pacientes-group">
                          <SelectLabel>Pacientes</SelectLabel>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="py-2"><span className="pl-8 block">{p.name}</span></SelectItem>
                          ))}
                        </SelectGroup>,
                        <SelectGroup key="funcionarios-group">
                          <SelectLabel>Funcionários</SelectLabel>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="py-2"><span className="pl-8 block">{u.name}</span></SelectItem>
                          ))}
                        </SelectGroup>
                      ])
                    : suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número do documento</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber || ""}
                onChange={(e) => handleChange("documentNumber", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competencia">Competência</Label>
              <div className="flex gap-2">
                <Select value={mesCompetencia} onValueChange={setMesCompetencia}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={anoCompetencia} onValueChange={setAnoCompetencia}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((a) => (
                      <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
=======
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
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
=======
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
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
<<<<<<< HEAD
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
=======
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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
<<<<<<< HEAD
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
=======

            <div className="space-y-2">
              <Label htmlFor="branch">Filial/Unidade</Label>
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
              <Select
                value={formData.branch}
                onValueChange={(value) => handleChange("branch", value)}
              >
<<<<<<< HEAD
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
=======
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a filial" />
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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
<<<<<<< HEAD
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costCenter">Centro de custo</Label>
              <Select
                value={costCenter}
                onValueChange={setCostCenter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
                className="w-full"
=======

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                required
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
              />
            </div>
          </div>

<<<<<<< HEAD
          <div className="space-y-2">
            <Label htmlFor="boletoNumber">Código do Boleto</Label>
            <Input
              id="boletoNumber"
              value={formData.boletoNumber || ""}
              onChange={(e) => handleChange("boletoNumber", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="boletoFile">Anexe aqui o boleto deste pagamento</Label>
            <Input
              id="boletoFile"
              type="file"
              accept="application/pdf"
              onChange={(e) => setBoletoFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          {/* Recorrente, Parcelado, Salvar e continuar inserindo */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="repetir"
                checked={recurrenceType === "recurring"}
                onCheckedChange={(checked) => setRecurrenceType(checked ? "recurring" : "none")}
              />
              <Label htmlFor="repetir">Repetir</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="parcelar"
                checked={recurrenceType === "installment"}
                onCheckedChange={(checked) => setRecurrenceType(checked ? "installment" : "none")}
              />
              <Label htmlFor="parcelar">Parcelar</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="salvarContinuar" />
              <Label htmlFor="salvarContinuar">Salvar e continuar inserindo</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
=======
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
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 