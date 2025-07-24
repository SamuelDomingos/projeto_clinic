import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { FinancialSummary } from "@/components/transactions/FinancialSummary";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { OFXImportDialog } from "@/components/transactions/OFXImportDialog";
import {
  Transaction,
  TransactionCategory,
  TransactionFilters as TransactionFiltersType,
  TransactionSummary,
  TransactionType,
} from "@/lib/api/types/transaction";
import { transactionService } from "@/lib/api/services/transactionService";
import { categoryService } from "@/lib/api/services/categoryService";
import { supplierApi } from "@/lib/api/services/supplier";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionListItem extends Omit<Transaction, 'id'> {
  id: string;
  categoryName: string;
  paymentMethodName: string;
  paymentMethodType: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    revenue: 0,
    expenses: 0,
    balance: 0,
    pendingRevenue: 0,
    pendingExpenses: 0,
    pendingBalance: 0,
    totalFees: 0,
  });
  const [filters, setFilters] = useState<TransactionFiltersType>({
    page: 1,
    limit: 10,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Inicializa o filtro de data com o mês e ano atual
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const [dateFilter, setDateFilter] = useState(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`);
  
  const [loading, setLoading] = useState(true);
  const [showOFXImport, setShowOFXImport] = useState(false);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [bankAccounts, setBankAccounts] = useState([]);

  // Buscar contas bancárias (fornecedores com categoria 'conta bancaria')
  const loadBankAccounts = useCallback(async () => {
    try {
      const accounts = await supplierApi.getSuppliers({ category: 'conta' });
      setBankAccounts(accounts);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as contas bancárias',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAll();
      if (response && response.data) {
        const transactionCategories: TransactionCategory[] = response.data.map(category => ({
          id: category.id,
          name: category.name,
          type: category.type as TransactionType,
          classification: 'other'
        }));
        setCategories(transactionCategories);
        const map: Record<string, string> = {};
        transactionCategories.forEach(category => {
          map[category.id] = category.name;
        });
        setCategoryMap(map);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionService.getAll(filters);
      if (response && response.transactions) {
        const transactionsWithNames: TransactionListItem[] = response.transactions.map((transaction) => ({
          ...transaction,
          id: String(transaction.id),
          categoryName: categoryMap[transaction.category] || "Categoria não encontrada",
          paymentMethodName: transaction.paymentMethod || "Método de pagamento não encontrado",
          paymentMethodType: transaction.paymentMethod || "Tipo de método de pagamento não encontrado"
        }));
        setTransactions(transactionsWithNames);
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, categoryMap, toast]);

  const loadSummary = useCallback(async () => {
    try {
      // Usar o novo endpoint de resumo do servidor
      const summary = await transactionService.getSummary();
      setSummary(summary);
    } catch (error) {
      console.error("Erro ao carregar resumo:", error);
      // Fallback para cálculo local se o endpoint falhar
      if (transactions.length > 0) {
        const localSummary = transactionService.calculateSummaryFromList(transactions);
        setSummary(localSummary);
      }
    }
  }, [transactions]);

  useEffect(() => {
    loadCategories();
    loadBankAccounts();
  }, [loadCategories, loadBankAccounts]);

  useEffect(() => {
    if (categories.length > 0) {
      loadTransactions();
    }
  }, [loadTransactions, categories]);

  useEffect(() => {
    if (transactions.length > 0) {
      loadSummary();
    }
  }, [loadSummary, transactions]);

  const handleCreateTransaction = async (transaction: Partial<Transaction> & { costCenter?: string; competence?: string; unit?: string }, file?: File) => {
    console.log('=== HANDLE CREATE TRANSACTION ===');
    console.log('Transaction recebida:', transaction);
    console.log('File recebido:', file);
    
    try {
      // Criar objeto limpo apenas com campos que o backend reconhece
      const newTransaction: Omit<Transaction, "id" | "createdAt" | "updatedAt"> = {
        type: transaction.type || "revenue",
        description: transaction.description || "",
        amount: transaction.amount || 0,
        dueDate: transaction.dueDate || new Date().toISOString(),
        category: transaction.category || "",
        paymentMethod: transaction.paymentMethod,
        notes: transaction.notes,
        status: transaction.status || "pending",
        branch: transaction.branch,
        documentNumber: transaction.documentNumber,
        boletoNumber: transaction.boletoNumber || "", // Garantir que sempre tenha um valor
        reference: transaction.reference,
        installments: transaction.installments,
        installmentNumber: transaction.installmentNumber
      };
      
      console.log('newTransaction criada:', newTransaction);
      
      // Remover campos undefined para evitar problemas
      Object.keys(newTransaction).forEach(key => {
        if (newTransaction[key] === undefined) {
          console.log(`Removendo campo undefined: ${key}`);
          delete newTransaction[key];
        }
      });
      
      console.log('newTransaction após limpeza:', newTransaction);
      console.log('Chamando transactionService.create...');
    
      await transactionService.create(newTransaction, file);
      
      console.log('Transação criada com sucesso!');
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso.",
      });
      setIsDialogOpen(false);
      loadTransactions();
      loadSummary();
    } catch (error) {
      console.error('=== ERRO EM HANDLE CREATE TRANSACTION ===');
      console.error("Erro ao criar transação:", error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transações</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowOFXImport(true)}>
            Importar OFX
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      <FinancialSummary summary={summary} />

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        categories={categories}
      />

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          dateFilter={dateFilter}
          onEdit={(transaction) => {
            setSelectedTransaction({
              ...transaction,
              id: String(transaction.id),
            } as Transaction);
            setIsDialogOpen(true);
          }}
          onDelete={async (transaction) => {
            const isRecorrenteOuParcelada = /\(\d+\/\d+\)/.test(transaction.description);
            if (isRecorrenteOuParcelada) {
              const escolha = window.confirm('Clique em OK para deletar só esta transação. Clique em Cancelar para deletar todas as recorrências/parcelas.');
              if (escolha) {
                // Deleta só esta
                const id = typeof transaction.id === 'string' ? transaction.id.replace(/\D/g, '') : transaction.id;
                await transactionService.delete(Number(id));
              } else {
                // Deleta todas usando o novo endpoint
                const id = typeof transaction.id === 'string' ? transaction.id.replace(/\D/g, '') : transaction.id;
                await transactionService.delete(Number(id), true);
              }
            } else {
              if (window.confirm('Tem certeza que deseja deletar esta transação?')) {
                const id = typeof transaction.id === 'string' ? transaction.id.replace(/\D/g, '') : transaction.id;
                await transactionService.delete(Number(id));
              }
            }
            loadTransactions();
          }}
          bankAccounts={bankAccounts}
        />
      )}

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateTransaction}
        categories={categories}
        transaction={selectedTransaction}
      />

      <OFXImportDialog
        open={showOFXImport}
        onOpenChange={setShowOFXImport}
        onImport={async (importedTransactions) => {
          // Aqui você pode salvar as transações importadas no backend
          // Exemplo: await transactionService.bulkCreate(importedTransactions);
          // Por enquanto, só recarrega a lista
          loadTransactions();
        }}
      />
    </div>
  );
}
