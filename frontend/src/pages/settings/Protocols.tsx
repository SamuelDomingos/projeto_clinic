import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProtocolDialog } from "@/components/settings/Record/Protocol/ProtocolDialog";
import { ProtocolsTable } from "@/components/settings/Record/Protocol/ProtocolsTable";
import { protocolApi, type Protocol } from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
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

export default function ProtocolsSettings() {
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [protocolToDelete, setProtocolToDelete] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProtocols = async () => {
    try {
      setLoading(true);
      const response = await protocolApi.list();
      setProtocols(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Erro ao carregar protocolos:', error);
      setProtocols([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar protocolos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProtocols();
  }, []);

  const handleEdit = async (protocol: Protocol) => {
    try {
      const fullProtocol = await protocolApi.getById(protocol.id);
      console.log('Protocolo detalhado carregado:', fullProtocol);
      setSelectedProtocol(fullProtocol);
      setShowDialog(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar detalhes do protocolo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: string) => {
    setProtocolToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!protocolToDelete) return;
    try {
      await protocolApi.delete(protocolToDelete);
      await loadProtocols();
      toast({
        title: "Sucesso",
        description: "Protocolo excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir protocolo:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir protocolo",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setProtocolToDelete(null);
    }
  };

  const handleSave = async (protocol: Omit<Protocol, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (selectedProtocol) {
        await protocolApi.update(selectedProtocol.id, protocol);
      } else {
        await protocolApi.create(protocol);
      }
      setShowDialog(false);
      setSelectedProtocol(null);
      await loadProtocols();
    } catch (error) {
      console.error('Erro ao salvar protocolo:', error);
      throw error; // Propaga o erro para ser tratado no ProtocolDialog
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Protocolos</h1>
        <Button onClick={() => {
          setSelectedProtocol(null);
          setShowDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Protocolo
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <ProtocolsTable
          protocols={protocols}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ProtocolDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setSelectedProtocol(null);
        }}
        protocol={selectedProtocol}
        onSave={handleSave}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este protocolo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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