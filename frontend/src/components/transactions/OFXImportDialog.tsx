import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ofxService } from "@/lib/api/services/ofxService";
import { OFXTransaction } from "@/lib/api/types/ofx";
import { api } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Transaction } from "@/lib/api/types/transaction";
import { transactionService } from "@/lib/api/services/transactionService";

interface Supplier {
  id: string;
  name: string;
  type?: string;
  category?: string;
  status?: 'active' | 'inactive';
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface DuplicateTransaction {
  transaction: OFXTransaction;
  existingTransactions: Transaction[];
}

interface OFXImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (transactions: OFXTransaction[]) => void;
}

export function OFXImportDialog({
  open,
  onOpenChange,
  onImport,
}: OFXImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<OFXTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateTransactions, setDuplicateTransactions] = useState<DuplicateTransaction[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersResponse, categoriesResponse] = await Promise.all([
          api.get<Supplier[]>('/suppliers'),
          api.get<Category[]>('/categories')
        ]);

        const unitSuppliers = suppliersResponse.data.filter(supplier => 
          (supplier.type === 'unidade' || supplier.category === 'unidade') && 
          supplier.status === 'active'
        );

        setSuppliers(unitSuppliers);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários',
          variant: 'destructive'
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, toast]);

  const checkForDuplicates = async (transactions: OFXTransaction[]): Promise<DuplicateTransaction[]> => {
    try {
      const duplicates: DuplicateTransaction[] = [];
      
      for (const transaction of transactions) {
        // Buscar transações existentes com a mesma descrição e valor
        const response = await api.get<{ transactions: Transaction[] }>('/transactions', {
          params: {
            search: transaction.description,
            amount: transaction.amount
          }
        });

        const existingTransactions = (response.data.transactions || []).filter((t) => {
          // Verifica se a descrição e o valor são similares
          const descriptionMatch = t.description.trim().toLowerCase() === transaction.description.trim().toLowerCase();
          const amountMatch = Math.abs(t.amount - transaction.amount) < 0.01; // Tolerância para diferenças de centavos
          return descriptionMatch && amountMatch;
        });

        if (existingTransactions.length > 0) {
          duplicates.push({ transaction, existingTransactions });
        }
      }

      return duplicates;
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return [];
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError(null);

    try {
      const content = await selectedFile.text();
      const parsedTransactions = await ofxService.parseOFX(content);
      setTransactions(parsedTransactions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao processar arquivo');
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o arquivo OFX',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionChange = (id: string, field: keyof OFXTransaction, value: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const updatedTransaction = { ...t, [field]: value };
        
        // Se mudou o tipo, limpa a categoria para forçar nova seleção
        if (field === 'type') {
          updatedTransaction.category = '';
        }
        
        return updatedTransaction;
      }
      return t;
    }));
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setDuplicateTransactions([]);
      setShowDuplicateAlert(false);
      const duplicates = await checkForDuplicates(transactions);
      
      if (duplicates.length > 0) {
        setDuplicateTransactions(duplicates);
        setShowDuplicateAlert(true);
        return;
      }

      // Converter OFXTransaction para Transaction e salvar usando o endpoint bulk
      const transactionsToSave = transactions.map(transaction => ({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        dueDate: parseDate(transaction.date),
        status: 'completed' as const,
        notes: `Importado via OFX - ${transaction.description}`,
        branch: transaction.branch,
        reference: transaction.id
      }));

      const result = await transactionService.createBulk(transactionsToSave);
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.count} transações foram importadas com sucesso.`,
        });
        onImport(transactions); // Recarrega a lista
        onOpenChange(false);
      } else {
        throw new Error('Falha ao salvar transações');
      }
    } catch (error) {
      console.error('[OFX IMPORT ERROR]', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível importar as transações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      
      // Converter OFXTransaction para Transaction e salvar usando o endpoint bulk
      const transactionsToSave = transactions.map(transaction => ({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        dueDate: parseDate(transaction.date),
        status: 'completed' as const,
        notes: `Importado via OFX - ${transaction.description}`,
        branch: transaction.branch,
        reference: transaction.id
      }));

      const result = await transactionService.createBulk(transactionsToSave);
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.count} transações foram importadas com sucesso.`,
        });
        onImport(transactions); // Recarrega a lista
        onOpenChange(false);
      } else {
        throw new Error('Falha ao salvar transações');
      }
    } catch (error) {
      console.error('[OFX IMPORT ERROR]', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível importar as transações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtra categorias baseado no tipo da transação
  // Função auxiliar para tratar datas de forma robusta
  const parseDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Se a data for inválida, usar a data atual
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch (error) {
      // Fallback para data atual se houver erro
      return new Date().toISOString();
    }
  };

  const getFilteredCategories = (type: string) => {
    return categories.filter(category => category.type === type);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] flex flex-col p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Importar Transações OFX</DialogTitle>
            <DialogDescription>
              Selecione um arquivo OFX para importar as transações. Você poderá classificar cada transação antes de importar.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="ofx-file">Arquivo OFX</Label>
              <Input
                id="ofx-file"
                type="file"
                accept=".ofx"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow className="border-b">
                      <TableHead className="w-[120px] font-semibold">Data</TableHead>
                      <TableHead className="min-w-[300px] font-semibold">Descrição</TableHead>
                      <TableHead className="w-[120px] font-semibold">Valor</TableHead>
                      <TableHead className="w-[120px] font-semibold">Tipo</TableHead>
                      <TableHead className="w-[200px] font-semibold">Filial</TableHead>
                      <TableHead className="w-[200px] font-semibold">Categoria</TableHead>
                      <TableHead className="w-[80px] font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id}
                        className={`border-b hover:bg-muted/50 ${
                          transaction.type === 'revenue' 
                            ? 'bg-green-950/20 hover:bg-green-950/30' 
                            : 'bg-red-950/20 hover:bg-red-950/30'
                        }`}
                      >
                        <TableCell className="whitespace-nowrap font-medium">
                          {transaction.date}
                        </TableCell>
                        <TableCell className="min-w-[300px]">
                          <div className="font-medium">{transaction.description}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`font-semibold ${
                            transaction.type === 'revenue' 
                              ? 'text-green-500 dark:text-green-400' 
                              : 'text-red-500 dark:text-red-400'
                          }`}>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.type}
                            onValueChange={(value) => handleTransactionChange(transaction.id, 'type', value)}
                          >
                            <SelectTrigger className={`w-[100px] ${
                              transaction.type === 'revenue' 
                                ? 'bg-green-950/30 text-green-400 border-green-800' 
                                : 'bg-red-950/30 text-red-400 border-red-800'
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="revenue" className="text-green-400">Receita</SelectItem>
                              <SelectItem value="expense" className="text-red-400">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.branch}
                            onValueChange={(value) => handleTransactionChange(transaction.id, 'branch', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Selecione a filial" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers
                                .filter((supplier) => supplier.category === "unidade")
                                .map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) => handleTransactionChange(transaction.id, 'category', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFilteredCategories(transaction.type).map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTransactions(prev => prev.filter(t => t.id !== transaction.id))}
                            className="bg-red-950/20 hover:bg-red-950/30 text-red-400 border-red-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-x"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={transactions.length === 0 || loading}
            >
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-500"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Transações Duplicadas Encontradas
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Foram encontradas {duplicateTransactions.length} transações que podem ser duplicadas.
              Revise os detalhes abaixo antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 max-h-[400px] overflow-y-auto pr-2 space-y-3">
            {duplicateTransactions.map(({ transaction, existingTransactions }) => (
              <div 
                key={transaction.id} 
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-base">{transaction.description}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(transaction.amount)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{transaction.type === 'revenue' ? 'Receita' : 'Despesa'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      {existingTransactions.length} {existingTransactions.length === 1 ? 'duplicata' : 'duplicatas'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <h5 className="text-sm font-medium mb-2">Transações similares encontradas:</h5>
                  <div className="space-y-2">
                    {existingTransactions.map((t) => (
                      <div 
                        key={t.id} 
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                      >
                        <span className="truncate flex-1">{t.description}</span>
                        <span className="font-medium ml-2">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AlertDialogFooter className="mt-6 pt-4 border-t">
            <AlertDialogCancel className="bg-destructive/10 text-destructive hover:bg-destructive/20">
              Cancelar Importação
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmImport}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continuar Importação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 