import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string | number;
  type: "revenue" | "expense";
  amount: number;
  description: string;
  category: string;
  categoryName: string;
  dueDate: string;
  status: string;
  relatedEntityType?: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  searchTerm: string;
  typeFilter: string;
  categoryFilter: string;
  dateFilter: string;
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
  if (id.startsWith("stock_")) {
    return {
      label: "Estoque",
      icon: <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-1" />,
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      border: "border-l-4 border-orange-500 dark:border-orange-400",
      valueColor: "text-red-700 dark:text-red-400",
      category: "Estoque"
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
  onDelete
}: TransactionListProps & { onEdit?: (transaction: Transaction) => void, onDelete?: (transaction: Transaction) => void }) {
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  const filteredTransactions = useMemo(() => {
    console.log('Transações recebidas:', transactions);
    console.log('Filtros atuais:', { searchTerm, typeFilter, categoryFilter, dateFilter });

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
          // Formato de mês/ano
          const [year, month] = dateFilter.split('-');
          if (year && month) {
            const filterDate = new Date(parseInt(year), parseInt(month) - 1);
            const transactionDate = new Date(transaction.dueDate || transaction.createdAt);
            dateMatch = isWithinInterval(transactionDate, {
              start: startOfMonth(filterDate),
              end: endOfMonth(filterDate)
            });
          }
        }
      }

      console.log('Transação:', {
        id: transaction.id,
        description: transaction.description,
        type: transaction.type,
        dueDate: transaction.dueDate,
        createdAt: transaction.createdAt,
        matches: { searchMatch, typeMatch, categoryMatch, dateMatch }
      });

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
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Criação</th>
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Competência</th>
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Tipo</th>
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Descrição</th>
            <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-200">Categoria</th>
            <th className="text-right p-4 font-medium text-gray-700 dark:text-gray-200">Valor</th>
            <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => {
              const info = getTypeInfo(transaction);
              const isInstallment = transaction.description.includes('(') && transaction.description.includes('/');
              const isRecurring = transaction.description.includes('recorrente');
              
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
                >
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {format(new Date(transaction.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {transaction.dueDate ? format(new Date(transaction.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    {info.icon}
                    <Badge className={info.badge}>{info.label}</Badge>
                    {isInstallment && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Parcela
                      </Badge>
                    )}
                    {isRecurring && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        Recorrente
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs">
                      {info.category}
                    </Badge>
                  </td>
                  <td className={`p-4 text-right font-bold ${info.valueColor}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setOpenMenuId(openMenuId === transaction.id ? null : transaction.id)}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {openMenuId === transaction.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 z-10 mt-2 w-32 bg-white dark:bg-gray-900 rounded shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => { onEdit && onEdit(transaction); setOpenMenuId(null); }}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                            onClick={() => { onDelete && onDelete(transaction); setOpenMenuId(null); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Deletar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
} 