import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoiceApi, protocolApi, type Invoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { BudgetDrawer } from "@/components/invoice/BudgetDrawer";
import type { Protocol } from "@/lib/api/types/protocol";

interface PatientInvoicesProps {
  patientId: string;
}

const typeBadge = (type: string) => {
  if (type === "invoice") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" variant="outline">Fatura</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" variant="outline">Orçamento</Badge>;
};

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" variant="outline">Pendente</Badge>;
    case "approved":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" variant="outline">Aprovado</Badge>;
    case "paid":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" variant="outline">Pago</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" variant="outline">Cancelado</Badge>;
    case "invoiced":
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300" variant="outline">Faturado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function PatientInvoices({ patientId }: PatientInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  useEffect(() => {
    if (patientId) {
      loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    if (openModal) {
      loadProtocols();
    }
  }, [openModal]);

  const loadProtocols = async () => {
    setLoadingProtocols(true);
    try {
      const data = await protocolApi.list();
      setProtocols(data);
    } finally {
      setLoadingProtocols(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const data = await invoiceApi.getByPatient(patientId);
      setInvoices(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar faturas/orçamentos",
        variant: "destructive"
      });
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenModal(true);
  };

  const handleNewBudget = () => {
    setSelectedInvoice(null);
    setOpenModal(true);
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await invoiceApi.delete(invoiceToDelete.id);
      toast({ title: "Sucesso", description: "Fatura/Orçamento deletado com sucesso!" });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      loadInvoices();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao deletar fatura/orçamento", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Faturas e Orçamentos</CardTitle>
        <Button onClick={handleNewBudget} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
        </Button>
      </CardHeader>
      <CardContent>
        {loadingInvoices ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse rounded-lg overflow-hidden">
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-semibold text-muted-foreground text-left">Número</th>
                  <th className="p-4 font-semibold text-muted-foreground text-left">Data</th>
                  <th className="p-4 font-semibold text-muted-foreground text-left">Tipo</th>
                  <th className="p-4 font-semibold text-muted-foreground text-left">Valor</th>
                  <th className="p-4 font-semibold text-muted-foreground text-left">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((inv, idx) => (
                      <tr
                        key={inv.id}
                        onClick={() => handleRowClick(inv)}
                        className={
                          `border-b border-border transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-muted' : 'bg-muted/50 dark:bg-background'} hover:bg-primary/5 focus-within:bg-primary/10`
                        }
                        tabIndex={0}
                      >
                        <td className="p-4 text-muted-foreground font-medium">{inv.number}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(inv.date)}</td>
                        <td className="p-4">{typeBadge(inv.type)}</td>
                        <td className="p-4 text-muted-foreground font-semibold">
                          R$ {isNaN(Number(inv.total)) ? "0,00" : Number(inv.total).toFixed(2)}
                        </td>
                        <td className="p-4">{statusBadge(inv.status)}</td>
                        <td className="p-4">
                          <AlertDialog open={deleteDialogOpen && invoiceToDelete?.id === inv.id} onOpenChange={open => {
                            setDeleteDialogOpen(open);
                            if (!open) setInvoiceToDelete(null);
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={e => { e.stopPropagation(); setInvoiceToDelete(inv); setDeleteDialogOpen(true); }}
                                title="Deletar"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar deleção</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar esta fatura/orçamento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground text-lg">
                      Nenhuma fatura ou orçamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <BudgetDrawer open={openModal} onOpenChange={setOpenModal} protocols={protocols} loadingProtocols={loadingProtocols} invoiceToEdit={selectedInvoice} onSaved={loadInvoices} patientId={patientId} />
    </Card>
  );
} 