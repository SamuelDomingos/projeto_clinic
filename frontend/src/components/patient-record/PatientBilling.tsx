import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Receipt, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Patient } from "@/lib/api";

interface PatientBillingProps {
  patient: Patient;
}

export function PatientBilling({ patient }: PatientBillingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Dados mockados de faturas/orçamentos específicos do paciente
  const patientInvoices = [
    {
      id: 1,
      number: "ORÇ-001",
      type: "budget",
      guide: "GUIA-001",
      date: "2024-06-01",
      receiptNumber: "",
      invoiceNumber: "",
      performedBy: "Dr. João Silva",
      items: [
        { id: 1, procedure: "Botox", quantity: 1, price: 800, total: 800 },
        { id: 2, procedure: "Limpeza de Pele", quantity: 1, price: 150, total: 150 }
      ],
      subtotal: 950,
      discount: 50,
      total: 900,
      status: "pending"
    },
    {
      id: 2,
      number: "FAT-001",
      type: "invoice",
      guide: "GUIA-002",
      date: "2024-05-25",
      receiptNumber: "REC-001",
      invoiceNumber: "NF-001",
      performedBy: "Dr. Ana Costa",
      items: [
        { id: 1, procedure: "Consulta Dermatológica", quantity: 1, price: 200, total: 200 }
      ],
      subtotal: 200,
      discount: 0,
      total: 200,
      status: "paid"
    },
    {
      id: 3,
      number: "ORÇ-002",
      type: "budget",
      guide: "GUIA-003",
      date: "2024-06-15",
      receiptNumber: "",
      invoiceNumber: "",
      performedBy: "Dr. João Silva",
      items: [
        { id: 1, procedure: "Preenchimento", quantity: 1, price: 600, total: 600 }
      ],
      subtotal: 600,
      discount: 0,
      total: 600,
      status: "approved"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'invoiced': return <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'invoiced': return 'Faturado';
      case 'paid': return 'Pago';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'budget' ? 'Orçamento' : 'Fatura';
  };

  const filteredInvoices = patientInvoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.guide.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesType = typeFilter === "all" || invoice.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (invoiceId: number) => {
    console.log(`Visualizar detalhes da fatura ${invoiceId} do paciente ${patient.name}`);
  };

  const handleEditInvoice = (invoiceId: number) => {
    console.log(`Editar fatura ${invoiceId} do paciente ${patient.name}`);
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    console.log(`Excluir fatura ${invoiceId} do paciente ${patient.name}`);
  };

  // Calcular totais
  const totalValue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidValue = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingValue = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Geral</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pago</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {paidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                R$ {pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por número ou guia..."
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
                    <label className="text-sm font-medium text-foreground">Tipo</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="invoiced">Faturado</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faturas/Orçamentos */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Faturas e Orçamentos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${invoice.type === 'budget' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <Receipt className={`h-4 w-4 ${invoice.type === 'budget' ? 'text-blue-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString('pt-BR')} - {invoice.performedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invoice.status)}
                      <span className="text-sm text-muted-foreground">
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(invoice.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditInvoice(invoice.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
