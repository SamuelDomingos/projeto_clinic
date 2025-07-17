import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Invoice, InvoiceWithDetails } from "@/lib/api";

interface InvoiceListProps {
  invoices: InvoiceWithDetails[];
  onInvoiceClick: (invoice: InvoiceWithDetails) => void;
  onCreateClick: () => void;
  onExportClick: () => void;
  onDeleteClick?: (invoice: InvoiceWithDetails) => void;
  loading?: boolean;
}

export function InvoiceList({
  invoices,
  onInvoiceClick,
  onCreateClick,
  onExportClick,
  onDeleteClick,
  loading = false,
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "budget" | "invoice">(
    "all"
  );
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceWithDetails | null>(null);

  const getStatusIcon = (invoice: InvoiceWithDetails) => {
    const totalPayments = (invoice.payments ?? []).reduce((sum, payment) => sum + payment.totalValue, 0);
    const isFullyPaid = totalPayments >= invoice.total;
    const hasPartialPayment = totalPayments > 0;

    if (invoice.status === 'cancelled') {
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }

    if (invoice.status === 'paid' || isFullyPaid) {
      return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }

    if (hasPartialPayment) {
      return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }

    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusLabel = (invoice: InvoiceWithDetails) => {
    const totalPayments = (invoice.payments ?? []).reduce((sum, payment) => sum + payment.totalValue, 0);
    const isFullyPaid = totalPayments >= invoice.total;
    const hasPartialPayment = totalPayments > 0;

    if (invoice.status === 'cancelled') {
      return 'Cancelado';
    }

    if (invoice.status === 'paid' || isFullyPaid) {
      return 'Pago';
    }

    if (hasPartialPayment) {
      return 'Parcialmente Pago';
    }

    return 'Pendente';
  };

  const getTypeLabel = (type: string) => {
    return type === "budget" ? "Orçamento" : "Fatura";
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.guide?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    const matchesType = typeFilter === "all" || invoice.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRowClick = (invoice: InvoiceWithDetails, e: React.MouseEvent) => {
    // Se o clique foi em um botão de ação, não faz nada
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onInvoiceClick(invoice);
  };

  const handleDeleteClick = (invoice: InvoiceWithDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceToDelete(invoice);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      onDeleteClick?.(invoiceToDelete);
      setInvoiceToDelete(null);
    }
  };

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Faturas e Orçamentos
          </h1>
          <p className="text-muted-foreground">
            Gestão de orçamentos e faturamento
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onExportClick}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={onCreateClick}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-input"
                />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-popover border-border">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Filtros</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tipo
                    </label>
                    <Select
                      value={typeFilter}
                      onValueChange={(value: "all" | "budget" | "invoice") =>
                        setTypeFilter(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="budget">Orçamento</SelectItem>
                        <SelectItem value="invoice">Fatura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: "all" | "pending" | "paid") =>
                        setStatusFilter(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faturas/Orçamentos */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            <span>Lista de Vendas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Data
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Guia
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Nr. NF
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer"
                    onClick={(e) => handleRowClick(invoice, e)}
                  >
                    <td className="p-4 text-foreground">
                      {new Date(invoice.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 text-foreground">
                      {invoice.patient?.name}
                    </td>
                    <td className="p-4 text-foreground">{invoice.guide}</td>
                    <td className="p-4 font-medium text-foreground">
                      {invoice.number}
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      R${" "}
                      {parseFloat(invoice.total.toString()).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          invoice.type === "budget"
                            ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                        }
                      >
                        {getTypeLabel(invoice.type)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice)}
                        <span className="text-sm">
                          {getStatusLabel(invoice)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDeleteClick(invoice, e)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {invoiceToDelete?.type === "budget" ? "este orçamento" : "esta fatura"}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
