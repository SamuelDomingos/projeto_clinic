import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PaymentMethodsTable } from "./PaymentMethodsTable";
import { PaymentMethodDetails } from "./PaymentMethodDetails";
import { paymentMethodApi, PaymentMethod } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodsProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PaymentMethods({ onView, onEdit, onDelete }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodApi.list();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar métodos de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      setSelectedMethod(method);
      setIsDetailsOpen(true);
    }
    onView?.(id);
  };

  const handleEdit = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      setSelectedMethod(method);
      setIsDetailsOpen(true);
    }
    onEdit?.(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await paymentMethodApi.delete(id);
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Sucesso",
        description: "Método de pagamento excluído com sucesso",
      });
      onDelete?.(id);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir método de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Partial<PaymentMethod>) => {
    try {
      let response;
      if (selectedMethod?.id) {
        // Se tem ID, é uma atualização
        response = await paymentMethodApi.update(selectedMethod.id, data);
        setPaymentMethods(prev => prev.map(m => m.id === selectedMethod.id ? response : m));
        toast({
          title: "Sucesso",
          description: "Método de pagamento atualizado com sucesso",
        });
      } else {
        // Se não tem ID, é uma criação
        const createData = {
          name: data.name || '',
          type: data.type || 'credit_card',
          personType: data.personType || 'pf',
          beneficiaryId: data.beneficiaryId || '',
          beneficiaryType: data.beneficiaryType || 'user',
          machineName: data.machineName || '',
          debitTerm: data.debitTerm,
          firstInstallmentTerm: data.firstInstallmentTerm,
          otherInstallmentsTerm: data.otherInstallmentsTerm,
          maxInstallments: data.maxInstallments,
          anticipationTerm: data.anticipationTerm,
          acceptedBrands: data.acceptedBrands || [],
          debitFee: data.debitFee,
          creditFees: data.creditFees || {},
          status: data.status || 'active'
        };
        response = await paymentMethodApi.create(createData);
        setPaymentMethods(prev => [...prev, response]);
        toast({
          title: "Sucesso",
          description: "Método de pagamento criado com sucesso",
        });
      }
      setIsDetailsOpen(false);
      setSelectedMethod(null);
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar método de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setSelectedMethod({
      id: '',
      name: '',
      type: 'credit_card',
      personType: 'pf',
      beneficiaryId: '',
      beneficiaryType: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>
              Gerencie as formas de pagamento disponíveis
            </CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Método
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <PaymentMethodsTable
          paymentMethods={paymentMethods}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>

      <PaymentMethodDetails
        method={selectedMethod || {
          id: '',
          name: '',
          type: 'credit_card',
          personType: 'pf',
          beneficiaryId: '',
          beneficiaryType: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedMethod(null);
        }}
        onSave={handleSave}
      />
    </Card>
  );
} 