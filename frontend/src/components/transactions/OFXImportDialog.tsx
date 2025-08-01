import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ofxService } from "@/lib/api/services/ofxService";
import { OFXTransaction } from "@/lib/api/types/ofx";
import { api } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Transaction } from "@/lib/api/types/transaction";
import { transactionService } from "@/lib/api/services/transactionService";

interface DuplicateTransaction {
  transaction: OFXTransaction;
  existingTransactions: Transaction[];
}

// Estender o tipo OFXTransaction para incluir campos editáveis
interface ExtendedOFXTransaction extends OFXTransaction {
  paymentMethod?: string;
  paidViaId?: string; // Corrigir: usar paidViaId em vez de bankAccount
  paymentDate?: string;
}

interface OFXImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (transactions: OFXTransaction[]) => void;
  bankAccounts: Array<{ id: string; name: string }>;
}

export function OFXImportDialog({
  open,
  onOpenChange,
  onImport,
  bankAccounts,
}: OFXImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<ExtendedOFXTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateTransactions, setDuplicateTransactions] = useState<DuplicateTransaction[]>([]);
  
  // Estados para dados da baixa
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paidVia, setPaidVia] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  // Função para manipular mudanças nas transações
  const handleTransactionChange = (transactionId: string, field: string, value: string) => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
          : t
      )
    );
  };

  // Função universal para formatação de valores
  const formatCurrencyInput = (value: string): number => {
    if (!value) return 0;
    
    // Remove espaços e caracteres não numéricos exceto vírgula, ponto e hífen
    let cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Se contém vírgula, trata como separador decimal brasileiro
    if (cleanValue.includes(',')) {
      // Remove pontos (milhares) e substitui vírgula por ponto
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    }
    
    const numericValue = parseFloat(cleanValue) || 0;
    return numericValue;
  };

  // Função para aplicar valor em massa
  const applyToAll = (field: string, value: string) => {
    setTransactions(prev => 
      prev.map(t => ({ 
        ...t, 
        [field]: field === 'amount' ? formatCurrencyInput(value) : value 
      }))
    );
  };

  const checkForDuplicates = async (transactions: OFXTransaction[]): Promise<DuplicateTransaction[]> => {
    try {
      const duplicates: DuplicateTransaction[] = [];
      
      for (const transaction of transactions) {
        console.log('🔍 Verificando transação OFX:', {
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date
        });
        
        // Validar se a data é válida antes de usar
        if (!transaction.date) {
          console.warn('⚠️ Transaction without date:', transaction);
          continue;
        }
        
        // Criar data de forma segura
        const transactionDate = new Date(transaction.date.split('/').reverse().join('-')); // DD/MM/YYYY -> YYYY-MM-DD
        if (isNaN(transactionDate.getTime())) {
          console.warn('⚠️ Invalid transaction date:', transaction.date);
          continue;
        }
        
        // Extrair competência (MM/YYYY) da data da transação OFX
        const ofxCompetence = `${String(transactionDate.getMonth() + 1).padStart(2, '0')}/${transactionDate.getFullYear()}`;
        console.log('📅 Competência OFX calculada:', ofxCompetence);
        
        // Buscar por descrição similar e valor exato
        const response = await api.get<{ transactions: Transaction[] }>('/transactions', {
          params: {
            search: transaction.description.trim(),
            limit: 100
          }
        });
        
        console.log('🔎 Transações encontradas na busca:', response.data.transactions?.length || 0);
    
        const existingTransactions = (response.data.transactions || []).filter((t) => {
          console.log('🔍 Comparando com transação do sistema:', {
            id: t.id,
            description: t.description,
            amount: t.amount,
            status: t.status,
            competence: t.competence,
            dueDate: t.dueDate
          });
          
          // Verificação mais flexível de descrição
          const descriptionMatch = t.description.trim().toLowerCase().includes(
            transaction.description.trim().toLowerCase()
          ) || transaction.description.trim().toLowerCase().includes(
            t.description.trim().toLowerCase()
          );
          console.log('🔍 Descrição match:', descriptionMatch);
          
          // Valor deve ser exato (diferença menor que 1 centavo)
          // Converter valor do sistema para número se for string
          const systemAmount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
          const amountMatch = Math.abs(systemAmount - transaction.amount) < 0.01;
          console.log('💰 Valor match:', amountMatch, `(Sistema: ${systemAmount}, OFX: ${transaction.amount})`);
        
          // Deve estar pendente
          const pendingMatch = t.status === 'pending';
          console.log('⏳ Status pendente match:', pendingMatch);
          
          // Verificação de competência mais flexível
          let competenceMatch = false;
          
          // Primeiro, tentar match exato com competence
          if (t.competence === ofxCompetence) {
            competenceMatch = true;
            console.log('📅 Competência match exato:', competenceMatch);
          } else if (t.dueDate) {
            // Se não houver match exato, verificar se dueDate está no mesmo mês/ano do OFX
            const dueDate = new Date(t.dueDate);
            if (!isNaN(dueDate.getTime())) {
              const systemCompetence = `${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`;
              competenceMatch = systemCompetence === ofxCompetence;
              console.log('📅 Competência match por dueDate:', competenceMatch, `(Sistema: ${systemCompetence}, OFX: ${ofxCompetence})`);
            }
          }
          
          const finalMatch = descriptionMatch && amountMatch && pendingMatch && competenceMatch;
          console.log('✅ Match final:', finalMatch);
          
          return finalMatch;
        });
        
        if (existingTransactions.length > 0) {
          console.log('🎯 Transação OFX corresponde a transações do sistema:', existingTransactions.map(t => t.id));
          duplicates.push({ transaction, existingTransactions });
        } else {
          console.log('❌ Nenhuma correspondência encontrada para a transação OFX');
        }
      }
      
      return duplicates;
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return [];
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      // Ler o conteúdo do arquivo como texto
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Erro ao ler arquivo'));
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(selectedFile, 'utf-8');
      });

      // Agora passar o conteúdo como string para o parseOFX
      const parsedTransactions = await ofxService.parseOFX(fileContent);
      setTransactions(parsedTransactions);
      toast({
        title: "Sucesso!",
        description: `${parsedTransactions.length} transações carregadas do arquivo OFX.`,
      });
    } catch (error) {
      console.error('Erro ao processar arquivo OFX:', error);
      setError('Erro ao processar arquivo OFX. Verifique se o arquivo está correto.');
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo OFX. Verifique se o arquivo está correto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (transactions.length === 0) return;

    setLoading(true);
    try {
      // Verificar duplicatas
      const duplicates = await checkForDuplicates(transactions);
      
      if (duplicates.length > 0) {
        setDuplicateTransactions(duplicates);
        setShowDuplicateAlert(true);
      } else {
        toast({
          title: "Informação",
          description: "Nenhuma transação pendente correspondente foi encontrada.",
        });
      }
    } catch (error) {
      console.error('Erro ao importar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao importar transações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      
      // Primeiro, fazer a conciliação básica com a API específica
      const conciliationData = duplicateTransactions.map(({ transaction, existingTransactions }) => {
        const updatedTransaction = transactions.find(t => t.id === transaction.id);
        
        return {
          transactionId: existingTransactions[0].id,
          paidAt: updatedTransaction?.paymentDate || transaction.date,
          reference: `OFX: ${transaction.description}`,
          ofxAmount: updatedTransaction?.amount || transaction.amount
        };
      });
      
      console.log('📤 Dados de conciliação básica:', conciliationData);
      
      // Fazer a conciliação básica
      await transactionService.conciliateOFXBulk(conciliationData);
      
      // Depois, atualizar cada transação com os dados completos usando os campos corretos
      for (const { transaction, existingTransactions } of duplicateTransactions) {
        const updatedTransaction = transactions.find(t => t.id === transaction.id);
        
        if (updatedTransaction) {
          try {
            const updateData: Partial<Transaction> = {}; // Usar tipo específico em vez de any
            
            // Usar os campos corretos da entidade Transaction
            if (updatedTransaction.paymentMethod) {
              updateData.paymentMethod = updatedTransaction.paymentMethod;
            }
            
            if (updatedTransaction.paidViaId) {
              updateData.paidViaId = updatedTransaction.paidViaId; // Campo correto é paidViaId
            }
            
            if (updatedTransaction.amount !== transaction.amount) {
              updateData.payableAmount = updatedTransaction.amount.toString(); // Corrigido: usar payableAmount
            }
            
            if (updatedTransaction.paymentDate) {
              updateData.paidAt = new Date(updatedTransaction.paymentDate).toISOString();
            }
            
            // Atualizar notas com informações do OFX
            const ofxInfo = [];
            if (updatedTransaction.paymentMethod) ofxInfo.push(`Método: ${updatedTransaction.paymentMethod}`);
            if (updatedTransaction.paidViaId) { // Corrigir: usar paidViaId
              const accountName = bankAccounts?.find(acc => acc.id === updatedTransaction.paidViaId)?.name || updatedTransaction.paidViaId;
              ofxInfo.push(`Conta: ${accountName}`);
            }
            // Sempre enviar o valor pago, não apenas quando diferente
            if (updatedTransaction.amount) {
              updateData.payableAmount = updatedTransaction.amount.toString(); // Corrigido: usar payableAmount
              ofxInfo.push(`Valor Pago: R$ ${updatedTransaction.amount.toFixed(2).replace('.', ',')}`);
            }
            
            if (ofxInfo.length > 0) {
              updateData.notes = `${existingTransactions[0].notes || ''} - Dados OFX: ${ofxInfo.join(', ')}`;
            }
            
            console.log(`📝 Atualizando transação ${existingTransactions[0].id} com:`, updateData);
            
            // Atualizar a transação com os dados corretos
            await transactionService.update(existingTransactions[0].id, updateData);
            
            console.log(`✅ Transação ${existingTransactions[0].id} atualizada com sucesso`);
          } catch (error) {
            console.warn(`⚠️ Erro ao atualizar dados extras da transação ${existingTransactions[0].id}:`, error);
          }
        }
      }
      
      toast({
        title: "Sucesso!",
        description: `${duplicateTransactions.length} transações foram conciliadas e baixadas com todos os dados preenchidos.`,
      });
      
      onImport([]);
      onOpenChange(false);
      setShowDuplicateAlert(false);
      
      // Limpar campos
      setTransactions([]);
      setDuplicateTransactions([]);
      
    } catch (error) {
      console.error('Erro ao conciliar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao conciliar transações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] flex flex-col p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Conciliar Transações OFX</DialogTitle>
            <DialogDescription>
              Selecione um arquivo OFX para dar baixa em transações pendentes. O sistema irá comparar por descrição, valor e competência.
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
              <>
                <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow className="border-b py-6">
                      <TableHead className="w-[100px] py-6 text-xs">Data OFX</TableHead>
                      <TableHead className="min-w-[250px] py-2 text-xs">Descrição</TableHead>
                      <TableHead className="w-[120px] text-xs text-right py-2">Valor OFX</TableHead>
                      <TableHead className="w-[120px] text-xs text-center py-2">Valor Pago</TableHead>
                      <TableHead className="w-[130px] text-xs text-center py-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-left">Data Pagamento</span>
                          <Input
                            type="date"
                            placeholder="Aplicar a todos"
                            className="h-6 text-xs"
                            onChange={(e) => {
                              if (e.target.value) {
                                applyToAll('paymentDate', e.target.value);
                              }
                            }}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px] text-xs py-2">Tipo</TableHead>
                      <TableHead className="w-[120px] text-xs py-2">
                        <div className="flex flex-col gap-1">
                          <span>Método</span>
                          <Select onValueChange={(value) => applyToAll('paymentMethod', value)}>
                            <SelectTrigger className="h-6 text-xs">
                              <SelectValue placeholder="Aplicar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="transfer">Transferência</SelectItem>
                              <SelectItem value="debit">Débito</SelectItem>
                              <SelectItem value="credit">Crédito</SelectItem>
                              <SelectItem value="cash">Dinheiro</SelectItem>
                              <SelectItem value="check">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[140px] text-xs">
                        <div className="flex flex-col gap-1">
                          <span>Conta</span>
                          <Select onValueChange={(value) => applyToAll('paidViaId', value)}>
                            <SelectTrigger className="h-6 text-xs">
                              <SelectValue placeholder="Aplicar" />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[60px] text-xs text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => {
                            setTransactions(prev => 
                              prev.map(t => ({ 
                                ...t, 
                                paymentDate: '',
                                paymentMethod: '',
                                paidViaId: ''
                              }))
                            );
                          }}
                        >
                          Limpar
                        </Button>
                      </TableHead>
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
                        <TableCell className="text-xs font-medium py-3 px-2">
                          {transaction.date}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3 px-2" title={transaction.description}>
                          <div className="max-w-[180px]">
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3 px-2">
                          <div className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded text-right">
                            R$ {transaction.amount.toFixed(2).replace('.', ',')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3 px-2">
                          <Input
                            type="text"
                            value={transaction.amount.toFixed(2).replace('.', ',')}
                            onChange={(e) => {
                              const formattedValue = formatCurrencyInput(e.target.value);
                              handleTransactionChange(transaction.id, 'amount', formattedValue.toString());
                            }}
                            className="w-full text-xs text-center font-mono h-7 px-2"
                            placeholder="0,00"
                          />
                        </TableCell>
                        <TableCell className="w-[10px] text-center py-2">
                          <Input
                            type="date"
                            value={transaction.paymentDate || ''}
                            onChange={(e) => handleTransactionChange(transaction.id, 'paymentDate', e.target.value)}
                            className="w-full text-xs h-7 px-2"
                          />
                        </TableCell>
                        <TableCell className="py-3 px-2">
                          <Select
                            value={transaction.type}
                            onValueChange={(value) => handleTransactionChange(transaction.id, 'type', value)}
                          >
                            <SelectTrigger className={`w-full h-7 text-xs px-2 ${
                              transaction.type === 'revenue' 
                                ? 'bg-green-950/30 text-green-400 border-green-800' 
                                : 'bg-red-950/30 text-red-400 border-red-800'
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="revenue" className="text-green-400 text-xs">Receita</SelectItem>
                              <SelectItem value="expense" className="text-red-400 text-xs">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-3 px-2">
                          <Select
                            value={transaction.paymentMethod || ''}
                            onValueChange={(value) => handleTransactionChange(transaction.id, 'paymentMethod', value)}
                          >
                            <SelectTrigger className="w-full h-7 text-xs px-2">
                              <SelectValue placeholder="Método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="transfer">Transfer</SelectItem>
                              <SelectItem value="debit">Débito</SelectItem>
                              <SelectItem value="credit">Crédito</SelectItem>
                              <SelectItem value="cash">Dinheiro</SelectItem>
                              <SelectItem value="check">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-3 px-2">
                          <Select
                            value={transaction.paidViaId || ''}
                            onValueChange={(value) => handleTransactionChange(transaction.id, 'paidViaId', value)}
                          >
                            <SelectTrigger className="w-full h-7 text-xs px-2">
                              <SelectValue placeholder="Conta" />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id} className="text-xs">
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setTransactions(prev => 
                                prev.filter(t => t.id !== transaction.id)
                              );
                            }}
                            title="Remover transação"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </>
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
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <svg className="text-green-500" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Dar Baixa em Transações
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Foram encontradas {duplicateTransactions.length} transações pendentes que serão pagas com o OFX.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Campos de baixa */}
          <div className="space-y-4">
            {/* Lista de transações que serão baixadas */}
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="text-sm">Descrição</TableHead>
                    <TableHead className="text-right text-sm">Valor Sistema</TableHead>
                    <TableHead className="text-right text-sm">Valor OFX</TableHead>
                    <TableHead className="text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicateTransactions.map(({ transaction, existingTransactions }, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm py-3">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right text-sm py-3">
                        R$ {typeof existingTransactions[0].amount === 'string' 
                          ? parseFloat(existingTransactions[0].amount).toFixed(2).replace('.', ',') 
                          : existingTransactions[0].amount.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell className="text-right text-sm py-3">
                        R$ {transaction.amount.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processando...' : 'Confirmar Baixa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
