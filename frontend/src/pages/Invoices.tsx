import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invoiceApi, patientApi, protocolApi } from '@/lib/api';
import type { InvoiceWithDetails, Invoice, CreateInvoiceData, UpdateInvoiceData, Patient, Protocol } from '../lib/api';
import { InvoiceList } from "@/components/invoice/InvoiceList";
import { InvoiceDetails } from "@/components/invoice/InvoiceDetails";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Invoices() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "create" | "details">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, patientsData, protocolsData] = await Promise.all([
        invoiceApi.list(),
        patientApi.getPatients(),
        protocolApi.list()
      ]);

      // Enrich invoices with patient data
      const enrichedInvoices = invoicesData.map(invoice => ({
        ...invoice,
        patient: patientsData.find(p => p.id === invoice.patientId),
        number: `INV-${invoice.id.slice(0, 8)}`,
        guide: `GUIDE-${invoice.id.slice(0, 8)}`
      }));

      setInvoices(enrichedInvoices);
      setPatients(patientsData);
      setProtocols(protocolsData);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvoiceClick = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setViewMode("details");
  };

  const handleConvertToInvoice = async (invoiceId: string) => {
    try {
      const updatedInvoice = await invoiceApi.convertToInvoice(invoiceId);
      setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...updatedInvoice, patient: inv.patient, number: inv.number, guide: inv.guide } : inv));
      setSelectedInvoice({ ...updatedInvoice, patient: selectedInvoice?.patient, number: selectedInvoice?.number, guide: selectedInvoice?.guide });
      toast.success("Orçamento convertido para fatura com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao converter orçamento");
    }
  };

  const handleDeleteInvoice = async (invoice: InvoiceWithDetails) => {
    try {
      await invoiceApi.delete(invoice.id);
      setInvoices(invoices.filter(inv => inv.id !== invoice.id));
      setViewMode("list");
      toast.success("Registro excluído com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir registro");
    }
  };

  const handleCreateInvoice = async (formData: CreateInvoiceData) => {
    if (!user?.name) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const createData: CreateInvoiceData = {
        type: "budget",
        patientId: formData.patientId,
        performedBy: user.name,
        items: formData.items.map(item => ({
          protocolId: item.protocolId,
          quantity: item.quantity,
          price: item.price
        })),
        discount: formData.discount,
        discountType: formData.discountType,
        payments: [],
        notes: formData.notes || ""
      };
      console.log('Itens enviados para criação:', formData.items);
      console.log('Payload enviado para criação de orçamento:', createData);

      const newInvoice = await invoiceApi.create(createData);
      console.log('Fatura criada (resposta do backend):', newInvoice);

      const enrichedInvoice: InvoiceWithDetails = {
        ...newInvoice,
        patient: patients.find(p => p.id === newInvoice.patientId),
        number: `INV-${newInvoice.id.slice(0, 8)}`,
        guide: `GUIDE-${newInvoice.id.slice(0, 8)}`
      };

      setInvoices([...invoices, enrichedInvoice]);
      setViewMode("list");
      toast.success("Orçamento criado com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar orçamento");
    }
  };

  const handleUpdateInvoice = async (id: string, data: Partial<Invoice>) => {
    try {
      // Garantir que o status seja um dos valores permitidos
      const updateData: UpdateInvoiceData = {
        ...data,
        status: data.status === "invoiced" ? "approved" : data.status as "pending" | "approved" | "paid" | "cancelled"
      };

      const updatedInvoice = await invoiceApi.update(id, updateData);
      const enrichedInvoice: InvoiceWithDetails = {
        ...updatedInvoice,
        patient: patients.find(p => p.id === updatedInvoice.patientId),
        guide: `GUIDE-${updatedInvoice.id.slice(0, 8)}`
      };

      setInvoices(invoices.map(inv => inv.id === id ? enrichedInvoice : inv));
      setSelectedInvoice(enrichedInvoice);
      toast.success("Registro atualizado com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar registro");
    }
  };

  if (loading || !protocols || protocols.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (viewMode === "create") {
    return (
      <InvoiceForm 
        onBack={() => setViewMode("list")} 
        protocols={protocols} 
        patients={patients}
        onSubmit={handleCreateInvoice}
      />
    );
  }

  if (viewMode === "details" && selectedInvoice) {
    return (
      <InvoiceDetails 
        invoice={selectedInvoice} 
        protocols={protocols}
        onBack={() => setViewMode("list")}
        onConvertToInvoice={handleConvertToInvoice}
        onUpdate={handleUpdateInvoice}
        onDelete={handleDeleteInvoice}
      />
    );
  }

  return (
    <InvoiceList
      invoices={invoices}
      onInvoiceClick={handleInvoiceClick}
      onCreateClick={() => setViewMode("create")}
      onExportClick={() => {/* TODO: Implement export */}}
      onDeleteClick={handleDeleteInvoice}
      loading={loading}
    />
  );
}
