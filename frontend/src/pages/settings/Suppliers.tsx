import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supplierApi, type Supplier, type CreateSupplierData } from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { SuppliersTable } from "@/components/settings/Supplier/SuppliersTable";
import { SupplierDialog } from "@/components/settings/Supplier/SupplierDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function SuppliersSettings() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDeleteSupplierDialog, setShowDeleteSupplierDialog] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersResponse = await supplierApi.getSuppliers();
      setSuppliers(suppliersResponse as Supplier[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar fornecedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowSupplierDialog(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierDialog(true);
  };

  const handleDeleteSupplier = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
      setSupplierToDelete(supplier);
      setShowDeleteSupplierDialog(true);
    }
  };

  const confirmDeleteSupplier = async () => {
    if (supplierToDelete) {
      try {
        await supplierApi.deleteSupplier(supplierToDelete.id);
        setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
        setShowDeleteSupplierDialog(false);
        toast({
          title: "Sucesso",
          description: "Fornecedor excluído permanentemente",
        });
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir fornecedor",
          variant: "destructive",
        });
      } finally {
        setSupplierToDelete(null);
      }
    }
  };

  const handleSaveSupplier = async (data: Partial<Supplier>) => {
    try {
      if (selectedSupplier) {
        const response = await supplierApi.updateSupplier(selectedSupplier.id, data);
        setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? response : s));
        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso",
        });
      } else {
        const createData: CreateSupplierData = {
          name: data.name || '',
          ...(data.email && { email: data.email }),
          ...(data.company && { company: data.company }),
          ...(data.phone && { phone: data.phone }),
          ...(data.category && { category: data.category }),
          ...(data.cnpj && { cnpj: data.cnpj }),
          ...(data.address && { address: data.address }),
          ...(data.contactPerson && { contactPerson: data.contactPerson }),
          status: data.status || 'active'
        };
        const response = await supplierApi.createSupplier(createData);
        setSuppliers(prev => [...prev, response]);
        toast({
          title: "Sucesso",
          description: "Fornecedor criado com sucesso",
        });
      }
      setShowSupplierDialog(false);
      setSelectedSupplier(null);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor",
        variant: "destructive",
      });
    }
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
        <CardTitle>Fornecedores</CardTitle>
        <CardDescription>
          Gerencie os fornecedores do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={handleCreateSupplier}>
            Novo Fornecedor
          </Button>
        </div>
        <SuppliersTable
          suppliers={suppliers}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
        />
      </CardContent>
      <SupplierDialog
        open={showSupplierDialog}
        onOpenChange={(open) => {
          setShowSupplierDialog(open);
          if (!open) setSelectedSupplier(null);
        }}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
      />
      <AlertDialog open={showDeleteSupplierDialog} onOpenChange={setShowDeleteSupplierDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão permanente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o fornecedor {supplierToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSupplier}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 