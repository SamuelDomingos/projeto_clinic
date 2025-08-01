import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { TransactionSummary } from "@/lib/api/types/transaction";
import { NumberFlow } from "@/components/ui/number-flow";

interface FinancialSummaryProps {
  summary: TransactionSummary;
  onFilterByType?: (type: 'revenue' | 'expense' | 'all') => void;
}

export function FinancialSummary({ summary, onFilterByType }: FinancialSummaryProps) {
  const revenue = Number(summary?.revenue) || 0;
  const expenses = Number(summary?.expenses) || 0;
  const balance = Number(summary?.balance) || 0;
  const pendingRevenue = Number(summary?.pendingRevenue) || 0;
  const pendingExpenses = Number(summary?.pendingExpenses) || 0;
  const pendingBalance = Number(summary?.pendingBalance) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card 
        className="cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-100 hover:shadow-xl hover:shadow-green-100 dark:hover:shadow-green-900/20 hover:-translate-y-1 border-l-4 border-green-500 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
        onClick={() => onFilterByType?.('revenue')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Receitas</p>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2 transition-all duration-300">
                <NumberFlow value={revenue} currency delay={200} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Pendente: <NumberFlow value={pendingRevenue} currency delay={400} />
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 transition-all duration-300 hover:scale-110" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-100 hover:shadow-xl hover:shadow-red-100 dark:hover:shadow-red-900/20 hover:-translate-y-1 border-l-4 border-red-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        onClick={() => onFilterByType?.('expense')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Despesas</p>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2 transition-all duration-300">
                <NumberFlow value={expenses} currency delay={200} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Pendente: <NumberFlow value={pendingExpenses} currency delay={400} />
              </p>
            </div>
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-100 hover:shadow-xl hover:-translate-y-1 border-l-4 ${
          balance >= 0 
            ? 'border-green-500 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 hover:shadow-green-100 dark:hover:shadow-green-900/20' 
            : 'border-red-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:shadow-red-100 dark:hover:shadow-red-900/20'
        }`}
        onClick={() => onFilterByType?.('all')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Saldo</p>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} flex items-center gap-2 transition-all duration-300`}>
                <NumberFlow value={balance} currency delay={200} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Pendente: <NumberFlow value={pendingBalance} currency delay={400} />
              </p>
            </div>
            <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-all duration-300 hover:scale-110`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
