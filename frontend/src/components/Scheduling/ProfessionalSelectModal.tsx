import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/lib/api/types';
import { CheckCircle2 } from 'lucide-react';

interface ProfessionalSelectModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  professionals: User[];
  selectedProfessionals: string[];
  onSelectionChange: (selectedIds: string[]) => void; // Alterado para aceitar um array de IDs
  onConfirm: (selectedIds: string[]) => void; // Alterado para passar os IDs selecionados
}

export function ProfessionalSelectModal({
  isOpen,
  onOpenChange,
  professionals,
  selectedProfessionals,
  onSelectionChange,
  onConfirm,
}: ProfessionalSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithSchedule, setShowOnlyWithSchedule] = useState(false);

  const handleSelect = (id: string) => {
    const newSelection = selectedProfessionals.includes(id)
      ? selectedProfessionals.filter((profId) => profId !== id)
      : [...selectedProfessionals, id];
    onSelectionChange(newSelection);
  };

  const filteredProfessionals = professionals.filter((prof) => {
    const nameMatch = prof.name.toLowerCase().includes(searchTerm.toLowerCase());
    // TODO: Implementar a lógica de 'somente com agenda hoje'
    return nameMatch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar profissionais</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between mt-4">
          <Input
            placeholder="Buscar Profissional"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={showOnlyWithSchedule} onCheckedChange={() => setShowOnlyWithSchedule(!showOnlyWithSchedule)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Somente com agenda hoje
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4 max-h-[50vh] overflow-y-auto">
          {filteredProfessionals.map((prof) => (
            <div
              key={prof.id}
              onClick={() => handleSelect(prof.id)}
              className={`border rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer relative ${selectedProfessionals.includes(prof.id) ? 'border-primary' : ''}`}>
              {selectedProfessionals.includes(prof.id) && (
                <CheckCircle2 className="h-5 w-5 text-green-500 absolute top-1 right-1" />
              )}
              <Avatar className="w-16 h-16 mb-2">
                <AvatarImage src={prof.avatarUrl} alt={prof.name} />
                <AvatarFallback>{prof.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-center">{prof.name}</span>
              <span className="text-xs text-muted-foreground text-center">{prof.specialty || ''}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => onConfirm(selectedProfessionals)}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}