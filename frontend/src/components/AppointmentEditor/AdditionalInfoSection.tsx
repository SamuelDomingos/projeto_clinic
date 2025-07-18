import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdditionalInfoSectionProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  occupation: string;
  setOccupation: (value: string) => void;
  maritalStatus: string;
  setMaritalStatus: (value: string) => void;
  bloodType: string;
  setBloodType: (value: string) => void;
  allergies: string;
  setAllergies: (value: string) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  isOpen,
  setIsOpen,
  occupation,
  setOccupation,
  maritalStatus,
  setMaritalStatus,
  bloodType,
  setBloodType,
  allergies,
  setAllergies,
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
        >
          <span className="font-medium">Informações adicionais</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-sm font-medium">Profissão</Label>
            <Input
              id="occupation"
              className="h-11 border-2 focus:border-primary"
              placeholder="Ex: Engenheiro"
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritalStatus" className="text-sm font-medium">Estado Civil</Label>
            <Input
              id="maritalStatus"
              className="h-11 border-2 focus:border-primary"
              placeholder="Ex: Solteiro(a)"
              value={maritalStatus}
              onChange={e => setMaritalStatus(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType" className="text-sm font-medium">Tipo Sanguíneo</Label>
            <Input
              id="bloodType"
              className="h-11 border-2 focus:border-primary"
              placeholder="Ex: O+"
              value={bloodType}
              onChange={e => setBloodType(e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-full">
            <Label htmlFor="allergies" className="text-sm font-medium">Alergias</Label>
            <Textarea
              id="allergies"
              className="min-h-20 border-2 focus:border-primary"
              placeholder="Liste as alergias conhecidas"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdditionalInfoSection; 