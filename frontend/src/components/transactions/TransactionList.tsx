import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Download,
  SquareCheckBig
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { Transaction } from "@/lib/api/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
  searchTerm: string;
  typeFilter: string;
  categoryFilter: string;
  dateFilter: string;
  bankAccounts: any[];
}

const getTypeInfo = (transaction: Transaction) => {
  const id = String(transaction.id);
  
  if (id.startsWith("sale_")) {
    return {
      label: "Venda",
      icon: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />,
      badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      border: "border-l-4 border-green-500 dark:border-green-400",
      valueColor: "text-green-700 dark:text-green-300",
      category: "Vendas"
    };
  }
  // Novo: identifica por nome da categoria
  if (
    id.startsWith("stock_") ||
    transaction.categoryName?.toLowerCase().includes("stock") ||
    transaction.categoryName?.toLowerCase().includes("estoque")
  ) {
    return {
      label: "Estoque",
      icon: <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-1" />,
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      border: "border-l-4 border-orange-500 dark:border-orange-400",
      valueColor: "text-red-700 dark:text-red-400",
      category: transaction.categoryName
    };
  }
  if (transaction.type === "revenue") {
    return {
      label: "Entrada",
      icon: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />,
      badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      border: "border-l-4 border-green-500 dark:border-green-400",
      valueColor: "text-green-700 dark:text-green-300",
      category: transaction.categoryName
    };
  }
  return {
    label: "Despesa",
    icon: <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />,
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    border: "border-l-4 border-red-500 dark:border-red-400",
    valueColor: "text-red-700 dark:text-red-400",
    category: transaction.categoryName
  };
};

export function TransactionList({ 
  transactions, 
  searchTerm, 
  typeFilter, 
  categoryFilter, 
  dateFilter,
  onEdit,
  onDelete,
  bankAccounts
}: TransactionListProps & { onEdit?: (transaction: Transaction) => void, onDelete?: (transaction: Transaction) => void }) {
  // Remover o estado openMenuId pois não precisamos mais
  // const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // NOVO: controla se está em modo edição

  const filteredTransactions = useMemo(() => {

    return transactions.filter(transaction => {
      // Filtro de busca
      const searchMatch = !searchTerm || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de tipo
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;

      // Filtro de categoria
      const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;

      // Filtro de data
      // Filtro de data
      let dateMatch = true;
      if (dateFilter) {
        if (dateFilter.includes(' to ')) {
          // Formato de intervalo de datas
          const [startDateStr, endDateStr] = dateFilter.split(' to ');
          if (startDateStr && endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            const transactionDate = new Date(transaction.dueDate || transaction.createdAt);
            dateMatch = isWithinInterval(transactionDate, {
              start: startDate,
              end: endDate
            });
          }
        } else {
          // Formato de mês/ano - USAR COMPETÊNCIA PRIMEIRO
          const [year, month] = dateFilter.split('-');
          if (year && month) {
            const filterCompetence = `${month.padStart(2, '0')}/${year}`;
            
            // Primeiro tenta comparar com o campo competence
            if (transaction.competence) {
              dateMatch = transaction.competence === filterCompetence;
            } else {
              // Fallback: usar dueDate se não houver competence
              const filterDate = new Date(parseInt(year), parseInt(month) - 1);
              const transactionDate = new Date(transaction.dueDate || transaction.createdAt);
              dateMatch = isWithinInterval(transactionDate, {
                start: startOfMonth(filterDate),
                end: endOfMonth(filterDate)
              });
            }
          }
        }
      }

      return searchMatch && typeMatch && categoryMatch && dateMatch;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter]);

  if (filteredTransactions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        Nenhuma transação encontrada
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border dark:border-gray-700">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Data</th>
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Competência</th>
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Descrição</th>
            <th className="text-right p-4 font-medium text-gray-700 dark:text-gray-200">Valor R$</th>
            <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-200">Recebido</th>
            <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-200">NFSe</th>
            <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-200">Download</th>
            <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-200">Baixar</th>
            <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => {
              const info = getTypeInfo(transaction);
              const isInstallment = transaction.description.includes('(') && transaction.description.includes('/');
              const isRecurring = transaction.description.includes('recorrente');
              const isEntrada = transaction.type === 'revenue';
              const isSaida = transaction.type === 'expense';
              // Exemplo: status de recebido
              const recebidoStatus = isEntrada ? (transaction.status === 'completed' ? 'Sim' : 'Não') : '-';
              // Verificar se há documento vinculado - lógica mais específica
              const hasDownload = Boolean(
                (transaction.documentNumber && transaction.documentNumber.trim() !== '') ||
                (transaction.boletoNumber && transaction.boletoNumber.trim() !== '') ||
                (transaction.invoiceId && transaction.invoiceId.trim() !== '') ||
                // Para reference, verificar se não é apenas um número simples (ID)
                (transaction.reference && 
                 transaction.reference.trim() !== '' && 
                 transaction.reference.length > 3 && 
                 !(/^\d+$/.test(transaction.reference.trim())))
              );
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.2,
                    delay: index * 0.03,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${info.border}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { 
                    setSelectedTransaction({
                      ...transaction,
                      id: String(transaction.id),
                      updatedAt: transaction.updatedAt || transaction.createdAt
                    }); 
                    setEditMode(false); // VISUALIZAÇÃO
                    setDetailsOpen(true); 
                  }}
                >
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {transaction.createdAt ? format(new Date(transaction.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {transaction.competence || 
                     (transaction.dueDate ? format(new Date(transaction.dueDate), "MM/yyyy", { locale: ptBR }) : "-")}
                  </td>
                  <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </td>
                  <td className={`p-4 text-right font-bold ${info.valueColor}`}> 
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="p-4 text-center">
                    {isEntrada ? (
                      transaction.status === 'completed' ? (
                        <span title="Recebido">
                          <CheckCircle className="inline w-5 h-5 text-green-600 dark:text-green-400" />
                        </span>
                      ) : (
                        <span title="Não recebido">
                          <Circle className="inline w-5 h-5 text-gray-400" />
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">
                    {hasDownload ? (
                      <button 
                        title="Download" 
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:scale-110 transform" 
                        onClick={e => { 
                          e.stopPropagation(); 
                          // Implementar lógica de download baseada no tipo de documento
                          console.log('Download documento:', {
                            reference: transaction.reference,
                            documentNumber: transaction.documentNumber,
                            boletoNumber: transaction.boletoNumber,
                            invoiceId: transaction.invoiceId
                          });
                        }}
                      >
                        <Download className="inline w-5 h-5" />
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button title="Dar baixa" className="text-blue-600 hover:text-blue-800" onClick={e => { e.stopPropagation(); setSelectedTransaction({ ...transaction, id: String(transaction.id), updatedAt: transaction.updatedAt || transaction.createdAt }); setEditMode(true); setDetailsOpen(true); }}>
                      <SquareCheckBig className="inline w-5 h-5" />
                    </button>
                  </td>
                  <td className="p-4 text-center relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="sr-only">Abrir menu de ações</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) {
                              onEdit(transaction);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete) {
                              onDelete(transaction);
                            }
                          }}
                          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Deletar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
      <TransactionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        transaction={selectedTransaction}
        editMode={editMode} // NOVO: passa o modo de edição
        bankAccounts={bankAccounts}
      />
    </div>
  );
}