import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/lib/api/types/transaction";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { transactionService } from "@/lib/api/services/transactionService";
import { CheckCircle2, SplitSquareHorizontal } from "lucide-react";

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  editMode?: boolean; // NOVO: modo de edição
  bankAccounts: Array<{ id: string; name: string }>;
}

export const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({ open, onOpenChange, transaction, editMode = false, bankAccounts }) => {
  // Estados para os campos editáveis
  const [valorPago, setValorPago] = useState('');
  const [pagoEm, setPagoEm] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [pagoVia, setPagoVia] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [recebidoEm, setRecebidoEm] = useState('');
  const [recebidoVia, setRecebidoVia] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pré-preencher campos quando a transação já foi paga
  useEffect(() => {
    if (transaction && transaction.status === 'completed') {
      // Para transações já pagas, pré-preencher os campos com os dados existentes
      if (transaction.paidAmount) {
        setValorPago(transaction.paidAmount.toString());
      }
      if (transaction.paidAt) {
        const paidDate = new Date(transaction.paidAt);
        const formattedDate = paidDate.toISOString().split('T')[0];
        setPagoEm(formattedDate);
        setRecebidoEm(formattedDate);
      }
      if (transaction.paymentMethod) {
        setFormaPagamento(transaction.paymentMethod);
      }
      if (transaction.paidViaId) {
        setPagoVia(transaction.paidViaId);
        setRecebidoVia(transaction.paidViaId);
      }
      if (transaction.documentNumber) {
        setNumeroDocumento(transaction.documentNumber);
      }
    } else {
      // Limpar campos quando não há transação ou transação não foi paga
      setValorPago('');
      setPagoEm('');
      setFormaPagamento('');
      setPagoVia('');
      setNumeroDocumento('');
      setRecebidoEm('');
      setRecebidoVia('');
    }
  }, [transaction]);

  if (!transaction) return null;

  const competencia = transaction.dueDate ? format(new Date(transaction.dueDate), 'MM/yyyy') : '-';
  const vencimento = transaction.dueDate ? format(new Date(transaction.dueDate), 'dd/MM/yyyy') : '-';
  const valor = formatCurrency(transaction.amount);
  const status = transaction.status === 'completed' ? 'Pago' : transaction.status === 'pending' ? 'Pendente' : transaction.status;
  const isEntrada = transaction.type === 'revenue';
  const isSaida = transaction.type === 'expense';

  async function handleBaixa(tipo: 'total' | 'parcial') {
    if (!transaction) return;
    setLoading(true);
    setError(null);
    try {
      let paymentData: Record<string, unknown> = {};
      
      if (isSaida) {
        paymentData = {
          paidAmount: valorPago || transaction.amount,
          paidAt: pagoEm,
          paymentMethod: formaPagamento, // Apenas um campo
          paidViaId: pagoVia, // Conta bancária
          documentNumber: numeroDocumento,
          status: 'completed'
        };
      } else if (isEntrada) {
        paymentData = {
          paidAt: recebidoEm,
          paymentMethod: formaPagamento, // Apenas um campo
          paidViaId: recebidoVia, // Conta bancária
          status: 'completed'
        };
      }
      
      await transactionService.update(transaction.id, paymentData);
      onOpenChange(false);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Erro ao dar baixa');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] min-w-[300px] max-h-[95vh] overflow-x-auto box-border p-0 bg-white dark:bg-gray-900">
        <DialogTitle>Detalhes da Transação</DialogTitle>
        <DialogDescription>Veja os detalhes da transação financeira selecionada.</DialogDescription>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b px-4 md:px-8 pt-4 md:pt-6 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className={isSaida ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
              {transaction.categoryName || transaction.category}
            </span>
            <span>-</span>
            <span className="uppercase">{transaction.description}</span>
          </div>
          <div className="flex flex-col md:items-end mt-4 md:mt-0 gap-1">
            {isEntrada && <span className="text-xs text-gray-500 dark:text-gray-400">Data Recebimento</span>}
            {isSaida && <span className="text-xs text-gray-500 dark:text-gray-400">Vencimento</span>}
            <span className="text-lg font-semibold">{vencimento}</span>
            <div className="flex gap-4 mt-2">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">Valor {isEntrada ? 'R$' : 'original R$'}</span>
                <span className="text-lg font-bold">{valor}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">Valor {isEntrada ? 'Líquido R$' : (isSaida ? 'Saldo a pagar R$' : '')}</span>
                <span className="text-lg font-bold">{valor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECEBIDO VIA para entradas */}
        {isEntrada && (
          <div className="flex flex-col md:flex-row justify-between px-4 md:px-8 pt-4 pb-2">
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Recebido via</div>
              <div className="font-medium">-</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Data Recebimento</div>
              <div className="font-medium">-</div>
            </div>
          </div>
        )}

        {/* Grid de informações principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 px-4 md:px-8 py-4 md:py-6 border-b dark:border-gray-800">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Competência</div>
            <div className="font-medium">{transaction.competence || competencia}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Número do documento</div>
            <div className="font-medium">{transaction.documentNumber || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Unidade</div>
            <div className="font-medium">{transaction.unitData?.name || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Categoria</div>
            <div className="font-medium">{transaction.categoryName || transaction.category}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Classificação</div>
            <div className="font-medium">-</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Descrição</div>
            <div className="font-medium">{transaction.description}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Centro de Custo</div>
            <div className="font-medium">{transaction.costCenterData?.name || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">%</div>
            <div className="font-medium">100.00%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Valor</div>
            <div className="font-medium">{valor}</div>
          </div>
        </div>

        {/* Discriminação do Lote para entradas */}
        {/* {isEntrada && (
          <div className="px-4 md:px-8 py-4">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Discriminação do Lote</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-200">Data Transação</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-200">Data Atendimento</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-200">Descrição</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-200">NSU(DOC/CV/ID)</th>
                    <th className="px-2 py-1 text-right font-medium text-gray-700 dark:text-gray-200">Valor</th>
                    <th className="px-2 py-1 text-right font-medium text-gray-700 dark:text-gray-200">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {/* Seção Dados da Baixa para saídas */}
        {isSaida && editMode && (
          <div className="bg-blue-50 dark:bg-gray-800/60 rounded-b-lg px-4 md:px-8 py-4 md:py-6 mt-0">
            <div className="font-semibold text-gray-700 dark:text-gray-200 mb-4">DADOS DA BAIXA</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Valor pago</div>
                <Input type="text" value={valorPago} onChange={e => setValorPago(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pago em</div>
                <Input type="date" value={pagoEm} onChange={e => setPagoEm(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Forma de Pagamento</div>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debito">Débito em conta</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pago via</div>
                <Select value={pagoVia} onValueChange={setPagoVia}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Número do documento</div>
                <Input type="text" value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        {/* Seção Dados da Baixa para entradas */}
        {isEntrada && editMode && (
          <div className="bg-blue-50 dark:bg-gray-800/60 rounded-b-lg px-4 md:px-8 py-4 md:py-6 mt-0">
            <div className="font-semibold text-gray-700 dark:text-gray-200 mb-4">DADOS DA BAIXA</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Recebido em</div>
                <Input type="date" value={recebidoEm} onChange={e => setRecebidoEm(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Forma de Pagamento</div>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Recebido via</div>
                <Select value={recebidoVia} onValueChange={setRecebidoVia}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 md:px-8 py-4 border-t dark:border-gray-800">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </button>
          {isSaida && editMode && (
            <button
              className="px-4 py-2 rounded flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-sm transition-colors"
              onClick={() => handleBaixa('parcial')}
              disabled={loading}
              title="Baixar parcialmente esta despesa"
            >
              <SplitSquareHorizontal className="w-5 h-5" /> Baixa parcial
            </button>
          )}
          {editMode && (
            <button
              className="px-4 py-2 rounded flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
              onClick={() => handleBaixa('total')}
              disabled={loading}
              title="Dar baixa total nesta transação"
            >
              <CheckCircle2 className="w-5 h-5" /> {loading ? 'Salvando...' : 'Baixa total'}
            </button>
          )}
        </div>
        {error && <div className="text-red-600 text-sm px-8 pb-2">{error}</div>}
      </DialogContent>
    </Dialog>
  );
};