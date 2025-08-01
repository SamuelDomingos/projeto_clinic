import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { type User } from "@/lib/api";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<User>) => void;
  user?: User | null;
}

export function UserDialog({ open, onOpenChange, onSave, user }: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {user ? 'Atualize os dados do usuário' : 'Preencha os dados do novo usuário'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          user={user}
        />
      </DialogContent>
    </Dialog>
  );
} 